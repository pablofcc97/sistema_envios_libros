'use client'

import { useState } from 'react'
import { Truck, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  crearCourier,
  actualizarCourier,
  eliminarCourier,
} from '@/app/configuracion/actions'

interface GestionCouriersProps {
  couriersIniciales: {
    id: string
    nombre: string
    color: string
    referenciaPredeterminada: string | null
    almacenPredeterminadoId: string | null
    almacenPredeterminado: { id: string; nombre: string } | null
    descuentaInventario: boolean
  }[]
  almacenes: { id: string; nombre: string }[]
}

export function GestionCouriers({ couriersIniciales, almacenes }: GestionCouriersProps) {
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState('#2563EB')
  const [referenciaPredeterminada, setReferenciaPredeterminada] = useState('')
  const [almacenPredeterminadoId, setAlmacenPredeterminadoId] = useState('')
  const [descuentaInventario, setDescuentaInventario] = useState(true)
  const [courierAEditar, setCourierAEditar] = useState<GestionCouriersProps['couriersIniciales'][number] | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return

    setCargando(true)
    setError('')

    const res = courierAEditar
      ? await actualizarCourier(
          courierAEditar.id,
          nombre,
          color,
          referenciaPredeterminada.trim() || null,
          almacenPredeterminadoId || null,
          descuentaInventario,
        )
      : await crearCourier(
          nombre,
          color,
          referenciaPredeterminada.trim() || null,
          almacenPredeterminadoId || null,
          descuentaInventario,
        )

    setCargando(false)

    if (res.success) {
      setNombre('')
      setColor('#2563EB')
      setReferenciaPredeterminada('')
      setAlmacenPredeterminadoId('')
      setDescuentaInventario(true)
      setCourierAEditar(null)
    } else {
      setError(res.error || 'Ocurrió un error')
    }
  }

  const handleEditar = (courier: GestionCouriersProps['couriersIniciales'][number]) => {
    setCourierAEditar(courier)
    setNombre(courier.nombre)
    setColor(courier.color)
    setReferenciaPredeterminada(courier.referenciaPredeterminada || '')
    setAlmacenPredeterminadoId(courier.almacenPredeterminadoId || '')
    setDescuentaInventario(courier.descuentaInventario)
    setError('')
  }

  const handleCancelarEdicion = () => {
    setCourierAEditar(null)
    setNombre('')
    setColor('#2563EB')
    setReferenciaPredeterminada('')
    setAlmacenPredeterminadoId('')
    setDescuentaInventario(true)
    setError('')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Formulario de Creación / Edición */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-400" />
          {courierAEditar ? 'Editar Agencia / Courier' : 'Agregar Nueva Agencia'}
        </h3>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-lg text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
          <div className="space-y-3">
            <Input
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Olva Courier, Shalom, Marvisur..."
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 text-xs text-slate-400">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  aria-label="Color del courier"
                  className="h-9 w-12 cursor-pointer rounded border border-slate-700 bg-slate-950 p-1"
                />
                Color del courier
              </label>
              <label className="space-y-1 text-xs text-slate-400">
                Referencia predeterminada (opcional)
                <Input
                  value={referenciaPredeterminada}
                  onChange={(e) => setReferenciaPredeterminada(e.target.value)}
                  placeholder="Ej: Agencia central o domicilio"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </label>
            </div>
            <label className="block space-y-1 text-xs text-slate-400">
              Almacén predeterminado (opcional)
              <select
                value={almacenPredeterminadoId}
                onChange={(e) => setAlmacenPredeterminadoId(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus-visible:border-blue-500"
              >
                <option value="">Sin almacén predeterminado</option>
                {almacenes.map((almacen) => (
                  <option key={almacen.id} value={almacen.id}>
                    {almacen.nombre}
                  </option>
                ))}
              </select>
              {almacenes.length === 0 && (
                <span className="block text-[11px] text-slate-500">
                  Primero registra un almacén en Inventario.
                </span>
              )}
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={descuentaInventario}
                onChange={(event) => setDescuentaInventario(event.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-blue-600"
              />
              <span>
                <span className="block font-medium text-slate-200">Descuenta stock al registrar envíos</span>
                <span className="mt-0.5 block text-slate-500">Desactívalo para couriers que no controlan el inventario de este almacén.</span>
              </span>
            </label>
          </div>
          <Button
            type="submit"
            disabled={cargando}
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 cursor-pointer"
          >
            {courierAEditar ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {courierAEditar ? 'Guardar' : 'Agregar'}
          </Button>
          {courierAEditar && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelarEdicion}
              className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Cancelar
            </Button>
          )}
        </form>
      </div>

      {/* Lista Compacta de Agencias */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Agencias Registradas ({couriersIniciales.length})
          </h4>
        </div>

        <ul className="divide-y divide-slate-800/80">
          {couriersIniciales.map((courier) => (
            <li
              key={courier.id}
              className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
            >
              <span className="font-medium text-slate-200 text-sm flex flex-wrap items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: courier.color }} />
                {courier.nombre}
                <span className="text-xs text-slate-500">
                  · Referencia: {courier.referenciaPredeterminada || 'Sin predeterminada'}
                </span>
                <span className="text-xs text-slate-500">
                  · Almacén: {courier.almacenPredeterminado?.nombre || 'Sin predeterminado'}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${courier.descuentaInventario ? 'border-emerald-800 bg-emerald-950/50 text-emerald-300' : 'border-slate-700 bg-slate-950 text-slate-400'}`}>
                  {courier.descuentaInventario ? 'Descuenta stock' : 'No descuenta stock'}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditar(courier)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    if (confirm(`¿Eliminar la agencia ${courier.nombre}?`)) {
                      const res = await eliminarCourier(courier.id)
                      if (!res.success) alert(res.error)
                    }
                  }}
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </li>
          ))}

          {couriersIniciales.length === 0 && (
            <li className="p-6 text-center text-slate-500 text-sm">
              No hay agencias configuradas.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
