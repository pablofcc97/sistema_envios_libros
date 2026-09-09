import { Badge } from '@/components/ui/badge'

interface BadgeEstadoProps {
  estado: string // 'pendiente' | 'rotulado' | 'registrado'
}

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const estadoNormalizado = estado.toLowerCase()

  switch (estadoNormalizado) {
    case 'pendiente':
      return (
        <Badge
          variant="outline"
          className="bg-amber-950/60 text-amber-400 border-amber-800 font-medium"
        >
          Pendiente
        </Badge>
      )
    case 'registrado':
      return (
        <Badge
          variant="outline"
          className="bg-blue-950/60 text-blue-400 border-blue-800 font-medium"
        >
          Registrado
        </Badge>
      )
    case 'rotulado':
      return (
        <Badge
          variant="outline"
          className="bg-emerald-950/60 text-emerald-400 border-emerald-800 font-medium"
        >
          Rotulado
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">
          {estado}
        </Badge>
      )
  }
}