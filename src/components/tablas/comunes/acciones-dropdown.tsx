'use client'

import { ReactNode } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface AccionTabla {
  label: string
  icon?: ReactNode
  onClick: () => void | Promise<void>
  variant?: 'default' | 'destructive'
  hidden?: boolean
}

interface AccionesDropdownProps {
  acciones: AccionTabla[]
}

export function AccionesDropdown({ acciones }: AccionesDropdownProps) {
  const accionesVisibles = acciones.filter((a) => !a.hidden)

  if (accionesVisibles.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-800 text-slate-400">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
        {accionesVisibles.map((accion, idx) => (
          <DropdownMenuItem
            key={idx}
            onClick={accion.onClick}
            className={`gap-2 cursor-pointer focus:bg-slate-800 ${
              accion.variant === 'destructive'
                ? 'text-red-400 focus:text-red-400'
                : 'text-slate-200'
            }`}
          >
            {accion.icon}
            <span>{accion.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}