import { prisma } from '@/lib/prisma'
import { TablaEnvios } from '@/components/tabla-envios'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import FormularioNuevoEnvio from './nuevo-envio-form' // Componente extraído para el Sheet

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
          <p className="text-sm text-slate-400">Filtra, genera rótulos y administra tus despachos.</p>
        </div>

        {/* Formulario Desplegable a la Derecha */}
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-600/20">
              <Plus className="w-4 h-4" />
              Nuevo Envío
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-xl p-6 sm:p-4 overflow-y-auto">
            <SheetHeader className="pb-4 mb-2 border-b border-slate-800">
              <SheetTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Registrar Nuevo Envío
              </SheetTitle>
            </SheetHeader>
            <FormularioNuevoEnvio couriers={couriers} productos={productos} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Tabla Interactiva con Filtros y Exportación */}
      <TablaEnvios enviosIniciales={envios} couriers={couriers} productos={productos}/>
    </div>
  )
}