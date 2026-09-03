import { prisma } from '@/lib/prisma'
import { crearProducto, eliminarProducto } from './actions'

export default async function ProductosPage() {
  const productos = await prisma.producto.findMany({ orderBy: { nombre: 'asc' } })

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Productos (libros)</h1>

      <form action={crearProducto} className="flex gap-2 mb-6">
        <input name="nombre" placeholder="Nombre del libro" required className="border p-2 rounded flex-1" />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Agregar</button>
      </form>

      <ul className="space-y-2">
        {productos.map((p) => (
          <li key={p.id} className="flex justify-between items-center border-b pb-2">
            <span>{p.nombre}</span>
            <form action={eliminarProducto.bind(null, p.id)}>
              <button type="submit" className="text-xs text-red-500 hover:underline">Eliminar</button>
            </form>
          </li>
        ))}
        {productos.length === 0 && <li className="text-gray-500">Sin productos registrados</li>}
      </ul>
    </div>
  )
}