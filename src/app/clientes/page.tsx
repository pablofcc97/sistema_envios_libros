import { prisma } from '@/lib/prisma'
import { TablaClientes } from '@/components/tablas/tabla-clientes'

export const revalidate = 0

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { nombre: 'asc' },
    include: {
      envios: {
        orderBy: { createdAt: 'desc' },
        include: {
          courier: true,
          productos: {
            include: {
              producto: true,
            },
          },
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Gestión de Clientes
        </h1>
        <p className="text-sm text-slate-400">
          Administra la base de datos de remitentes y destinatarios.
        </p>
      </div>

      <TablaClientes clientesIniciales={clientes} />
    </div>
  )
}