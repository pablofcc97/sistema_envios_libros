import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  Truck,
  Users,
  Package,
  Clock,
  CheckCircle2,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { UltimosEnviosTabla } from '@/components/dashboard/ultimos-envios-tabla'
import { DistribuicionCouriers } from '@/components/dashboard/distribuicion-couriers'
import { TopDepartamentosTabla } from '@/components/dashboard/top-departamentos-tabla'

export const revalidate = 0

export default async function DashboardPage() {
  // 1. Consultas paralelas a la base de datos
  const [
    totalEnvios,
    enviosPendientes,
    enviosRegistrados,
    totalClientes,
    totalProductos,
    enviosPorCourierDb,
    enviosPorDepartamentoDb,
    ultimosEnvios,
  ] = await Promise.all([
    prisma.envio.count(),
    prisma.envio.count({ where: { estado: 'pendiente' } }),
    prisma.envio.count({ where: { estado: 'registrado' } }),
    prisma.cliente.count(),
    prisma.producto.count(),
    prisma.envio.groupBy({
      by: ['courierId'],
      _count: { id: true },
    }),
    prisma.envio.groupBy({
      by: ['departamento'],
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    }),
    prisma.envio.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { cliente: true, courier: true },
    }),
  ])

  // Map para distribución de couriers
  const couriersDb = await prisma.courier.findMany()
  const courierMap = new Map(couriersDb.map((c) => [c.id, c.nombre]))

  const distribuicionCouriers = enviosPorCourierDb.map((item) => ({
    nombre: courierMap.get(item.courierId) || 'Desconocido',
    total: item._count.id,
  }))

  // Formato para Top Departamentos
  const topDepartamentos = enviosPorDepartamentoDb.map((item) => {
    const total = item._count.id
    const porcentaje = totalEnvios > 0 ? Math.round((total / totalEnvios) * 100) : 0
    return {
      departamento: item.departamento || 'Sin especificar',
      total,
      porcentaje,
    }
  })

  return (
    <div className="space-y-8">
      {/* Encabezado e Impulsadores Rápidos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Panel de Control
          </h1>
          <p className="text-sm text-slate-400">
            Resumen general y métricas operativas del sistema de envíos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-500 text-white gap-2 cursor-pointer font-medium"
          >
            <Link href="/envios?nuevo=true">
              <PlusCircle className="w-4 h-4" />
              Nuevo Envío
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 gap-2 cursor-pointer"
          >
            <Link href="/envios">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Ver Todos
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid de KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          titulo="Pendientes por Registrar"
          valor={enviosPendientes}
          subtexto="Requieren clave o voucher"
          icono={<Clock className="w-5 h-5 text-amber-400" />}
          variante="warning"
        />

        <KpiCard
          titulo="Envíos Registrados"
          valor={enviosRegistrados}
          subtexto={`De un total de ${totalEnvios} envíos`}
          icono={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          variante="success"
        />

        <KpiCard
          titulo="Total de Clientes"
          valor={totalClientes}
          subtexto="Base de datos activa"
          icono={<Users className="w-5 h-5 text-blue-400" />}
        />

        <KpiCard
          titulo="Catálogo de Productos"
          valor={totalProductos}
          subtexto="Libros y materiales"
          icono={<Package className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* Sección Inferior: Gráfico/Distribución, Top Departamentos y Últimos Envíos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              Últimos Envíos Registrados
            </h3>
            <UltimosEnviosTabla envios={ultimosEnvios} />
          </div>
        </div>

        <div className="space-y-6">
          <DistribuicionCouriers datos={distribuicionCouriers} />
          <TopDepartamentosTabla datos={topDepartamentos} />
        </div>
      </div>
    </div>
  )
}