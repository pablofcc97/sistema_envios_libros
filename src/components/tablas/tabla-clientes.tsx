'use client'

import { useState } from 'react'
import { FileSpreadsheet, Edit, Trash2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { eliminarCliente } from '@/app/clientes/actions'
import FormularioClienteForm from '@/components/formularios/formulario-cliente-form'

// Suite Modular
import { BotonCopiar } from '@/components/ui/boton-copiar'
import { TablaPaginacion } from '@/components/tablas/comunes/tabla-paginacion'
import { BarraBusqueda } from '@/components/tablas/comunes/barra-busqueda'
import { AccionesDropdown } from '@/components/tablas/comunes/acciones-dropdown'
import { useSeleccionLote } from '@/hooks/use-seleccion-lote'

export function TablaClientes({ clientesIniciales }: { clientesIniciales: any[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [clienteAEditar, setClienteAEditar] = useState<any>(null)
  const [modalCrearOpen, setModalCrearOpen] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const [filasPorPagina, setFilasPorPagina] = useState(10)

  // 1. Filtro dinámico por Nombre, DNI, Celular o Email
  const clientesFiltrados = clientesIniciales.filter((c) => {
    const q = busqueda.toLowerCase()
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.dni.includes(q) ||
      c.celular.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    )
  })

  // 2. Paginación
  const clientesPaginados = clientesFiltrados.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  )

  // 3. Custom Hook de Selección en Lote
  const {
    seleccionados,
    todosPaginaSeleccionados,
    toggleSeleccionarPagina,
    toggleSeleccionFila,
    seleccionarTodosConsulta,
    limpiarSeleccion,
  } = useSeleccionLote(clientesPaginados, clientesFiltrados)

  const handleExportarExcel = () => {
    let url = '/api/exportar-clientes'
    if (seleccionados.length > 0) {
      url = `/api/exportar-clientes?ids=${seleccionados.join(',')}`
    }
    window.open(url, '_blank')
  }

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
            placeholder="Buscar por Nombre, DNI, Celular o Email..."
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            onClick={() => setModalCrearOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm cursor-pointer"
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

      {/* Banner de Selección Masiva */}
      {todosPaginaSeleccionados && clientesFiltrados.length > clientesPaginados.length && (
        <div className="bg-blue-950/60 border border-blue-800/80 rounded-lg p-2.5 text-center text-xs text-blue-200 flex items-center justify-center gap-2">
          <span>Se han seleccionado los <strong>{clientesPaginados.length}</strong> clientes de esta página.</span>
          {seleccionados.length < clientesFiltrados.length ? (
            <button
              type="button"
              onClick={seleccionarTodosConsulta}
              className="font-bold underline hover:text-white cursor-pointer ml-1"
            >
              Seleccionar los {clientesFiltrados.length} clientes de la consulta completa
            </button>
          ) : (
            <span className="font-semibold text-emerald-400 ml-1">
              ✓ Todos los {clientesFiltrados.length} clientes están seleccionados.
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
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {clientesPaginados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(cliente.id)}
                      onChange={() => toggleSeleccionFila(cliente.id)}
                      className="w-5 h-5 cursor-pointer rounded accent-blue-600 bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-100 flex items-center gap-1.5">
                      <span>{cliente.nombre}</span>
                      <BotonCopiar valor={cliente.nombre} tooltip="Copiar Nombre" />
                    </div>
                  </td>
                  <td className="p-3 font-mono text-blue-300 font-bold">
                    {cliente.dni} <BotonCopiar valor={cliente.dni} tooltip="Copiar DNI" />
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    {cliente.celular} <BotonCopiar valor={cliente.celular} tooltip="Copiar Celular" />
                  </td>
                  <td className="p-3 text-xs text-slate-400">
                    {cliente.email || '-'}
                  </td>
                  <td className="p-3 text-right">
                    <AccionesDropdown
                      acciones={[
                        {
                          label: 'Editar Cliente',
                          icon: <Edit className="w-4 h-4 text-slate-400" />,
                          onClick: () => setClienteAEditar(cliente),
                        },
                        {
                          label: 'Eliminar Cliente',
                          icon: <Trash2 className="w-4 h-4" />,
                          variant: 'destructive',
                          onClick: async () => {
                            if (confirm(`¿Eliminar al cliente ${cliente.nombre}?`)) {
                              const res = await eliminarCliente(cliente.id)
                              if (!res.success) alert(res.error)
                            }
                          },
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {clientesFiltrados.length === 0 && (
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
          totalRegistros={clientesFiltrados.length}
          paginaActual={paginaActual}
          filasPorPagina={filasPorPagina}
          onPaginaChange={setPaginaActual}
          onFilasPorPaginaChange={(filas) => {
            setFilasPorPagina(filas)
            setPaginaActual(1)
          }}
        />
      </div>

      {/* Sheet para Crear Cliente */}
      <Sheet open={modalCrearOpen} onOpenChange={setModalCrearOpen}>
        <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-md p-6 overflow-y-auto">
          <SheetHeader className="pb-3 border-b border-slate-800">
            <SheetTitle className="text-xl font-bold text-white">Nuevo Cliente</SheetTitle>
          </SheetHeader>
          <FormularioClienteForm onSuccess={() => setModalCrearOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Sheet para Editar Cliente */}
      <Sheet open={!!clienteAEditar} onOpenChange={(open) => !open && setClienteAEditar(null)}>
        <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-md p-6 overflow-y-auto">
          <SheetHeader className="pb-3 border-b border-slate-800">
            <SheetTitle className="text-xl font-bold text-white">Editar Cliente</SheetTitle>
          </SheetHeader>
          {clienteAEditar && (
            <FormularioClienteForm
              cliente={clienteAEditar}
              onSuccess={() => setClienteAEditar(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}