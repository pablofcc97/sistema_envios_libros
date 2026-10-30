'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeftRight, ArrowDownToLine, Boxes, ClipboardList, Search, SlidersHorizontal } from 'lucide-react'
import { ajustarStock, registrarEntradaStock, transferirStock } from '@/app/inventario/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Almacen = { id: string; nombre: string }
type Producto = {
  id: string
  nombre: string
  nombreCorto: string | null
  destacado: boolean
  esPack: boolean
  componentesPack: { productoId: string; cantidad: number; producto: { id: string; nombre: string; nombreCorto: string | null } }[]
}
type Existencia = { almacenId: string; productoId: string; cantidad: number }
type Movimiento = {
  id: string
  tipo: string
  cantidad: number
  motivo: string | null
  almacenId: string
  createdAt: Date | string
  producto: { nombre: string; nombreCorto: string | null }
  almacen: { nombre: string }
}
type TipoAccion = 'entrada' | 'ajuste' | 'transferencia'

const claseSelect = 'h-10 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-base text-slate-100 outline-none focus-visible:border-blue-500'

function etiquetaMovimiento(movimiento: Movimiento) {
  if (movimiento.tipo === 'ENTRADA') return 'Entrada'
  if (movimiento.tipo === 'AJUSTE') return 'Ajuste'
  if (movimiento.tipo === 'TRANSFERENCIA') return movimiento.cantidad < 0 ? 'Transferencia saliente' : 'Transferencia entrante'
  if (movimiento.tipo === 'SALIDA_ENVIO') return 'Salida por envío'
  if (movimiento.tipo === 'REVERSION_ENVIO') return 'Reversión de envío'
  return movimiento.tipo
}

function fechaLegible(fecha: Date | string) {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Lima',
  }).format(new Date(fecha))
}

export function TablaExistencias({
  almacenes,
  productos,
  existencias,
  movimientos,
}: {
  almacenes: Almacen[]
  productos: Producto[]
  existencias: Existencia[]
  movimientos: Movimiento[]
}) {
  const [almacenId, setAlmacenId] = useState(almacenes[0]?.id ?? '')
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState<'individuales' | 'packs'>('individuales')
  const [accion, setAccion] = useState<{ tipo: TipoAccion; producto: Producto } | null>(null)
  const [cantidad, setCantidad] = useState('1')
  const [destinoId, setDestinoId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [confirmacion, setConfirmacion] = useState('')

  const existenciaPorProducto = useMemo(
    () => new Map(existencias.filter((item) => item.almacenId === almacenId).map((item) => [item.productoId, item.cantidad])),
    [existencias, almacenId],
  )
  const stockPack = (pack: Producto) => {
    if (!pack.esPack || pack.componentesPack.length === 0) return 0
    return Math.min(...pack.componentesPack.map((componente) =>
      Math.floor((existenciaPorProducto.get(componente.productoId) ?? 0) / componente.cantidad),
    ))
  }
  const productosCategoria = useMemo(
    () => productos.filter((producto) => categoria === 'packs' ? producto.esPack : !producto.esPack),
    [productos, categoria],
  )
  const productosFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase('es')
    if (!consulta) return productosCategoria
    return productosCategoria.filter((producto) =>
      producto.nombre.toLocaleLowerCase('es').includes(consulta)
      || (producto.nombreCorto ?? '').toLocaleLowerCase('es').includes(consulta)
      || (producto.esPack && producto.componentesPack.some(({ producto: componente }) =>
        componente.nombre.toLocaleLowerCase('es').includes(consulta)
        || (componente.nombreCorto ?? '').toLocaleLowerCase('es').includes(consulta),
      )),
    )
  }, [productosCategoria, busqueda])
  const movimientosAlmacen = useMemo(
    () => movimientos.filter((movimiento) => movimiento.almacenId === almacenId),
    [movimientos, almacenId],
  )
  const almacenActual = almacenes.find((almacen) => almacen.id === almacenId)
  const almacenesDestino = almacenes.filter((almacen) => almacen.id !== almacenId)

  const abrirAccion = (tipo: TipoAccion, producto: Producto) => {
    setAccion({ tipo, producto })
    setCantidad(tipo === 'ajuste' ? String(existenciaPorProducto.get(producto.id) ?? 0) : '1')
    setDestinoId(almacenesDestino[0]?.id ?? '')
    setMotivo('')
    setError('')
  }

  const cerrarAccion = (abierta: boolean) => {
    if (cargando) return
    if (!abierta) {
      setAccion(null)
      setError('')
    }
  }

  const guardarMovimiento = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!accion || !almacenId) return

    const cantidadNumerica = Number(cantidad)
    setCargando(true)
    setError('')

    const resultado = accion.tipo === 'entrada'
      ? await registrarEntradaStock(almacenId, accion.producto.id, cantidadNumerica, motivo)
      : accion.tipo === 'ajuste'
        ? await ajustarStock(almacenId, accion.producto.id, cantidadNumerica, motivo)
        : await transferirStock(almacenId, destinoId, accion.producto.id, cantidadNumerica, motivo)

    setCargando(false)

    if (!resultado.success) {
      setError(resultado.error)
      return
    }

    setConfirmacion(accion.tipo === 'entrada'
      ? 'Entrada registrada.'
      : accion.tipo === 'ajuste'
        ? 'Existencia ajustada.'
        : 'Transferencia completada.')
    setAccion(null)
  }

  return (
    <div className="space-y-6">
      {confirmacion && (
        <div role="status" className="flex items-center justify-between rounded-lg border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
          {confirmacion}
          <button type="button" onClick={() => setConfirmacion('')} className="text-xs text-emerald-200 underline">Cerrar</button>
        </div>
      )}

      {almacenes.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <Boxes className="mx-auto mb-3 h-9 w-9 text-slate-600" />
          <h2 className="font-semibold text-slate-200">Crea un almacén para empezar</h2>
          <p className="mt-1 text-sm text-slate-400">Las existencias se registran por producto y ubicación.</p>
          <Link href="/inventario/almacenes" className="mt-4 inline-flex text-sm font-medium text-blue-300 hover:text-blue-200">
            Ir a Almacenes
          </Link>
        </div>
      ) : (
        <>
          <Tabs value={categoria} onValueChange={(value) => setCategoria(value as 'individuales' | 'packs')} className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-end sm:justify-between">
            <label className="flex items-center gap-2 w-full text-xs text-slate-400 sm:max-w-xs">
              Almacén
              <select value={almacenId} onChange={(event) => setAlmacenId(event.target.value)} className={claseSelect}>
                {almacenes.map((almacen) => <option key={almacen.id} value={almacen.id}>{almacen.nombre}</option>)}
              </select>
            </label>
            <label className="relative w-full sm:max-w-sm">
              <span className="sr-only">Buscar producto</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder={categoria === 'packs' ? 'Buscar packs o sus componentes...' : 'Buscar productos individuales...'} className="border-slate-800 bg-slate-950 pl-9 text-slate-100" />
            </label>
          </div>

          <TabsList className="w-full justify-start border border-slate-800 bg-slate-900 p-1 text-slate-400 sm:w-fit">
            <TabsTrigger value="individuales" className="cursor-pointer data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Productos individuales ({productos.filter((producto) => !producto.esPack).length})
            </TabsTrigger>
            <TabsTrigger value="packs" className="cursor-pointer data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Packs ({productos.filter((producto) => producto.esPack).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={categoria}>
          {productosCategoria.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">
              {categoria === 'packs' ? 'Aún no hay packs configurados.' : <>Aún no hay productos individuales en el catálogo. <Link href="/productos" className="text-blue-300 underline">Añade productos</Link> para registrar existencias.</>}
            </div>
          ) : (
            <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">{almacenActual?.nombre} · {productosFiltrados.length} productos</h2>
                <span className="text-xs text-slate-500">Los packs muestran cuántos pueden armarse con el stock actual</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-950/40 text-xs uppercase text-slate-400">
                    <tr>
                      <th scope="col" className="p-4">Producto</th>
                      <th scope="col" className="p-4 text-center">Existencia</th>
                      <th scope="col" className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {productosFiltrados.map((producto) => {
                      const stock = producto.esPack ? stockPack(producto) : existenciaPorProducto.get(producto.id) ?? 0
                      return (
                        <tr key={producto.id} className="hover:bg-slate-800/40">
                          <td className="p-4">
                            <div className="font-medium text-slate-100">{producto.nombreCorto || producto.nombre}</div>
                            {producto.nombreCorto && <div className="mt-0.5 text-xs text-slate-500">{producto.nombre}</div>}
                            {producto.esPack && (
                              <div className="mt-1 text-xs text-blue-300">
                                Pack calculado · {producto.componentesPack.length} componentes
                                {producto.componentesPack.length > 0 && (
                                  <span className="text-slate-500"> · {producto.componentesPack.map(({ producto: componente, cantidad }) => `${componente.nombreCorto || componente.nombre} ×${cantidad}`).join(', ')}</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex min-w-12 justify-center rounded-full border px-3 py-1 font-mono font-semibold tabular-nums ${stock > 0 ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300' : 'border-amber-800 bg-amber-950/40 text-amber-300'}`}>
                              {stock}
                            </span>
                          </td>
                          <td className="p-3">
                            {producto.esPack ? (
                              <p className="text-right text-xs text-slate-500">Gestiona el stock desde sus componentes</p>
                            ) : <div className="flex justify-end gap-2">
                              <Button type="button" size="sm" onClick={() => abrirAccion('entrada', producto)} className="h-8 cursor-pointer gap-1.5 bg-emerald-700/80 text-white hover:bg-emerald-600">
                                <ArrowDownToLine className="h-3.5 w-3.5" /> Entrada
                              </Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => abrirAccion('ajuste', producto)} className="h-8 cursor-pointer gap-1.5 border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800">
                                <SlidersHorizontal className="h-3.5 w-3.5" /> Ajustar
                              </Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => abrirAccion('transferencia', producto)} disabled={almacenesDestino.length === 0} className="h-8 cursor-pointer gap-1.5 border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
                                <ArrowLeftRight className="h-3.5 w-3.5" /> Transferir
                              </Button>
                            </div>}
                          </td>
                        </tr>
                      )
                    })}
                    {productosFiltrados.length === 0 && (
                      <tr><td colSpan={3} className="p-8 text-center text-slate-500">{categoria === 'packs' ? 'No se encontraron packs coincidentes.' : 'No se encontraron productos individuales coincidentes.'}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          </TabsContent>
          </Tabs>

          <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/60 px-4 py-3">
              <ClipboardList className="h-4 w-4 text-blue-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Movimientos recientes · {almacenActual?.nombre}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th scope="col" className="p-3">Fecha</th>
                    <th scope="col" className="p-3">Tipo</th>
                    <th scope="col" className="p-3">Producto</th>
                    <th scope="col" className="p-3 text-right">Variación</th>
                    <th scope="col" className="p-3">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {movimientosAlmacen.slice(0, 20).map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td className="whitespace-nowrap p-3 text-xs text-slate-500">{fechaLegible(movimiento.createdAt)}</td>
                      <td className="p-3">{etiquetaMovimiento(movimiento)}</td>
                      <td className="p-3">{movimiento.producto.nombreCorto || movimiento.producto.nombre}</td>
                      <td className={`p-3 text-right font-mono font-semibold tabular-nums ${movimiento.cantidad > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {movimiento.cantidad > 0 ? '+' : ''}{movimiento.cantidad}
                      </td>
                      <td className="max-w-xs truncate p-3 text-xs text-slate-500">{movimiento.motivo || '—'}</td>
                    </tr>
                  ))}
                  {movimientosAlmacen.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Todavía no hay movimientos en este almacén.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <Sheet open={Boolean(accion)} onOpenChange={cerrarAccion}>
        <SheetContent className="overflow-y-auto border-slate-800 bg-slate-950 p-6 text-slate-100 sm:max-w-md">
          <SheetHeader className="border-b border-slate-800 pb-3">
            <SheetTitle className="text-xl font-bold text-white">
              {accion?.tipo === 'entrada' ? 'Registrar entrada' : accion?.tipo === 'ajuste' ? 'Ajustar existencia' : 'Transferir stock'}
            </SheetTitle>
          </SheetHeader>
          {accion && (
            <form onSubmit={guardarMovimiento} className="mt-6 space-y-5">
              {error && <div role="alert" className="rounded-lg border border-red-800 bg-red-950/60 p-3 text-sm text-red-300">{error}</div>}
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                <p className="text-xs text-slate-500">Producto</p>
                <p className="mt-1 font-medium text-slate-100">{accion.producto.nombreCorto || accion.producto.nombre}</p>
                <p className="mt-1 text-xs text-slate-400">{almacenActual?.nombre} · Existencia actual: {existenciaPorProducto.get(accion.producto.id) ?? 0}</p>
              </div>

              {accion.tipo === 'transferencia' && (
                <label className="block space-y-1 text-sm text-slate-300">
                  Almacén de destino
                  <select required value={destinoId} onChange={(event) => setDestinoId(event.target.value)} className={claseSelect}>
                    {almacenesDestino.map((almacen) => <option key={almacen.id} value={almacen.id}>{almacen.nombre}</option>)}
                  </select>
                </label>
              )}

              <label className="block space-y-1 text-sm text-slate-300">
                {accion.tipo === 'ajuste' ? 'Nueva existencia total' : 'Cantidad'}
                <Input
                  autoFocus
                  required
                  type="number"
                  min={accion.tipo === 'ajuste' ? 0 : 1}
                  step={1}
                  value={cantidad}
                  onChange={(event) => setCantidad(event.target.value)}
                  className="border-slate-800 bg-slate-900 text-slate-100"
                />
              </label>

              <label className="block space-y-1 text-sm text-slate-300">
                Motivo (opcional)
                <Input
                  maxLength={200}
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value)}
                  placeholder={accion.tipo === 'entrada' ? 'Ej. Compra o reposición' : accion.tipo === 'ajuste' ? 'Ej. Conteo físico' : 'Ej. Reposición en otra sede'}
                  className="border-slate-800 bg-slate-900 text-slate-100"
                />
              </label>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => cerrarAccion(false)} disabled={cargando} className="cursor-pointer border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800">
                  Cancelar
                </Button>
                <Button type="submit" disabled={cargando} className="cursor-pointer bg-blue-600 text-white hover:bg-blue-500">
                  {cargando ? 'Guardando...' : 'Guardar movimiento'}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
