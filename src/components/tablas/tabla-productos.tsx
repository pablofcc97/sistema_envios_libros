'use client'

import { useState } from 'react'
import { PackagePlus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { eliminarProducto } from '@/app/productos/actions'
import FormularioProductoForm from '@/components/formularios/formulario-producto-form'

// Suite Modular
import { BotonCopiar } from '@/components/ui/boton-copiar'
import { TablaPaginacion } from '@/components/tablas/comunes/tabla-paginacion'
import { BarraBusqueda } from '@/components/tablas/comunes/barra-busqueda'
import { AccionesDropdown } from '@/components/tablas/comunes/acciones-dropdown'
import { useSeleccionLote } from '@/hooks/use-seleccion-lote'

export function TablaProductos({ productosIniciales }: { productosIniciales: any[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [productoAEditar, setProductoAEditar] = useState<any>(null)
  const [modalCrearOpen, setModalCrearOpen] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [filasPorPagina, setFilasPorPagina] = useState(10)

  // 1. Filtro dinámico por Nombre o Año
  const productosFiltrados = productosIniciales.filter((p) => {
    const q = busqueda.toLowerCase()
    return p.nombre.toLowerCase().includes(q) || (p.anio && String(p.anio).includes(q))
  })

  // 2. Paginación
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  )

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
            placeholder="Buscar por Nombre o Año..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            onClick={() => setModalCrearOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm cursor-pointer"
          >
            <PackagePlus className="w-4 h-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

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
                <th className="p-3">Año / Edición</th>
                <th className="p-3">Precio Referencial</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {productosPaginados.map((producto) => (
                <tr key={producto.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(producto.id)}
                      onChange={() => toggleSeleccionFila(producto.id)}
                      className="w-5 h-5 cursor-pointer rounded accent-blue-600 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-100 flex items-center gap-1.5">
                      <span>{producto.nombre}</span>
                      <BotonCopiar valor={producto.nombre} tooltip="Copiar Nombre" />
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 font-mono">
                      {producto.anio || 2026}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-emerald-400 font-bold">
                    {producto.precio !== null && producto.precio !== undefined
                      ? `S/ ${Number(producto.precio).toFixed(2)}`
                      : 'S/ 0.00'}
                  </td>
                  <td className="p-3 text-right">
                    <AccionesDropdown
                      acciones={[
                        {
                          label: 'Editar Producto',
                          icon: <Edit className="w-4 h-4 text-slate-400" />,
                          onClick: () => setProductoAEditar(producto),
                        },
                        {
                          label: 'Eliminar Producto',
                          icon: <Trash2 className="w-4 h-4" />,
                          variant: 'destructive',
                          onClick: async () => {
                            if (confirm(`¿Eliminar ${producto.nombre}?`)) {
                              const res = await eliminarProducto(producto.id)
                              if (!res.success) alert(res.error)
                            }
                          },
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No se encontraron productos coincidentes.
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
            setFilasPorPagina(filas)
            setPaginaActual(1)
          }}
        />
      </div>

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
    </div>
  )
}