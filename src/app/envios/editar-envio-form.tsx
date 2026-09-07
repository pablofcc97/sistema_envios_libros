'use client'

import { actualizarEnvioCompleto } from './actions'
import Link from 'next/link'
import { UserPen } from 'lucide-react'

const DEPARTAMENTOS_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna',
  'Tumbes', 'Ucayali'
]

export default function FormularioEditarEnvio({
  envio,
  couriers,
  productos,
  onSuccess,
}: {
  envio: any
  couriers: any[]
  productos: any[]
  onSuccess: () => void
}) {
  const productosSeleccionadosMap = new Map(
    envio.productos.map((p: any) => [p.productoId, p.cantidad])
  )

  async function handleSubmit(formData: FormData) {
    await actualizarEnvioCompleto(envio.id, formData)
    onSuccess()
  }

  return (
    <form action={handleSubmit} className="space-y-4 text-slate-100">
      
      {/* Información del Cliente (Solo Lectura) */}
      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-3 text-xs text-slate-300">
        <div className="space-y-1">
          <p className="text-slate-100 font-semibold text-sm">{envio.cliente.nombre}</p>
          <p className="text-slate-400">
            DNI: <span className="text-slate-200 font-mono">{envio.cliente.dni}</span> • Cel: <span className="text-slate-200 font-mono">{envio.cliente.celular}</span>
          </p>
          {envio.cliente.email && (
            <p className="text-slate-400">
              Email: <span className="text-slate-200">{envio.cliente.email}</span>
            </p>
          )}
        </div>

        <Link
          href={`/clientes/${envio.cliente.id}/editar`}
          target="_blank"
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg border border-slate-700 text-xs font-medium transition-colors flex items-center justify-center gap-2"
        >
          <UserPen className="w-3.5 h-3.5 text-blue-400" />
          Editar cliente
        </Link>
      </div>

      {/* Detalle de Envío */}
      <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">
          Detalles de Envío
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Courier *</label>
            <select
              name="courierId"
              defaultValue={envio.courierId}
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm"
            >
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
              defaultValue={envio.departamento}
              required
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm"
            >
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
              defaultValue={envio.referencia ?? 'Agencia SHALOM'}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm"
            >
              <option value="Agencia SHALOM">Agencia SHALOM</option>
              <option value="Agencia OLVA">Agencia OLVA</option>
              <option value="Domicilio del cliente">Domicilio del cliente</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Clave de Envío</label>
            <input
              name="claveEnvio"
              defaultValue={envio.claveEnvio ?? ''}
              placeholder="Ej. 1234"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Dirección / Agencia</label>
            <input
              name="direccion"
              defaultValue={envio.direccion ?? ''}
              placeholder="Av. Principal 123 o Agencia Shalom"
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm"
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
          {productos.map((p) => {
            const estaSeleccionado = productosSeleccionadosMap.has(p.id)
            const cantidadPrev = productosSeleccionadosMap.get(p.id) || 1

            return (
              <div key={p.id} className="flex items-center gap-2 py-1 border-b border-slate-800/60 last:border-0">
                <input
                  type="checkbox"
                  name={`producto_${p.id}`}
                  id={`edit_chk_${p.id}`}
                  defaultChecked={estaSeleccionado}
                  className="w-4 h-4 rounded accent-blue-600 bg-slate-800 border-slate-700"
                />
                <label htmlFor={`edit_chk_${p.id}`} className="flex-1 text-xs text-slate-200 cursor-pointer">
                  {p.nombre}
                </label>
                <input
                  type="number"
                  name={`cantidad_${p.id}`}
                  defaultValue={cantidadPrev}
                  min={1}
                  className="w-14 bg-slate-800 border border-slate-700 text-slate-100 p-1 text-center rounded text-xs"
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Observaciones</label>
        <textarea
          name="observaciones"
          defaultValue={envio.observaciones ?? ''}
          rows={2}
          className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2 rounded-lg text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
      >
        Guardar Cambios
      </button>
    </form>
  )
}