'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface BarraBusquedaProps {
  value: string
  onChange: (valor: string) => void
  placeholder?: string
}

export function BarraBusqueda({
  value,
  onChange,
  placeholder = 'Buscar...',
}: BarraBusquedaProps) {
  return (
    <div className="relative flex-1">
      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-8 bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:ring-blue-500"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-100 p-0.5 rounded-full hover:bg-slate-700 transition-colors cursor-pointer"
          title="Limpiar búsqueda"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}