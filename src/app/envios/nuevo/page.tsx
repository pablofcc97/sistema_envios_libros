import { prisma } from '@/lib/prisma'
import { crearEnvio } from '../actions'

const DEPARTAMENTOS_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna',
  'Tumbes', 'Ucayali'
]

export default async function NuevoEnvio() {
  const couriers = await prisma.courier.findMany({ orderBy: { nombre: 'asc' } })
  const productos = await prisma.producto.findMany({ orderBy: { nombre: 'asc' } })

  return (
    <div className="max-w-3xl mx-auto p-6 text-slate-100">
      <h1 className="text-2xl font-bold mb-6 text-white">Nuevo Envío</h1>

      <form action={crearEnvio} className="space-y-6">
        
        {/* Datos del Cliente */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">
            Datos del Cliente
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">DNI *</label>
              <input
                name="dni"
                placeholder="Ej. 70123456"
                required
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nombre Completo *</label>
              <input
                name="nombre"
                placeholder="Nombre del cliente"
                required
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Celular *</label>
              <input
                name="celular"
                placeholder="Ej. 987654321"
                required
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email (Opcional)</label>
              <input
                type="email"
                name="email"
                placeholder="cliente@correo.com"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Datos del Envío y Courier */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">
            Detalles de Envío
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Courier / Empresa *</label>
              <select 
                name="courierId" 
                required 
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
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
              <label className="block text-xs font-medium text-slate-400 mb-1">Departamento *</label>
              <select 
                name="departamento" 
                required 
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-400">Selecciona departamento</option>
                {DEPARTAMENTOS_PERU.map((dep) => (
                  <option key={dep} value={dep} className="bg-slate-900 text-slate-100">
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Dirección de Entrega / Agencia *</label>
              <input
                name="direccion"
                placeholder="Ej. Av. Javier Prado Este 1234 o Agencia Shalom"
                required
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Referencia (Opcional)</label>
              <input
                name="referencia"
                placeholder="Ej. Frente al Parque Central"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Clave de Envío *</label>
              <input
                name="claveEnvio"
                placeholder="Clave para retiro en agencia"
                required
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Productos / Libros */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">
            Libros / Productos a enviar
          </h2>
          <div className="space-y-2 bg-slate-950/50 p-3 border border-slate-800 rounded-lg">
            {productos.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-slate-800/80 last:border-b-0">
                <input
                  type="checkbox"
                  name={`producto_${p.id}`}
                  id={`chk_${p.id}`}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer bg-slate-800 border-slate-700"
                />
                <label htmlFor={`chk_${p.id}`} className="flex-1 text-sm text-slate-200 cursor-pointer select-none">
                  {p.nombre}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Cant:</span>
                  <input
                    type="number"
                    name={`cantidad_${p.id}`}
                    defaultValue={1}
                    min={1}
                    className="w-16 bg-slate-800 border border-slate-700 text-slate-100 p-1 text-center rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
            {productos.length === 0 && (
              <p className="text-sm text-slate-400 py-2 text-center">
                No hay productos registrados. Agrega productos en la sección correspondiente.
              </p>
            )}
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 shadow-sm">
          <label className="block text-sm font-medium text-slate-200">Observaciones (Opcional)</label>
          <textarea
            name="observaciones"
            rows={3}
            placeholder="Instrucciones adicionales para la agencia o repartidor..."
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20 text-sm"
          >
            Guardar Envío
          </button>
        </div>

      </form>
    </div>
  )
}