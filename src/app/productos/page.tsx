import { prisma } from '@/lib/prisma'
import { TablaProductos } from '@/components/tablas/tabla-productos'

export const revalidate = 0

export default async function ProductosPage() {
  const productos = await prisma.producto.findMany({
    orderBy: { nombre: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Catálogo de Productos
        </h1>
        <p className="text-sm text-slate-400">
          Administra los libros y materiales disponibles para los envíos.
        </p>
      </div>

      <TablaProductos productosIniciales={productos} />
    </div>
  )
}