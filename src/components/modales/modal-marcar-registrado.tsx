'use client'

import { useState } from 'react'
import { marcarRegistrado } from '@/app/envios/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface ModalMarcarRegistradoProps {
  envio: {
    id: string
    clienteNombre: string
    direccion?: string | null
    claveEnvio?: string | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalMarcarRegistrado({
  envio,
  open,
  onOpenChange,
}: ModalMarcarRegistradoProps) {
  const [cargando, setCargando] = useState(false)

  if (!envio) return null

  async function handleSubmit(formData: FormData) {
    setCargando(true)
    try {
      await marcarRegistrado(envio.id, formData)
      onOpenChange(false)
    } catch (error: any) {
      alert(error.message || 'Ocurrió un error al guardar.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Marcar Envío como Registrado
          </DialogTitle>
          <p className="text-xs text-slate-400">
            Cliente: <span className="text-slate-200 font-medium">{envio.clienteNombre}</span>
          </p>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Dirección / Agencia de Shalom *
            </label>
            <Input
              name="direccion"
              defaultValue={envio.direccion ?? ''}
              placeholder="Ej. Agencia Av. La Marina 123"
              required
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Clave de Envío *
            </label>
            <Input
              name="claveEnvio"
              defaultValue={envio.claveEnvio ?? ''}
              placeholder="Ej. 8492"
              required
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 text-sm"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={cargando}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
            >
              {cargando ? 'Guardando...' : 'Confirmar Registro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}