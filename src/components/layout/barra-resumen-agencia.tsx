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
    <div className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-900/95 py-3 pl-16 pr-3 shadow-lg backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex w-full flex-col gap-3 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:text-sm">
        
        {/* Métrico: Clave del Día */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="rounded-lg border border-blue-800/50 bg-blue-950/80 p-1.5 text-blue-400 shadow-inner sm:p-2">
            <Key className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 items-baseline gap-2 whitespace-nowrap">
            <span className="text-[9px] font-medium uppercase leading-tight tracking-wider text-slate-400 sm:text-[11px]">
              Última Clave del Día
            </span>
            <strong className="truncate font-mono text-sm tracking-wide text-white sm:text-base">
              {ultimaClave}
            </strong>
          </div>
        </div>

        {/* Métrico: Conteo por Agencia */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Total Shalom */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-1.5 sm:gap-2 sm:px-3.5">
            <Truck className="h-3.5 w-3.5 shrink-0 text-red-400 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap font-medium text-slate-300">
              SHALOM: <strong className="text-red-400 font-bold ml-1">{totalShalom}</strong>
            </span>
          </div>

          {/* Total Olva */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-1.5 sm:gap-2 sm:px-3.5">
            <Package className="h-3.5 w-3.5 shrink-0 text-amber-400 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap font-medium text-slate-300">
              OLVA: <strong className="text-amber-400 font-bold ml-1">{totalOlva}</strong>
            </span>
          </div>

          {/* Total Combinado */}
          <div className="flex items-center gap-1.5 rounded-lg border border-blue-800/60 bg-blue-950/50 px-2.5 py-1.5 text-blue-200 sm:gap-2 sm:px-3.5">
            <span className="whitespace-nowrap text-[10px] font-semibold uppercase text-blue-300/80 sm:text-xs">Despacho:</span>
            <strong className="whitespace-nowrap font-bold text-white">{totalParaAgencia}</strong>
          </div>
        </div>

      </div>
    </div>
  )
}
