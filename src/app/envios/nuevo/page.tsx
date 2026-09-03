import { prisma } from '@/lib/prisma'
import { crearEnvio } from '../actions'

export default async function NuevoEnvio() {
  const couriers = await prisma.courier.findMany({ orderBy: { nombre: 'asc' } })
  const productos = await prisma.producto.findMany({ orderBy: { nombre: 'asc' } })

  return (
    <form action={crearEnvio} className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Nuevo envío</h1>

      <input name="nombre" placeholder="Nombre del cliente" required className="w-full border p-2 rounded" />
      <input name="dni" placeholder="DNI" required className="w-full border p-2 rounded" />
      <input name="celular" placeholder="Celular" required className="w-full border p-2 rounded" />
      <input name="agencia" placeholder="Agencia / dirección de envío" required className="w-full border p-2 rounded" />
      <input name="claveEnvio" placeholder="Clave de envío" required className="w-full border p-2 rounded" />

      <select name="courierId" required className="w-full border p-2 rounded">
        <option value="">Selecciona courier</option>
        {couriers.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>

      <div>
        <p className="font-medium mb-2">Libros enviados</p>
        <div className="space-y-2">
          {productos.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <input type="checkbox" name={`producto_${p.id}`} id={`chk_${p.id}`} />
              <label htmlFor={`chk_${p.id}`} className="flex-1">{p.nombre}</label>
              <input
                type="number"
                name={`cantidad_${p.id}`}
                defaultValue={1}
                min={1}
                className="w-16 border p-1 rounded"
              />
            </div>
          ))}
          {productos.length === 0 && (
            <p className="text-sm text-gray-500">No hay productos registrados. Agrega libros en /productos primero.</p>
          )}
        </div>
      </div>

      <button type="submit" className="bg-black text-white px-4 py-2 rounded">Guardar</button>
    </form>
  )
}