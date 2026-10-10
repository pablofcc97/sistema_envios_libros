'use client'

import { useMemo, useState } from 'react'
import type { Courier, Prisma, Producto } from '@prisma/client'
import { 
  AlertTriangle,
  FileSpreadsheet, 
  Trash2, 
  Printer,
  X,
  Tag,
  SquarePen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModalMarcarRegistrado } from '@/components/modales/modal-marcar-registrado'
import { eliminarEnvio, marcarComoRotulados } from '@/app/envios/actions'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { FormularioEnvioForm } from '@/components/formularios/formulario-envio-form'
import { DetalleEnvioSheet } from '@/components/envios/detalle-envio-sheet'

// Subcomponentes modulares
import { BotonCopiar } from '@/components/ui/boton-copiar'
import { BadgeEstado } from '@/components/ui/badge-estado'
import { TablaPaginacion } from '@/components/tablas/comunes/tabla-paginacion'
import { BarraBusqueda } from '@/components/tablas/comunes/barra-busqueda'

// Custom Hook
import { useSeleccionLote } from '@/hooks/use-seleccion-lote'

type EnvioConDetalle = Prisma.EnvioGetPayload<{
  include: {
    cliente: true
    courier: true
    productos: { include: { producto: true } }
  }
}>

export function TablaEnvios({
  enviosIniciales,
  couriers,
  productos,
}: {
  enviosIniciales: EnvioConDetalle[]
  couriers: Courier[]
  productos: Producto[]
}) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroDepartamento, setFiltroDepartamento] = useState('')
  const [soloConObservaciones, setSoloConObservaciones] = useState(false)
  const [envioACompletar, setEnvioACompletar] = useState<{
    id: string
    clienteNombre: string
    direccion: string | null
    claveEnvio: string | null
  } | null>(null)
  const [envioAEditar, setEnvioAEditar] = useState<EnvioConDetalle | null>(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [filasPorPagina, setFilasPorPagina] = useState(10)
  const [envioSeleccionado, setEnvioSeleccionado] = useState<EnvioConDetalle | null>(null)
  const [posibleDuplicadoDe, setPosibleDuplicadoDe] = useState<EnvioConDetalle | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Marca el envío más reciente cuando coincide el cliente y el contenido
  // exacto con otro envío creado dentro de los cinco días anteriores.
  const posiblesDuplicados = useMemo(() => {
    const grupos = new Map<string, EnvioConDetalle[]>()
    for (const envio of enviosIniciales) {
      if (!envio.clienteId || !envio.productos?.length) continue
      const productos = envio.productos
        .map((item) => `${item.productoId}:${item.cantidad}`)
        .sort()
        .join('|')
      const firma = `${envio.clienteId}::${productos}`
      const grupo = grupos.get(firma) ?? []
      grupo.push(envio)
      grupos.set(firma, grupo)
    }

    const duplicados = new Map<string, EnvioConDetalle>()
    const ventanaMs = 5 * 24 * 60 * 60 * 1000
    for (const grupo of grupos.values()) {
      grupo.sort((a, b) => (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        || String(a.id).localeCompare(String(b.id))
      ))
      let anterior: EnvioConDetalle | null = null
      for (const envio of grupo) {
        const fecha = new Date(envio.createdAt).getTime()
        if (
          envio.estado !== 'rotulado'
          && anterior
          && fecha - new Date(anterior.createdAt).getTime() <= ventanaMs
        ) {
          duplicados.set(envio.id, anterior)
        }
        anterior = envio
      }
    }
    return duplicados
  }, [enviosIniciales])

  const departamentosDisponibles = Array.from(new Set(
    enviosIniciales
      .map((envio) => envio.departamento?.trim())
      .filter((departamento): departamento is string => Boolean(departamento)),
  )).sort((a, b) => a.localeCompare(b, 'es'))

  // 1. Filtrado dinámico
  const enviosFiltrados = enviosIniciales.filter((e) => {
    const coincideBusqueda =
      e.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cliente.dni.includes(busqueda) ||
      e.cliente.celular.includes(busqueda) ||
      (e.cliente.email && e.cliente.email.toLowerCase().includes(busqueda.toLowerCase()))

    const fechaEnvio = new Date(e.createdAt).toISOString().split('T')[0]
    const coincideFecha = filtroFecha ? fechaEnvio === filtroFecha : true
    const coincideDepartamento = filtroDepartamento
      ? e.departamento === filtroDepartamento
      : true
    const coincideObservaciones = soloConObservaciones
      ? Boolean(e.observaciones?.trim())
      : true

    return coincideBusqueda && coincideFecha && coincideDepartamento && coincideObservaciones
  })

  // 2. Paginación
  const enviosPaginados = enviosFiltrados.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  )

  // 3. Custom Hook
  const {
    seleccionados,
    todosPaginaSeleccionados,
    toggleSeleccionarPagina,
    toggleSeleccionFila,
    seleccionarTodosConsulta,
    limpiarSeleccion,
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

  const handleDepartamentoChange = (departamento: string) => {
    setFiltroDepartamento(departamento)
    setPaginaActual(1)
    limpiarSeleccion()
  }

  const handleObservacionesChange = (activo: boolean) => {
    setSoloConObservaciones(activo)
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

  const handleVerDetalle = (envio: EnvioConDetalle) => {
    setEnvioSeleccionado(envio)
    setPosibleDuplicadoDe(posiblesDuplicados.get(envio.id) ?? null)
    setSheetOpen(true)
  }

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
        <div className="flex flex-1 flex-col sm:flex-row sm:flex-wrap gap-3 w-full md:w-auto">
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

          <label className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800 px-3 py-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={soloConObservaciones}
              onChange={(e) => handleObservacionesChange(e.target.checked)}
              className="h-4 w-4 rounded accent-blue-600"
            />
            Con observaciones
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-400">
            Región
            <select
              id="filtro-departamento-envios"
              aria-label="Filtrar envíos por región"
              value={filtroDepartamento}
              onChange={(e) => handleDepartamentoChange(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 text-slate-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Todas</option>
              {departamentosDisponibles.map((departamento) => (
                <option key={departamento} value={departamento}>{departamento}</option>
              ))}
            </select>
          </label>
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
                className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm cursor-pointer font-medium"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                Rótulos pendientes de hoy ({enviosRegistradosHoy.length})
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
                <th className="p-3 text-center">Clave</th>
                <th className="p-3">Libros</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-center">Fecha</th>
                <th className="p-3 text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {enviosPaginados.map((envio) => (
                (() => {
                  const duplicadoDe = posiblesDuplicados.get(envio.id)
                  return (
                <tr
                  key={envio.id}
                  onClick={() => handleVerDetalle(envio)}
                  className={`transition-colors cursor-pointer group ${duplicadoDe ? 'bg-amber-950/20 hover:bg-amber-950/35' : 'hover:bg-slate-800/40'}`}
                >
                  {/* Checkbox de selección */}
                  <td className="p-4 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(envio.id)}
                      onChange={() => toggleSeleccionFila(envio.id)}
                      className="w-5 h-5 cursor-pointer rounded accent-blue-600 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors"
                    />
                  </td>

                  {/* Cliente */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="font-medium text-slate-100 flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
                        <span>{envio.cliente.nombre}</span>
                        <BotonCopiar valor={envio.cliente.nombre} tooltip="Copiar Nombre" />
                      </div>
                      {duplicadoDe && (
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300" title={`Coincide con el envío ${duplicadoDe.claveEnvio || duplicadoDe.id} del ${new Date(duplicadoDe.createdAt).toLocaleDateString('es-PE')}`}>
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Revisar posible duplicado
                        </div>
                      )}

                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
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

                  {/* Courier / Destino (Con mayor separación vertical) */}
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold uppercase text-xs tracking-wide flex items-center gap-1.5" style={{ color: envio.courier.color || '#60A5FA' }}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: envio.courier.color || '#60A5FA' }} />
                        {envio.courier.nombre}
                      </span>
                      <span className="text-s text-slate-200 font-regular">
                        {envio.departamento}
                      </span>
                    </div>
                  </td>

                  {/* Clave de envío */}
                  <td className="p-3 text-center font-mono font-medium text-slate-300" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>{envio.claveEnvio || '-'}</span>
                      {envio.claveEnvio && <BotonCopiar valor={envio.claveEnvio} />}
                    </div>
                  </td>

                  {/* Libros / Productos */}
                  <td className="p-3 text-xs text-slate-300 max-w-xs truncate">
                    {envio.productos
                      .map((p) => `${p.producto.nombreCorto || p.producto.nombre} (x${p.cantidad})`)
                      .join(', ')}
                  </td>

                  {/* Estado */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <BadgeEstado estado={envio.estado} />

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
                          className="h-7 px-2 text-xs bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800/50 cursor-pointer"
                        >
                          Registrar
                        </Button>
                      )}

                      {envio.estado === 'registrado' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await marcarComoRotulados([envio.id])
                          }}
                          className="h-7 px-2 text-xs bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 cursor-pointer"
                        >
                          Rotulado
                        </Button>
                      )}
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="p-3 text-center text-s font-mono text-slate-400 whitespace-nowrap">
                    {new Date(envio.createdAt).toLocaleDateString('es-PE')}
                  </td>

                  {/* Acciones directas con Botones Cuadrados Sólidos */}
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Imprimir */}
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => window.open(`/api/rotulos?ids=${envio.id}`, '_blank')}
                        className="h-8 w-8 bg-blue-600/80 hover:bg-blue-500 text-white border border-blue-500/50 rounded-lg shadow-sm cursor-pointer transition-colors"
                        title="Imprimir Rótulo"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>

                      {/* Editar */}
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => setEnvioAEditar(envio)}
                        className="h-8 w-8 bg-amber-600/80 hover:bg-amber-500 text-white border border-amber-500/50 rounded-lg shadow-sm cursor-pointer transition-colors"
                        title="Editar Envío"
                      >
                        <SquarePen className="w-4 h-4" />
                      </Button>

                      {/* Eliminar */}
                      <Button
                        type="button"
                        size="icon"
                        onClick={async () => {
                          if (confirm(`¿Estás seguro de eliminar el envío de ${envio.cliente.nombre}?`)) {
                            await eliminarEnvio(envio.id)
                          }
                        }}
                        className="h-8 w-8 bg-rose-600/80 hover:bg-rose-500 text-white border border-rose-500/50 rounded-lg shadow-sm cursor-pointer transition-colors"
                        title="Eliminar Envío"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                  )
                })()
              ))}

              {enviosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No se encontraron envíos con los filtros seleccionados.
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

      {/* Modales y Paneles */}
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
            <FormularioEnvioForm
              key={envioAEditar.id}
              modo="editar"
              envio={envioAEditar}
              couriers={couriers}
              productos={productos}
              onSuccess={() => setEnvioAEditar(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <DetalleEnvioSheet
        envio={envioSeleccionado}
        posibleDuplicadoDe={posibleDuplicadoDe}
        onVerEnvioRelacionado={handleVerDetalle}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) {
            setEnvioSeleccionado(null)
            setPosibleDuplicadoDe(null)
          }
        }}
      />
    </div>
  )
}
