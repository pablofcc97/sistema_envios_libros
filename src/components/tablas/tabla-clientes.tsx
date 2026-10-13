'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import type { Prisma } from '@prisma/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { FileSpreadsheet, SquarePen, Trash2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  consultarClientes,
  consultarIdsClientes,
  eliminarCliente,
  obtenerClienteParaEdicion,
} from '@/app/clientes/actions'
import FormularioClienteForm from '@/components/formularios/formulario-cliente-form'
import { DetalleClienteSheet } from '@/components/clientes/detalle-cliente-sheet'

// Suite Modular
import { BotonCopiar } from '@/components/ui/boton-copiar'
import { TablaPaginacion } from '@/components/tablas/comunes/tabla-paginacion'
import { BarraBusqueda } from '@/components/tablas/comunes/barra-busqueda'
import type { FiltrosClientes } from '@/lib/clientes-query'

type Cliente = Prisma.ClienteGetPayload<Record<string, never>>

export function TablaClientes({
  clientesIniciales,
  totalInicial,
  filtrosIniciales,
}: {
  clientesIniciales: Cliente[]
  totalInicial: number
  filtrosIniciales: FiltrosClientes
}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [clientes, setClientes] = useState(clientesIniciales)
  const [totalRegistros, setTotalRegistros] = useState(totalInicial)
  const [busqueda, setBusqueda] = useState(filtrosIniciales.busqueda)
  const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null)
  const [modalCrearOpen, setModalCrearOpen] = useState(false)
  const [paginaActual, setPaginaActual] = useState(filtrosIniciales.pagina)
  const [filasPorPagina, setFilasPorPagina] = useState(filtrosIniciales.filasPorPagina)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [sheetDetalleOpen, setSheetDetalleOpen] = useState(false)
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [cargandoSeleccion, setCargandoSeleccion] = useState(false)
  const [errorConsulta, setErrorConsulta] = useState('')
  const [isPending, startTransition] = useTransition()
  const solicitudActual = useRef(0)
  const temporizadorBusqueda = useRef<ReturnType<typeof setTimeout> | null>(null)
  const recargarClientesRef = useRef<() => Promise<void>>(async () => {})

  const obtenerFiltros = (cambios: Partial<FiltrosClientes> = {}): FiltrosClientes => ({
    busqueda,
    pagina: paginaActual,
    filasPorPagina,
    ...cambios,
  })

  const aplicarResultado = (resultado: Awaited<ReturnType<typeof consultarClientes>>, filtros: FiltrosClientes) => {
    setClientes(resultado.clientes)
    setTotalRegistros(resultado.total)
    setPaginaActual(filtros.pagina)
    setFilasPorPagina(filtros.filasPorPagina)
  }

  const cargarClientes = (filtros: FiltrosClientes) => {
    const solicitud = ++solicitudActual.current
    startTransition(async () => {
      try {
        const resultado = await consultarClientes(filtros)
        if (solicitud !== solicitudActual.current) return
        aplicarResultado(resultado, filtros)
        setErrorConsulta('')
      } catch {
        if (solicitud === solicitudActual.current) {
          setErrorConsulta('No se pudieron cargar los clientes. Intenta de nuevo.')
        }
      }
    })
  }

  const recargarClientes = useCallback(async () => {
    const solicitud = ++solicitudActual.current
    let filtros: FiltrosClientes = { busqueda, pagina: paginaActual, filasPorPagina }
    let resultado = await consultarClientes(filtros)
    const ultimaPagina = Math.max(1, Math.ceil(resultado.total / filtros.filasPorPagina))
    if (filtros.pagina > ultimaPagina) {
      filtros = { ...filtros, pagina: ultimaPagina }
      resultado = await consultarClientes(filtros)
    }
    if (solicitud !== solicitudActual.current) return
    aplicarResultado(resultado, filtros)
    setErrorConsulta('')
  }, [busqueda, paginaActual, filasPorPagina])

  useEffect(() => {
    recargarClientesRef.current = recargarClientes
  }, [recargarClientes])

  useEffect(() => {
    const actualizarClientes = () => {
      void recargarClientesRef.current().catch(() => {
        setErrorConsulta('No se pudieron actualizar los clientes. Intenta de nuevo.')
      })
    }
    window.addEventListener('clientes:actualizados', actualizarClientes)
    return () => {
      window.removeEventListener('clientes:actualizados', actualizarClientes)
      if (temporizadorBusqueda.current) clearTimeout(temporizadorBusqueda.current)
    }
  }, [])

  const idsPagina = clientes.map((cliente) => cliente.id)
  const todosPaginaSeleccionados = idsPagina.length > 0 && idsPagina.every((id) => seleccionados.includes(id))
  const limpiarSeleccion = () => setSeleccionados([])
  const toggleSeleccionarPagina = () => {
    setSeleccionados((actuales) => todosPaginaSeleccionados
      ? actuales.filter((id) => !idsPagina.includes(id))
      : Array.from(new Set([...actuales, ...idsPagina])))
  }
  const toggleSeleccionFila = (id: string) => {
    setSeleccionados((actuales) => actuales.includes(id)
      ? actuales.filter((seleccionado) => seleccionado !== id)
      : [...actuales, id])
  }

  const seleccionarTodosConsulta = async () => {
    setCargandoSeleccion(true)
    try {
      const ids = await consultarIdsClientes(busqueda)
      setSeleccionados(ids.map((cliente) => cliente.id))
    } catch {
      setErrorConsulta('No se pudo seleccionar el resultado completo.')
    } finally {
      setCargandoSeleccion(false)
    }
  }

  const handleBusquedaChange = (valor: string) => {
    setBusqueda(valor)
    if (temporizadorBusqueda.current) clearTimeout(temporizadorBusqueda.current)
    temporizadorBusqueda.current = setTimeout(() => {
      setPaginaActual(1)
      limpiarSeleccion()
      cargarClientes(obtenerFiltros({ busqueda: valor, pagina: 1 }))
    }, 300)
  }

  const handlePaginaChange = (pagina: number) => {
    if (temporizadorBusqueda.current) clearTimeout(temporizadorBusqueda.current)
    setPaginaActual(pagina)
    cargarClientes(obtenerFiltros({ pagina }))
  }

  const handleFilasPorPaginaChange = (filas: number) => {
    if (temporizadorBusqueda.current) clearTimeout(temporizadorBusqueda.current)
    setPaginaActual(1)
    setFilasPorPagina(filas)
    limpiarSeleccion()
    cargarClientes(obtenerFiltros({ filasPorPagina: filas, pagina: 1 }))
  }

  const handleVerDetalle = (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setSheetDetalleOpen(true)
  }

  const handleExportarExcel = () => {
    let url = '/api/exportar-clientes'
    if (seleccionados.length > 0) {
      url = `/api/exportar-clientes?ids=${seleccionados.join(',')}`
    }
    window.open(url, '_blank')
  }

  const handleCerrarModalEdicion = (open: boolean) => {
    if (!open) {
      setClienteAEditar(null)
      // Limpia la URL si contenía ?editar=[id]
      if (searchParams.get('editar')) {
        router.replace('/clientes', { scroll: false })
      }
    }
  }

  const clienteIdAEditar = searchParams.get('editar')
  useEffect(() => {
    if (!clienteIdAEditar) return
    let vigente = true
    void obtenerClienteParaEdicion(clienteIdAEditar).then((cliente) => {
      if (vigente && cliente) setClienteAEditar(cliente)
    })
    return () => { vigente = false }
  }, [clienteIdAEditar])

  return (
    <div className="space-y-4">
      {/* Controles Superiores */}
      <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full md:w-auto">
          <BarraBusqueda value={busqueda} onChange={handleBusquedaChange} placeholder="Buscar por Nombre, DNI, Celular o Email..." />
          {isPending && <span className="self-center text-xs text-blue-300">Actualizando…</span>}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            onClick={() => setModalCrearOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm cursor-pointer font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Cliente
          </Button>

          <Button
            onClick={handleExportarExcel}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-2 text-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            {seleccionados.length > 0 ? `Excel (${seleccionados.length})` : 'Excel (Todos)'}
          </Button>
        </div>
      </div>

      {errorConsulta && (
        <div role="alert" className="rounded-lg border border-rose-800 bg-rose-950/50 p-3 text-xs text-rose-300">
          {errorConsulta}
        </div>
      )}

      {/* Banner de Selección Masiva */}
      {todosPaginaSeleccionados && totalRegistros > clientes.length && (
        <div className="bg-blue-950/60 border border-blue-800/80 rounded-lg p-2.5 text-center text-xs text-blue-200 flex items-center justify-center gap-2">
          <span>Se han seleccionado los <strong>{clientes.length}</strong> clientes de esta página.</span>
          {seleccionados.length < totalRegistros ? (
            <button
              type="button"
              onClick={() => void seleccionarTodosConsulta()}
              disabled={cargandoSeleccion}
              className="ml-1 cursor-pointer font-bold underline hover:text-white disabled:opacity-50"
            >
              {cargandoSeleccion ? 'Seleccionando…' : `Seleccionar los ${totalRegistros} clientes de la consulta completa`}
            </button>
          ) : (
            <span className="font-semibold text-emerald-400 ml-1">
              ✓ Todos los {totalRegistros} clientes están seleccionados.
            </span>
          )}
        </div>
      )}

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
                <th className="p-3">Cliente</th>
                <th className="p-3">DNI / RUC</th>
                <th className="p-3">Celular</th>
                <th className="p-3">Correo</th>
                <th className="p-3 text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  onClick={() => handleVerDetalle(cliente)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* Checkbox */}
                  <td className="p-4 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(cliente.id)}
                      onChange={() => toggleSeleccionFila(cliente.id)}
                      className="w-5 h-5 cursor-pointer rounded accent-blue-600 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors"
                    />
                  </td>

                  {/* Nombre */}
                  <td className="p-4">
                    <div className="font-medium text-slate-100 flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
                      <span>{cliente.nombre}</span>
                      <BotonCopiar valor={cliente.nombre} tooltip="Copiar Nombre" />
                    </div>
                  </td>

                  {/* DNI */}
                  <td className="p-3 font-mono text-blue-300 font-bold" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <span>{cliente.dni}</span>
                      <BotonCopiar valor={cliente.dni} tooltip="Copiar DNI" />
                    </div>
                  </td>

                  {/* Celular */}
                  <td className="p-3 font-mono text-slate-300" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <span>{cliente.celular}</span>
                      <BotonCopiar valor={cliente.celular} tooltip="Copiar Celular" />
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-3 text-xs text-slate-400">
                    {cliente.email || '-'}
                  </td>

                  {/* Acciones directas visibles */}
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Editar */}
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => setClienteAEditar(cliente)}
                        className="h-8 w-8 bg-amber-600/80 hover:bg-amber-500 text-white border border-amber-500/50 rounded-lg shadow-sm cursor-pointer transition-colors"
                        title="Editar Cliente"
                      >
                        <SquarePen className="w-4 h-4" />
                      </Button>

                      {/* Eliminar */}
                      <Button
                        type="button"
                        size="icon"
                        onClick={async () => {
                          if (confirm(`¿Eliminar al cliente ${cliente.nombre}?`)) {
                            const res = await eliminarCliente(cliente.id)
                            if (!res.success) alert(res.error)
                            else {
                              setSeleccionados((actuales) => actuales.filter((id) => id !== cliente.id))
                              await recargarClientes()
                            }
                          }
                        }}
                        className="h-8 w-8 bg-rose-600/80 hover:bg-rose-500 text-white border border-rose-500/50 rounded-lg shadow-sm cursor-pointer transition-colors"
                        title="Eliminar Cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {totalRegistros === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No se encontraron clientes coincidentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablaPaginacion
          totalRegistros={totalRegistros}
          paginaActual={paginaActual}
          filasPorPagina={filasPorPagina}
          onPaginaChange={handlePaginaChange}
          onFilasPorPaginaChange={handleFilasPorPaginaChange}
        />
      </div>

      {/* Sheet para Crear Cliente */}
      <Sheet open={modalCrearOpen} onOpenChange={setModalCrearOpen}>
        <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-md p-6 overflow-y-auto">
          <SheetHeader className="pb-3 border-b border-slate-800">
            <SheetTitle className="text-xl font-bold text-white">Nuevo Cliente</SheetTitle>
          </SheetHeader>
          <FormularioClienteForm onSuccess={() => {
            setModalCrearOpen(false)
            window.dispatchEvent(new Event('clientes:actualizados'))
          }} />
        </SheetContent>
      </Sheet>

      {/* Sheet para Editar Cliente */}
      <Sheet open={!!clienteAEditar} onOpenChange={handleCerrarModalEdicion}>
        <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-md p-6 overflow-y-auto">
          <SheetHeader className="pb-3 border-b border-slate-800">
            <SheetTitle className="text-xl font-bold text-white">Editar Cliente</SheetTitle>
          </SheetHeader>
          {clienteAEditar && (
            <FormularioClienteForm
              cliente={clienteAEditar}
              onSuccess={() => {
                handleCerrarModalEdicion(false)
                window.dispatchEvent(new Event('clientes:actualizados'))
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Sheet de Detalle del Cliente */}
      <DetalleClienteSheet
        cliente={clienteSeleccionado}
        open={sheetDetalleOpen}
        onOpenChange={setSheetDetalleOpen}
      />
    </div>
  )
}
