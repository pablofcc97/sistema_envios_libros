'use client'

import { useMemo, useState } from 'react'
import { Building2, Plus, Search, SquarePen, Trash2, Warehouse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { actualizarAlmacen, crearAlmacen, eliminarAlmacen } from '@/app/inventario/almacenes/actions'

type AlmacenFila = {
  id: string
  nombre: string
  _count: {
    couriersConAlmacenDefault: number
    envios: number
  }
}

export function TablaAlmacenes({ almacenesIniciales }: { almacenesIniciales: AlmacenFila[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [almacenAEditar, setAlmacenAEditar] = useState<AlmacenFila | null>(null)
  const [nombre, setNombre] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const almacenesFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase()
    if (!consulta) return almacenesIniciales
    return almacenesIniciales.filter((almacen) =>
      almacen.nombre.toLocaleLowerCase().includes(consulta),
    )
  }, [almacenesIniciales, busqueda])

  const abrirNuevo = () => {
    setAlmacenAEditar(null)
    setNombre('')
    setError('')
    setFormularioAbierto(true)
  }

  const abrirEdicion = (almacen: AlmacenFila) => {
    setAlmacenAEditar(almacen)
    setNombre(almacen.nombre)
    setError('')
    setFormularioAbierto(true)
  }

  const cerrarFormulario = (abierto: boolean) => {
    setFormularioAbierto(abierto)
    if (!abierto) {
      setAlmacenAEditar(null)
      setNombre('')
      setError('')
    }
  }

  const guardarAlmacen = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCargando(true)
    setError('')

    const resultado = almacenAEditar
      ? await actualizarAlmacen(almacenAEditar.id, nombre)
      : await crearAlmacen(nombre)

    setCargando(false)

    if (!resultado.success) {
      setError(resultado.error)
      return
    }

    cerrarFormulario(false)
  }

  const borrarAlmacen = async (almacen: AlmacenFila) => {
    if (!confirm(`¿Eliminar el almacén “${almacen.nombre}”?`)) return

    const resultado = await eliminarAlmacen(almacen.id)
    if (!resultado.success) setError(resultado.error)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar almacén..."
            aria-label="Buscar almacén"
            className="border-slate-800 bg-slate-950 pl-9 text-slate-100"
          />
        </label>

        <Button
          type="button"
          onClick={abrirNuevo}
          className="w-full cursor-pointer gap-2 bg-blue-600 text-white hover:bg-blue-500 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Añadir almacén
        </Button>
      </div>

      {error && !formularioAbierto && (
        <div role="alert" className="rounded-lg border border-red-800 bg-red-950/60 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
        <div className="border-b border-slate-800 bg-slate-950/60 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Almacenes registrados ({almacenesFiltrados.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/40 text-xs uppercase text-slate-400">
              <tr>
                <th scope="col" className="p-4">Almacén</th>
                <th scope="col" className="p-4 text-center">Couriers predeterminadas</th>
                <th scope="col" className="p-4 text-center">Envíos asociados</th>
                <th scope="col" className="w-28 p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {almacenesFiltrados.map((almacen) => (
                <tr key={almacen.id} className="transition-colors hover:bg-slate-800/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-blue-400">
                        <Warehouse className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-slate-100">{almacen.nombre}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center tabular-nums">{almacen._count.couriersConAlmacenDefault}</td>
                  <td className="p-4 text-center tabular-nums">{almacen._count.envios}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => abrirEdicion(almacen)}
                        title={`Editar ${almacen.nombre}`}
                        aria-label={`Editar ${almacen.nombre}`}
                        className="h-8 w-8 cursor-pointer rounded-lg border border-amber-500/50 bg-amber-600/80 text-white hover:bg-amber-500"
                      >
                        <SquarePen className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => void borrarAlmacen(almacen)}
                        title={`Eliminar ${almacen.nombre}`}
                        aria-label={`Eliminar ${almacen.nombre}`}
                        className="h-8 w-8 cursor-pointer rounded-lg border border-rose-500/50 bg-rose-600/80 text-white hover:bg-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {almacenesFiltrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                    <p className="text-sm font-medium text-slate-300">
                      {almacenesIniciales.length === 0
                        ? 'Aún no hay almacenes registrados.'
                        : 'No se encontraron almacenes con ese nombre.'}
                    </p>
                    {almacenesIniciales.length === 0 && (
                      <p className="mt-1 text-xs text-slate-500">
                        Añade el primer almacén para poder asignarlo a couriers y envíos.
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={formularioAbierto} onOpenChange={cerrarFormulario}>
        <SheetContent className="overflow-y-auto border-slate-800 bg-slate-950 p-6 text-slate-100 sm:max-w-md">
          <SheetHeader className="border-b border-slate-800 pb-3">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold text-white">
              <Warehouse className="h-5 w-5 text-blue-400" />
              {almacenAEditar ? 'Editar almacén' : 'Añadir almacén'}
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={guardarAlmacen} className="mt-6 space-y-5">
            {error && (
              <div role="alert" className="rounded-lg border border-red-800 bg-red-950/60 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <label className="block space-y-2 text-sm text-slate-300">
              Nombre del almacén
              <Input
                autoFocus
                required
                maxLength={80}
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej. Almacén principal"
                className="border-slate-800 bg-slate-900 text-slate-100"
              />
            </label>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => cerrarFormulario(false)}
                disabled={cargando}
                className="cursor-pointer border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={cargando || !nombre.trim()}
                className="cursor-pointer gap-2 bg-blue-600 text-white hover:bg-blue-500"
              >
                {almacenAEditar ? <SquarePen className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {cargando ? 'Guardando...' : almacenAEditar ? 'Guardar cambios' : 'Crear almacén'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
