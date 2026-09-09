import { ReactNode } from 'react'

interface KpiCardProps {
  titulo: string
  valor: number | string
  subtexto?: string
  icono: ReactNode
  variante?: 'default' | 'success' | 'warning'
}

export function KpiCard({
  titulo,
  valor,
  subtexto,
  icono,
  variante = 'default',
}: KpiCardProps) {
  const borderColors = {
    default: 'border-slate-800',
    success: 'border-emerald-900/50 bg-emerald-950/10',
    warning: 'border-amber-900/50 bg-amber-950/10',
  }

  return (
    <div
      className={`bg-slate-900 border p-5 rounded-xl shadow-sm space-y-3 ${borderColors[variante]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {titulo}
        </span>
        <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
          {icono}
        </div>
      </div>

      <div>
        <div className="text-2xl font-bold text-white font-mono">{valor}</div>
        {subtexto && (
          <p className="text-xs text-slate-400 mt-1">{subtexto}</p>
        )}
      </div>
    </div>
  )
}