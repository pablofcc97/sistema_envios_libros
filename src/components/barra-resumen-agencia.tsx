import { Key, Truck, Package } from 'lucide-react'

export function BarraResumenAgencia({
  ultimaClave,
  totalShalom,
  totalOlva,
  totalParaAgencia,
}: {
  ultimaClave: string
  totalShalom: number
  totalOlva: number
  totalParaAgencia: number
}) {
  return (
    <div className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-8 py-3 shadow-lg">
      <div className="w-full flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
        
        {/* Métrico: Clave del Día */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-950/80 text-blue-400 rounded-lg border border-blue-800/50 shadow-inner">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] leading-tight font-medium uppercase tracking-wider">
              Última Clave del Día
            </span>
            <strong className="text-white font-mono text-base tracking-wide">
              {ultimaClave}
            </strong>
          </div>
        </div>

        {/* Métrico: Conteo por Agencia */}
        <div className="flex items-center gap-3">
          {/* Total Shalom */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3.5 py-1.5 rounded-lg">
            <Truck className="w-4 h-4 text-red-400" />
            <span className="text-slate-300 font-medium">
              SHALOM: <strong className="text-red-400 font-bold ml-1">{totalShalom}</strong>
            </span>
          </div>

          {/* Total Olva */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3.5 py-1.5 rounded-lg">
            <Package className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-medium">
              OLVA: <strong className="text-amber-400 font-bold ml-1">{totalOlva}</strong>
            </span>
          </div>

          {/* Total Combinado */}
          <div className="hidden md:flex items-center gap-2 bg-blue-950/50 border border-blue-800/60 px-3.5 py-1.5 rounded-lg text-blue-200">
            <span className="text-xs text-blue-300/80 uppercase font-semibold">Total a despacho:</span>
            <strong className="text-white font-bold">{totalParaAgencia} paquetes</strong>
          </div>
        </div>

      </div>
    </div>
  )
}