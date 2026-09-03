import { prisma } from '@/lib/prisma'
import { crearCourier, eliminarCourier } from './actions'

export default async function CouriersPage() {
  const couriers = await prisma.courier.findMany({ orderBy: { nombre: 'asc' } })

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Couriers</h1>

      <form action={crearCourier} className="flex gap-2 mb-6">
        <input name="nombre" placeholder="Nombre (ej. OLVA)" required className="border p-2 rounded flex-1" />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <ul className="space-y-2">
        {couriers.map((c) => (
          <li key={c.id} className="flex justify-between items-center border-b pb-2">
            <span>{c.nombre}</span>
            <form action={eliminarCourier.bind(null, c.id)}>
              <button type="submit" className="text-xs text-red-500 hover:underline">Eliminar</button>
            </form>
          </li>
        ))}
        {couriers.length === 0 && <li className="text-gray-500">Sin couriers registrados</li>}
      </ul>
    </div>
  )
}