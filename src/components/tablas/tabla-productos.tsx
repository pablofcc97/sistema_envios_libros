'use client'

import { useState } from 'react'
import { PackagePlus, Settings, SquarePen, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { eliminarProducto } from '@/app/productos/actions'
import FormularioProductoForm from '@/components/formularios/formulario-producto-form'
import { GestionComponentesPack } from '@/components/productos/gestion-componentes-pack'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Suite Modular
import { BotonCopiar } from '@/components/ui/boton-copiar'
import { TablaPaginacion } from '@/components/tablas/comunes/tabla-paginacion'
import { BarraBusqueda } from '@/components/tablas/comunes/barra-busqueda'
import { useSeleccionLote } from '@/hooks/use-seleccion-lote'
import { usePreferenciaFilas } from '@/hooks/use-preferencia-filas'

export function TablaProductos({ productosIniciales }: { productosIniciales: any[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [productoAEditar, setProductoAEditar] = useState<any>(null)
  const [packAConfigurar, setPackAConfigurar] = useState<any>(null)
  const [modalCrearOpen, setModalCrearOpen] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const { filasPorPagina, guardarFilasPorPagina } = usePreferenciaFilas()
  const [categoria, setCategoria] = useState<'individuales' | 'packs'>('individuales')

  // 1. Filtro dinámico por Nombre, Nombre Corto o Año
  const productosCategoria = productosIniciales.filter((p) => categoria === 'packs' ? p.esPack : !p.esPack)
  const productosFiltrados = productosCategoria.filter((p) => {
    const q = busqueda.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(q) ||
      (p.nombreCorto && p.nombreCorto.toLowerCase().includes(q)) ||
      (p.anio && String(p.anio).includes(q)) ||
      (p.esPack && p.componentesPack?.some(({ producto }: any) =>
        producto.nombre.toLowerCase().includes(q) ||
        (producto.nombreCorto && producto.nombreCorto.toLowerCase().includes(q)),
      ))
    )
  })

  // 2. Paginación
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  )
  const productosIndividuales = productosIniciales.filter((producto) => !producto.esPack)

  // 3. Custom Hook de Selección
  const {
    seleccionados,
    todosPaginaSeleccionados,
    toggleSeleccionarPagina,
    toggleSeleccionFila,
    limpiarSeleccion,
  } = useSeleccionLote(productosPaginados, productosFiltrados)

  return (
    <div className="space-y-4">
      {/* Controles Superiores */}
      <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full md:w-auto">
          <BarraBusqueda
            value={busqueda}
            onChange={(valor) => {
              setBusqueda(valor)
              setPaginaActual(1)
              limpiarSeleccion()
            }}
            placeholder={categoria === 'packs' ? 'Buscar packs o sus componentes...' : 'Buscar productos por nombre, nombre corto o año...'}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            onClick={() => setModalCrearOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm cursor-pointer font-medium"
          >
            <PackagePlus className="w-4 h-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <Tabs value={categoria} onValueChange={(value) => {
        setCategoria(value as 'individuales' | 'packs')
        setPaginaActual(1)
        limpiarSeleccion()
      }} className="space-y-4">
      <TabsList className="w-full justify-start border border-slate-800 bg-slate-900 p-1 text-slate-400 sm:w-fit">
        <TabsTrigger value="individuales" className="cursor-pointer data-[state=active]:bg-slate-800 data-[state=active]:text-white">
          Productos individuales ({productosIniciales.filter((p) => !p.esPack).length})
        </TabsTrigger>
        <TabsTrigger value="packs" className="cursor-pointer data-[state=active]:bg-slate-800 data-[state=active]:text-white">
          Packs ({productosIniciales.filter((p) => p.esPack).length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={categoria}>
      {/* Tabla */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={todosPaginaSeleccionados}
                    onChange={toggleSeleccionarPagina}
                    className="w-5 h-5 cursor-pointer rounded accent-blue-600 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors"
                  />
                </th>
                <th className="p-3">Nombre del Producto / Libro</th>
                <th className="p-3">Nombre Corto</th>
                <th className="p-3 text-center">Tipo</th>
                <th className="p-3 text-center">Destacado</th>
                <th className="p-3 text-center">Año / Edición</th>
                <th className="p-3 text-center">Precio Referencial</th>
                <th className="p-3 text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {productosPaginados.map((producto) => (
                <tr key={producto.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Checkbox */}
                  <td className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(producto.id)}
                      onChange={() => toggleSeleccionFila(producto.id)}
                      className="w-5 h-5 cursor-pointer rounded accent-blue-600 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors"
                    />
                  </td>

                  {/* Nombre Completo */}
                  <td className="p-4">
                    <div className="font-medium text-slate-100 flex items-center gap-1.5">
                      <span>{producto.nombre}</span>
                      <BotonCopiar valor={producto.nombre} tooltip="Copiar Nombre" />
                    </div>
                  </td>

                  {/* Nombre Corto */}
                  <td className="p-3">
                    <span className="font-semibold text-blue-400">
                      {producto.nombreCorto || '-'}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    {producto.esPack ? (
                      <Badge variant="outline" className="border-blue-800 bg-blue-950/50 text-blue-200">
                        Pack · {producto.componentesPack.length} componentes
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-500">Individual</span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    {producto.destacado ? (
                      <Badge variant="outline" className="gap-1 border-amber-700 bg-amber-950/50 text-amber-300">
                        <Star className="h-3 w-3 fill-current" />
                        Destacado
                      </Badge>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  {/* Año / Edición */}
                  <td className="p-3 text-center">
                    <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 font-mono">
                      {producto.anio || 2026}
                    </Badge>
                  </td>

                  {/* Precio */}
                  <td className="p-3 text-center font-mono text-emerald-400 font-bold">
                    {producto.precio !== null && producto.precio !== undefined
                      ? `S/ ${Number(producto.precio).toFixed(2)}`
                      : 'S/ 0.00'}
                  </td>

                  {/* Acciones directas visibles */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {producto.esPack && (
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => setPackAConfigurar(producto)}
                          className="h-8 w-8 cursor-pointer rounded-lg border border-blue-500/50 bg-blue-600/80 text-white shadow-sm hover:bg-blue-500"
                          title="Configurar componentes del pack"
                          aria-label={`Configurar componentes de ${producto.nombre}`}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Editar */}
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => setProductoAEditar(producto)}
                        className="h-8 w-8 bg-amber-600/80 hover:bg-amber-500 text-white border border-amber-500/50 rounded-lg shadow-sm cursor-pointer transition-colors"
                        title="Editar Producto"
                      >
                        <SquarePen className="w-4 h-4" />
                      </Button>

                      {/* Eliminar */}
                      <Button
                        type="button"
                        size="icon"
                        onClick={async () => {
                          if (confirm(`¿Eliminar ${producto.nombre}?`)) {
                            const res = await eliminarProducto(producto.id)
                            if (!res.success) alert(res.error)
                          }
                        }}
                        className="h-8 w-8 bg-rose-600/80 hover:bg-rose-500 text-white border border-rose-500/50 rounded-lg shadow-sm cursor-pointer transition-colors"
                        title="Eliminar Producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    {categoria === 'packs' ? 'No se encontraron packs coincidentes.' : 'No se encontraron productos individuales coincidentes.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablaPaginacion
          totalRegistros={productosFiltrados.length}
          paginaActual={paginaActual}
          filasPorPagina={filasPorPagina}
          onPaginaChange={setPaginaActual}
          onFilasPorPaginaChange={(filas) => {
            guardarFilasPorPagina(filas)
            setPaginaActual(1)
          }}
        />
      </div>
      </TabsContent>
      </Tabs>

      {/* Sheet Crear */}
      <Sheet open={modalCrearOpen} onOpenChange={setModalCrearOpen}>
        <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-md p-6 overflow-y-auto">
          <SheetHeader className="pb-3 border-b border-slate-800">
            <SheetTitle className="text-xl font-bold text-white">Nuevo Producto</SheetTitle>
          </SheetHeader>
          <FormularioProductoForm onSuccess={() => setModalCrearOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Sheet Editar */}
      <Sheet open={!!productoAEditar} onOpenChange={(open) => !open && setProductoAEditar(null)}>
        <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-md p-6 overflow-y-auto">
          <SheetHeader className="pb-3 border-b border-slate-800">
            <SheetTitle className="text-xl font-bold text-white">Editar Producto</SheetTitle>
          </SheetHeader>
          {productoAEditar && (
            <FormularioProductoForm
              producto={productoAEditar}
              onSuccess={() => setProductoAEditar(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!packAConfigurar} onOpenChange={(open) => !open && setPackAConfigurar(null)}>
        <SheetContent className="overflow-y-auto border-slate-800 bg-slate-950 p-6 text-slate-100 sm:max-w-lg">
          <SheetHeader className="border-b border-slate-800 pb-3">
            <SheetTitle className="text-xl font-bold text-white">
              Componentes del pack
            </SheetTitle>
          </SheetHeader>
          {packAConfigurar && (
            <GestionComponentesPack
              packId={packAConfigurar.id}
              packNombre={packAConfigurar.nombreCorto || packAConfigurar.nombre}
              componentesIniciales={packAConfigurar.componentesPack}
              productosDisponibles={productosIndividuales}
              onSuccess={() => setPackAConfigurar(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
