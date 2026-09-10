import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TablaEnvios } from '@/components/tablas/tabla-envios'
import { BotonNuevoEnvio } from '@/components/envios/boton-nuevo-envio'

export const revalidate = 0

export default async function EnviosPage() {
  const envios = await prisma.envio.findMany({
    include: {
      cliente: true,
      courier: true,
      productos: { include: { producto: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const couriers = await prisma.courier.findMany({ orderBy: { nombre: 'asc' } })
  const productos = await prisma.producto.findMany({ orderBy: { nombre: 'asc' } })

  return (
    <div className="space-y-6 text-slate-100">
      {/* Encabezado y Acción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Envíos</h1>
          <p className="text-sm text-slate-400">
            Filtra, genera rótulos y administra tus despachos.
          </p>
        </div>

        {/* Botón y Sheet controlado client-side */}
        <Suspense fallback={null}>
          <BotonNuevoEnvio couriers={couriers} productos={productos} />
        </Suspense>
      </div>

      {/* Tabla Interactiva con Filtros y Exportación */}
      <TablaEnvios enviosIniciales={envios} couriers={couriers} productos={productos} />
    </div>
  )
}