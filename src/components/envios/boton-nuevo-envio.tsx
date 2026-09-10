'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import FormularioNuevoEnvio from '@/components/formularios/nuevo-envio-form'

export function BotonNuevoEnvio({
  couriers,
  productos,
}: {
  couriers: any[]
  productos: any[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('nuevo') === 'true') {
      setOpen(true)
    }
  }, [searchParams])

  const handleOpenChange = (nuevoEstado: boolean) => {
    setOpen(nuevoEstado)
    // Limpia el parámetro ?nuevo=true de la URL al cerrar el Sheet
    if (!nuevoEstado && searchParams.get('nuevo') === 'true') {
      router.replace('/envios', { scroll: false })
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-600/20 cursor-pointer font-medium">
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
        <FormularioNuevoEnvio
          couriers={couriers}
          productos={productos}
          onSuccess={() => handleOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}