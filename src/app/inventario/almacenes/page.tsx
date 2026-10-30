import { prisma } from '@/lib/prisma'
import { TablaAlmacenes } from '@/components/inventario/tabla-almacenes'

export const revalidate = 0

export default async function AlmacenesPage() {
  const almacenes = await prisma.almacen.findMany({
    orderBy: { nombre: 'asc' },
    include: {
      _count: {
        select: {
          couriersConAlmacenDefault: true,
          envios: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Almacenes</h1>
        <p className="text-sm text-slate-400">
          Administra las ubicaciones desde las que se preparan y despachan los envíos.
        </p>
      </div>

      <TablaAlmacenes almacenesIniciales={almacenes} />
    </div>
  )
}
