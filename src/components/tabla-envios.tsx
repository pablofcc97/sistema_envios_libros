'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileSpreadsheet, 
  Search, 
  Trash2, 
  Edit, 
  MoreHorizontal, 
  Printer,
  Copy,
  Check
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModalMarcarRegistrado } from '@/components/modal-marcar-registrado'
import { eliminarEnvio } from '@/app/envios/actions'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import FormularioEditarEnvio from '@/app/envios/editar-envio-form'

function BotonCopiar({ valor }: { valor: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    if (!valor) return
    await navigator.clipboard.writeText(valor)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1200)
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="text-slate-500 hover:text-slate-200 transition-colors inline-flex items-center ml-1"
      title="Copiar texto"
    >
      {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

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
  const [fechaFiltro, setFechaFiltro] = useState('')
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [envioACompletar, setEnvioACompletar] = useState<any>(null)
  const [envioAEditar, setEnvioAEditar] = useState<any>(null)

  const toggleSelección = (id: string) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // Filtrado dinámico por DNI, Nombre, Email y Fecha
  const enviosFiltrados = enviosIniciales.filter((e) => {
    const coincideBusqueda =
      e.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cliente.dni.includes(busqueda) ||
      (e.cliente.email && e.cliente.email.toLowerCase().includes(busqueda.toLowerCase()))

    const fechaEnvio = new Date(e.createdAt).toISOString().split('T')[0]
    const coincideFecha = fechaFiltro ? fechaEnvio === fechaFiltro : true

    return coincideBusqueda && coincideFecha
  })

  // Generar rótulos en PDF de los envíos seleccionados o de hoy
  const handleRotulosHoy = () => {
    const hoyStr = new Date().toISOString().split('T')[0]
    const idsHoy = enviosIniciales
      .filter((e) => new Date(e.createdAt).toISOString().split('T')[0] === hoyStr)
      .map((e) => e.id)

    if (idsHoy.length === 0) {
      alert('No hay envíos registrados con la fecha de hoy.')
      return
    }

    window.open(`/api/rotulos?ids=${idsHoy.join(',')}`, '_blank')
  }

  const handleExportarExcel = () => {
    const url = fechaFiltro ? `/api/exportar?fecha=${fechaFiltro}` : '/api/exportar'
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Controles de Búsqueda y Botones */}
      <div className="bg-slate-900 p-4 border border-slate-800 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <Input
              placeholder="Buscar por Nombre, DNI o Email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 text-sm"
            />
          </div>

          <Input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="bg-slate-800 border-slate-700 text-slate-100 w-full sm:w-auto text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {seleccionados.length > 0 && (
            <Button
              onClick={() => window.open(`/api/rotulos?ids=${seleccionados.join(',')}`, '_blank')}
              className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir ({seleccionados.length})
            </Button>
          )}

          <Button
            onClick={handleRotulosHoy}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-2 text-sm"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            Rótulos de Hoy
          </Button>

          <Button
            onClick={handleExportarExcel}
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-2 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Excel
          </Button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="p-3 w-8"></th>
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
              {enviosFiltrados.map((envio) => (
                <tr key={envio.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(envio.id)}
                      onChange={() => toggleSelección(envio.id)}
                      className="rounded accent-blue-600 bg-slate-800 border-slate-700"
                    />
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-100 flex items-center">
                      {envio.cliente.nombre} <BotonCopiar valor={envio.cliente.nombre} />
                    </div>
                    <div className="text-xs text-slate-400 flex items-center">
                      DNI: {envio.cliente.dni} <BotonCopiar valor={envio.cliente.dni} />
                      <span className="mx-1">•</span>
                      {envio.cliente.celular} <BotonCopiar valor={envio.cliente.celular} />
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-blue-400">{envio.courier.nombre}</span>
                    <div className="text-xs text-slate-400 flex items-center">
                      {envio.departamento} - {envio.direccion} <BotonCopiar valor={envio.direccion} />
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-800 text-slate-400">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                        <DropdownMenuItem
                          onClick={() => window.open(`/api/rotulos?ids=${envio.id}`, '_blank')}
                          className="gap-2 cursor-pointer focus:bg-slate-800"
                        >
                          <Printer className="w-4 h-4 text-blue-400" /> Imprimir Rótulo
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEnvioAEditar(envio)}
                          className="gap-2 cursor-pointer focus:bg-slate-800"
                        >
                          <Edit className="w-4 h-4 text-slate-400" /> Editar Envío
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={async () => {
                            if (confirm(`¿Estás seguro de eliminar el envío de ${envio.cliente.nombre}?`)) {
                              await eliminarEnvio(envio.id)
                            }
                          }}
                          className="gap-2 cursor-pointer text-red-400 focus:bg-slate-800 focus:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar Envío
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
      </div>
      <ModalMarcarRegistrado
        envio={envioACompletar}
        open={!!envioACompletar}
        onOpenChange={(open) => !open && setEnvioACompletar(null)}
      />
      <Sheet open={!!envioAEditar} onOpenChange={(open) => !open && setEnvioAEditar(null)}>
        <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-white">Editar Envío</SheetTitle>
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