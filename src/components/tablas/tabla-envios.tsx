'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileSpreadsheet, 
  Trash2, 
  Edit, 
  MoreHorizontal, 
  Printer,
  X,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModalMarcarRegistrado } from '@/components/modales/modal-marcar-registrado'
import { eliminarEnvio, marcarComoRotulados } from '@/app/envios/actions'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import FormularioEditarEnvio from '@/components/formularios/editar-envio-form'

// Subcomponentes modulares
import { BotonCopiar } from '@/components/ui/boton-copiar'
import { TablaPaginacion } from '@/components/tablas/comunes/tabla-paginacion'
import { BarraBusqueda } from '@/components/tablas/comunes/barra-busqueda'
import { AccionesDropdown } from '@/components/tablas/comunes/acciones-dropdown'

// Custom Hook
import { useSeleccionLote } from '@/hooks/use-seleccion-lote'

export function TablaEnvios({
  enviosIniciales,
  couriers,
  productos,
}: {
  enviosIniciales: any[]
  couriers: any[]
  productos: any[]
}){
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [envioACompletar, setEnvioACompletar] = useState<any>(null)
  const [envioAEditar, setEnvioAEditar] = useState<any>(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [filasPorPagina, setFilasPorPagina] = useState(10)

  // 1. Filtrado dinámico
  const enviosFiltrados = enviosIniciales.filter((e) => {
    const coincideBusqueda =
      e.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cliente.dni.includes(busqueda) ||
      e.cliente.celular.includes(busqueda) ||
      (e.cliente.email && e.cliente.email.toLowerCase().includes(busqueda.toLowerCase()))

    const fechaEnvio = new Date(e.createdAt).toISOString().split('T')[0]
    const coincideFecha = filtroFecha ? fechaEnvio === filtroFecha : true

    return coincideBusqueda && coincideFecha
  })

  // 2. Paginación
  const enviosPaginados = enviosFiltrados.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  )

  // 3. Custom Hook (se llama DESPUÉS de calcular filtrados y paginados)
  const {
    seleccionados,
    todosPaginaSeleccionados,
    toggleSeleccionarPagina,
    toggleSeleccionFila,
    seleccionarTodosConsulta,
    limpiarSeleccion,
    setSeleccionados,
  } = useSeleccionLote(enviosPaginados, enviosFiltrados)

  // Manejadores de cambios en filtros
  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroFecha(e.target.value)
    setPaginaActual(1)
    limpiarSeleccion()
  }

  const handleLimpiarFecha = () => {
    setFiltroFecha('')
    setPaginaActual(1)
    limpiarSeleccion()
  }

  const hoyStr = new Date().toISOString().split('T')[0]

  // Envíos de hoy con estado 'registrado'
  const enviosRegistradosHoy = enviosIniciales.filter((e) => {
    const fechaEnvio = new Date(e.createdAt).toISOString().split('T')[0]
    return fechaEnvio === hoyStr && e.estado === 'registrado'
  })

  const tienePendientesHoy = enviosRegistradosHoy.length > 0

  const tieneRegistradosEnSeleccion = seleccionados.some((id) => {
    const envio = enviosIniciales.find((e) => e.id === id)
    return envio?.estado === 'registrado'
  })

  const handleRotulosPendientesHoy = () => {
    const idsPendientesHoy = enviosRegistradosHoy.map((e) => e.id)
    if (idsPendientesHoy.length === 0) {
      alert('No hay envíos pendientes de rotular con la fecha de hoy.')
      return
    }
    window.open(`/api/rotulos?ids=${idsPendientesHoy.join(',')}`, '_blank')
  }

  const handleMarcarPendientesHoyRotulados = async () => {
    const idsHoy = enviosRegistradosHoy.map((e) => e.id)
    if (idsHoy.length === 0) return
    await marcarComoRotulados(idsHoy)
    limpiarSeleccion()
  }

  const handleExportarExcel = () => {
    let url = '/api/exportar'
    if (seleccionados.length > 0) {
      url = `/api/exportar?ids=${seleccionados.join(',')}`
    } else if (filtroFecha) {
      url = `/api/exportar?fecha=${filtroFecha}`
    }
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Controles de Búsqueda y Botones */}
      <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BarraBusqueda
            value={busqueda}
            onChange={(valor) => {
              setBusqueda(valor)
              setPaginaActual(1)
              limpiarSeleccion()
            }}
            placeholder="Buscar por Nombre, DNI, Celular o Email..."
          />

          <div className="relative flex items-center">
            <input
              type="date"
              value={filtroFecha}
              onChange={handleFechaChange}
              className="bg-slate-900 border border-slate-700/80 text-slate-100 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark] cursor-pointer"
            />
            {filtroFecha ? (
              <button
                type="button"
                onClick={handleLimpiarFecha}
                className="absolute right-2 text-slate-400 hover:text-slate-100 p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                title="Limpiar fecha"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {seleccionados.length > 0 && (
            <div className="flex items-center gap-2">
              {tieneRegistradosEnSeleccion && (
                <Button
                  onClick={async () => {
                    const idsARotular = seleccionados.filter((id) => {
                      const e = enviosIniciales.find((item) => item.id === id)
                      return e?.estado === 'registrado'
                    })
                    await marcarComoRotulados(idsARotular)
                    limpiarSeleccion()
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 text-sm cursor-pointer"
                >
                  <Tag className="w-4 h-4" />
                  Marcar Rotulados ({seleccionados.filter((id) => enviosIniciales.find((e) => e.id === id)?.estado === 'registrado').length})
                </Button>
              )}

              <Button
                onClick={() => window.open(`/api/rotulos?ids=${seleccionados.join(',')}`, '_blank')}
                className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir ({seleccionados.length})
              </Button>
            </div>
          )}

          {tienePendientesHoy && (
            <>
              <Button
                onClick={handleMarcarPendientesHoyRotulados}
                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 text-sm cursor-pointer"
              >
                <Tag className="w-4 h-4" />
                Marcar pendientes como rotulados ({enviosRegistradosHoy.length})
              </Button>

              <Button
                onClick={handleRotulosPendientesHoy}
                variant="outline"
                className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-2 text-sm cursor-pointer"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                Rótulos pendientes de hoy
              </Button>
            </>
          )}

          <Button
            onClick={handleExportarExcel}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-2 text-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            {seleccionados.length > 0
              ? `Excel (${seleccionados.length})`
              : filtroFecha
              ? 'Excel (Fecha)'
              : 'Excel (Todos)'}
          </Button>
        </div>
      </div>

      {/* Banner de selección masiva */}
      {todosPaginaSeleccionados && enviosFiltrados.length > enviosPaginados.length && (
        <div className="bg-blue-950/60 border border-blue-800/80 rounded-lg p-2.5 text-center text-xs text-blue-200 flex items-center justify-center gap-2">
          <span>Se han seleccionado los <strong>{enviosPaginados.length}</strong> envíos de esta página.</span>
          {seleccionados.length < enviosFiltrados.length ? (
            <button
              type="button"
              onClick={seleccionarTodosConsulta}
              className="font-bold underline hover:text-white cursor-pointer ml-1"
            >
              Seleccionar los {enviosFiltrados.length} envíos de la consulta completa
            </button>
          ) : (
            <span className="font-semibold text-emerald-400 ml-1">
              ✓ Todos los {enviosFiltrados.length} envíos están seleccionados.
            </span>
          )}
        </div>
      )}

      {/* Tabla de Resultados */}
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
                    title={seleccionados.length > 0 ? 'Deseleccionar todo' : 'Marcar página actual'}
                  />
                </th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Courier / Destino</th>
                <th className="p-3">Clave</th>
                <th className="p-3">Libros</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Fecha</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {enviosPaginados.map((envio) => (
                <tr key={envio.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(envio.id)}
                      onChange={() => toggleSeleccionFila(envio.id)}
                      className="w-5 h-5 cursor-pointer rounded accent-blue-600 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors"
                    />
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="font-medium text-slate-100 flex items-center gap-1.5">
                        <span>{envio.cliente.nombre}</span>
                        <BotonCopiar valor={envio.cliente.nombre} tooltip="Copiar Nombre" />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded text-xs font-mono font-bold text-blue-300">
                          <span>DNI: {envio.cliente.dni}</span>
                          <BotonCopiar valor={envio.cliente.dni} tooltip="Copiar DNI" />
                        </div>

                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <span>Cel: {envio.cliente.celular}</span>
                          <BotonCopiar valor={envio.cliente.celular} tooltip="Copiar Celular" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-blue-400">{envio.courier.nombre}</span>
                    <div className="text-xs text-slate-400 flex items-center">
                      {envio.departamento} - {envio.direccion}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-200">
                    {envio.claveEnvio} <BotonCopiar valor={envio.claveEnvio} />
                  </td>
                  <td className="p-3 text-xs text-slate-300 max-w-xs truncate">
                    {envio.productos.map((p: any) => `${p.producto.nombre} (x${p.cantidad})`).join(', ')}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`border-slate-700 ${
                          envio.estado === 'registrado'
                            ? 'bg-blue-950/40 text-blue-400 border-blue-800/60' 
                            : envio.estado === 'rotulado'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                            : 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                        }`}
                      >
                        {envio.estado}
                      </Badge>

                      {envio.estado === 'pendiente' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setEnvioACompletar({
                              id: envio.id,
                              clienteNombre: envio.cliente.nombre,
                              direccion: envio.direccion,
                              claveEnvio: envio.claveEnvio,
                            })
                          }
                          className="h-7 px-2 text-xs bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50"
                        >
                          Registrar
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(envio.createdAt).toLocaleDateString('es-PE')}
                  </td>
                  <td className="p-3 text-right">
                    <AccionesDropdown
                      acciones={[
                        {
                          label: 'Imprimir Rótulo',
                          icon: <Printer className="w-4 h-4 text-blue-400" />,
                          onClick: () => window.open(`/api/rotulos?ids=${envio.id}`, '_blank'),
                        },
                        {
                          label: 'Marcar como Rotulado',
                          icon: <Tag className="w-4 h-4 text-indigo-400" />,
                          onClick: async () => await marcarComoRotulados([envio.id]),
                          hidden: envio.estado === 'rotulado',
                        },
                        {
                          label: 'Editar Envío',
                          icon: <Edit className="w-4 h-4 text-slate-400" />,
                          onClick: () => setEnvioAEditar(envio),
                        },
                        {
                          label: 'Eliminar Envío',
                          icon: <Trash2 className="w-4 h-4" />,
                          variant: 'destructive',
                          onClick: async () => {
                            if (confirm(`¿Estás seguro de eliminar el envío de ${envio.cliente.nombre}?`)) {
                              await eliminarEnvio(envio.id)
                            }
                          },
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {enviosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No se encontraron envíos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de Tabla Modularizado */}
        <TablaPaginacion
          totalRegistros={enviosFiltrados.length}
          paginaActual={paginaActual}
          filasPorPagina={filasPorPagina}
          onPaginaChange={setPaginaActual}
          onFilasPorPaginaChange={(filas) => {
            setFilasPorPagina(filas)
            setPaginaActual(1)
          }}
        />
      </div>

      <ModalMarcarRegistrado
        envio={envioACompletar}
        open={!!envioACompletar}
        onOpenChange={(open) => !open && setEnvioACompletar(null)}
      />

      <Sheet open={!!envioAEditar} onOpenChange={(open) => !open && setEnvioAEditar(null)}>
        <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-xl p-4 sm:p-6 overflow-y-auto">
          <SheetHeader className="pb-3 mb-3 border-b border-slate-800">
            <SheetTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Editar Envío
            </SheetTitle>
          </SheetHeader>
          {envioAEditar && (
            <FormularioEditarEnvio
              envio={envioAEditar}
              couriers={couriers}
              productos={productos}
              onSuccess={() => setEnvioAEditar(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}