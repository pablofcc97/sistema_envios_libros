'use client'

import { useState } from 'react'
import { crearEnvio } from '../../app/envios/actions'

const DEPARTAMENTOS_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna',
  'Tumbes', 'Ucayali'
]

type Courier = { id: string; nombre: string }
type Producto = { id: string; nombre: string; nombreCorto?: string | null }

export default function FormularioNuevoEnvio({
  couriers,
  productos,
}: {
  couriers: Courier[]
  productos: Producto[]
}) {
  const shalomCourier = couriers.find((c) => c.nombre.toUpperCase().includes('SHALOM'))

  const [dni, setDni] = useState('')
  const [celular, setCelular] = useState('')

  // Función para limpiar espacios, guiones y caracteres no numéricos
  const limpiarTextoNumerico = (texto: string, maxLen: number) => {
    return texto.replace(/\D/g, '').slice(0, maxLen)
  }

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDni(limpiarTextoNumerico(e.target.value, 8))
  }

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCelular(limpiarTextoNumerico(e.target.value, 9))
  }

  return (
    <form action={crearEnvio} className="space-y-4 text-slate-100">
      
      {/* Cliente */}
      <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
          Cliente
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Nombre primero */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
            <input
              name="nombre"
              placeholder="Nombre del cliente"
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* DNI */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">DNI * (8 dígitos)</label>
            <input
              name="dni"
              value={dni}
              onChange={handleDniChange}
              placeholder="70123456"
              required
              minLength={8}
              pattern="\d{8}"
              title="El DNI debe tener exactamente 8 dígitos"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Celular */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Celular * (9 dígitos)</label>
            <input
              name="celular"
              value={celular}
              onChange={handleCelularChange}
              placeholder="987654321"
              required
              minLength={9}
              pattern="\d{9}"
              title="El celular debe tener exactamente 9 dígitos"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Email */}
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

      {/* Envío */}
      <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
          Envío
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Courier *</label>
            <select
              name="courierId"
              defaultValue={shalomCourier?.id || ''}
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona courier</option>
              {couriers.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">
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
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona departamento</option>
              {DEPARTAMENTOS_PERU.map((dep) => (
                <option key={dep} value={dep} className="bg-slate-900">
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
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Agencia SHALOM">Agencia SHALOM</option>
              <option value="Agencia OLVA">Agencia OLVA</option>
              <option value="Domicilio del cliente">Domicilio del cliente</option>
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

      {/* Libros / Productos */}
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
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20 text-sm cursor-pointer"
      >
        Guardar Envío Pendiente
      </button>
    </form>
  )
}