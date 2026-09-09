import { Building2, Sliders, Truck } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GestionCouriers } from '@/components/configuracion/gestion-couriers'

export const revalidate = 0

export default async function ConfiguracionPage() {
  const couriers = await prisma.courier.findMany({
    orderBy: { nombre: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Configuración del Sistema
        </h1>
        <p className="text-sm text-slate-400">
          Administra los parámetros generales, agencias de envío y preferencias.
        </p>
      </div>

      <Tabs defaultValue="couriers" className="space-y-6">
        <TabsList className="bg-slate-900 border border-slate-800 text-slate-400 p-1">
          <TabsTrigger
            value="couriers"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white cursor-pointer gap-2"
          >
            <Truck className="w-4 h-4" />
            Agencias / Couriers
          </TabsTrigger>

          <TabsTrigger
            value="remitente"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white cursor-pointer gap-2"
          >
            <Building2 className="w-4 h-4" />
            Datos del Remitente
          </TabsTrigger>

          <TabsTrigger
            value="preferencias"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white cursor-pointer gap-2"
          >
            <Sliders className="w-4 h-4" />
            Preferencias
          </TabsTrigger>
        </TabsList>

        {/* Pestaña 1: Couriers (Activa) */}
        <TabsContent value="couriers">
          <GestionCouriers couriersIniciales={couriers} />
        </TabsContent>

        {/* Pestaña 2: Remitente (Próximamente) */}
        <TabsContent value="remitente">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center max-w-2xl">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-slate-200 font-semibold text-base mb-1">
              Datos del Remitente
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-4">
              Configura el RUC, dirección fiscal y teléfono predeterminados para la cabecera de los rótulos PDF.
            </p>
            <span className="inline-block bg-slate-800 text-blue-400 border border-slate-700 text-xs px-3 py-1 rounded-full font-mono">
              Próximamente
            </span>
          </div>
        </TabsContent>

        {/* Pestaña 3: Preferencias (Próximamente) */}
        <TabsContent value="preferencias">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center max-w-2xl">
            <Sliders className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-slate-200 font-semibold text-base mb-1">
              Preferencias de Exportación
            </h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-4">
              Ajusta los formatos predeterminados para reportes Excel y comportamientos en lote.
            </p>
            <span className="inline-block bg-slate-800 text-blue-400 border border-slate-700 text-xs px-3 py-1 rounded-full font-mono">
              Próximamente
            </span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}