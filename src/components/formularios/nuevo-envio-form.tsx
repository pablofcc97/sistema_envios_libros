'use client'

import { useState } from 'react'
import { crearEnvio } from '@/app/envios/actions'

const DEPARTAMENTOS_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna',
  'Tumbes', 'Ucayali'
]

type Courier = { id: string; nombre: string }
type Producto = { id: string; nombre: string; nombreCorto?: string | null }

interface FormularioNuevoEnvioProps {
  couriers: Courier[]
  productos: Producto[]
  courierPorDefectoId?: string | null
  onSuccess?: () => void
}

export default function FormularioNuevoEnvio({
  couriers,
  productos,
  courierPorDefectoId,
  onSuccess,
}: FormularioNuevoEnvioProps) {
  const [nombre, setNombre] = useState('')
  const [dni, setDni] = useState('')
  const [celular, setCelular] = useState('')
  const [cargando, setCargando] = useState(false)

  const defaultCourierId =
    courierPorDefectoId ||
    couriers.find((c) => c.nombre.toUpperCase().includes('SHALOM'))?.id ||
    couriers[0]?.id ||
    ''

  const limpiarTextoNumerico = (texto: string, maxLen: number) => {
    return texto.replace(/\D/g, '').slice(0, maxLen)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // 1. Validaciones previas
    if (dni.length !== 8) {
      alert('El DNI debe contener exactamente 8 dígitos.')
      return
    }

    if (celular.length !== 9) {
      alert('El número de celular debe contener exactamente 9 dígitos.')
      return
    }

    setCargando(true)

    // 2. Sanitización (Trim de campos de texto)
    const formData = new FormData(e.currentTarget)
    
    formData.set('nombre', nombre.trim().replace(/\s+/g, ' '))
    formData.set('dni', dni)
    formData.set('celular', celular)

    const email = formData.get('email') as string
    if (email) formData.set('email', email.trim().toLowerCase())

    const claveEnvio = formData.get('claveEnvio') as string
    if (claveEnvio) formData.set('claveEnvio', claveEnvio.trim())

    const direccion = formData.get('direccion') as string
    if (direccion) formData.set('direccion', direccion.trim())

    const observaciones = formData.get('observaciones') as string
    if (observaciones) formData.set('observaciones', observaciones.trim())

    // 3. Ejecución de Server Action
    await crearEnvio(formData)

    setCargando(false)
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
      {/* Sección Cliente */}
      <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
          Cliente
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
            <input
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del cliente"
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">DNI * (8 dígitos)</label>
            <input
              name="dni"
              value={dni}
              onChange={(e) => setDni(limpiarTextoNumerico(e.target.value, 8))}
              placeholder="70123456"
              required
              minLength={8}
              maxLength={8}
              pattern="\d{8}"
              title="El DNI debe tener exactamente 8 dígitos"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Celular * (9 dígitos)</label>
            <input
              name="celular"
              value={celular}
              onChange={(e) => setCelular(limpiarTextoNumerico(e.target.value, 9))}
              placeholder="987654321"
              required
              minLength={9}
              maxLength={9}
              pattern="\d{9}"
              title="El celular debe tener exactamente 9 dígitos"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="opcional@correo.com"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sección Envío */}
      <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
          Envío
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Courier *</label>
            <select
              name="courierId"
              defaultValue={defaultCourierId}
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-400">Selecciona courier</option>
              {couriers.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Departamento *</label>
            <select
              name="departamento"
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-400">Selecciona departamento</option>
              {DEPARTAMENTOS_PERU.map((dep) => (
                <option key={dep} value={dep} className="bg-slate-900 text-slate-100">
                  {dep}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-slate-400 mb-1">Referencia</label>
            <select
              name="referencia"
              defaultValue="Agencia SHALOM"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Agencia SHALOM" className="bg-slate-900 text-slate-100">Agencia SHALOM</option>
              <option value="Agencia OLVA" className="bg-slate-900 text-slate-100">Agencia OLVA</option>
              <option value="Domicilio del cliente" className="bg-slate-900 text-slate-100">Domicilio del cliente</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Clave de Envío (Opcional)</label>
            <input
              name="claveEnvio"
              placeholder="Ej. 1234 (Se puede agregar después)"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Dirección / Agencia (Opcional)</label>
            <input
              name="direccion"
              placeholder="Av. Principal 123 o Agencia Shalom"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sección Libros / Productos */}
      <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
          Libros
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {productos.map((p) => (
            <div key={p.id} className="flex items-center gap-2 py-1 border-b border-slate-800/60 last:border-0">
              <input
                type="checkbox"
                name={`producto_${p.id}`}
                id={`form_chk_${p.id}`}
                className="w-4 h-4 cursor-pointer rounded accent-blue-600 bg-slate-800 border-slate-700"
              />
              <label htmlFor={`form_chk_${p.id}`} className="flex-1 text-xs text-slate-200 cursor-pointer">
                {p.nombreCorto || p.nombre}
              </label>
              <input
                type="number"
                name={`cantidad_${p.id}`}
                defaultValue={1}
                min={1}
                className="w-14 bg-slate-800 border border-slate-700 text-slate-100 p-1 text-center rounded text-xs font-mono"
              />
            </div>
          ))}
          {productos.length === 0 && (
            <p className="text-xs text-slate-500">No hay libros disponibles.</p>
          )}
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Observaciones</label>
        <textarea
          name="observaciones"
          rows={2}
          placeholder="Instrucciones adicionales..."
          className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20 text-sm cursor-pointer disabled:cursor-not-allowed"
      >
        {cargando ? 'Guardando...' : 'Guardar Envío Pendiente'}
      </button>
    </form>
  )
}