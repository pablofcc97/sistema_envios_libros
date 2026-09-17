'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Check, Truck } from 'lucide-react'
import { guardarCourierPorDefecto } from '@/app/configuracion/actions'

interface FormularioPreferenciasProps {
  couriers: { id: string; nombre: string }[]
  courierPorDefectoId?: string | null
}

export function FormularioPreferencias({
  couriers,
  courierPorDefectoId,
}: FormularioPreferenciasProps) {
  const [courierSeleccionada, setCourierSeleccionada] = useState(
    courierPorDefectoId || ''
  )
  const [cargando, setCargando] = useState(false)
  const [guardadoExitosa, setGuardadoExitosa] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setGuardadoExitosa(false)

    const res = await guardarCourierPorDefecto(courierSeleccionada)

    setCargando(false)
    if (res.success) {
      setGuardadoExitosa(true)
      setTimeout(() => setGuardadoExitosa(false), 3000)
    } else {
      alert(res.error || 'Error al guardar la preferencia')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl space-y-6"
    >
      <div className="space-y-1 border-b border-slate-800 pb-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-400" />
          Courier Predeterminada
        </h3>
        <p className="text-xs text-slate-400">
          Selecciona la agencia de envíos que aparecerá preseleccionada al abrir el formulario de nuevo envío.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          Agencia por Defecto
        </label>
        <select
          value={courierSeleccionada}
          onChange={(e) => setCourierSeleccionada(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="" className="bg-slate-900 text-slate-400">
            Ninguna (Seleccionar manualmente siempre)
          </option>
          {couriers.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={cargando}
          className="bg-blue-600 hover:bg-blue-500 text-white gap-2 text-sm cursor-pointer font-medium"
        >
          {guardadoExitosa ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              Guardado
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {cargando ? 'Guardando...' : 'Guardar Preferencia'}
            </>
          )}
        </Button>

        {guardadoExitosa && (
          <span className="text-xs text-emerald-400 font-medium">
            ¡Preferencia actualizada con éxito!
          </span>
        )}
      </div>
    </form>
  )
}