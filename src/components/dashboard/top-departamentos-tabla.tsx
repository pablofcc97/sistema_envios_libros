'use client'

import { MapPin } from 'lucide-react'

interface DepartamentoItem {
  departamento: string
  total: number
  porcentaje: number
}

export function TopDepartamentosTabla({ datos }: { datos: DepartamentoItem[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        <MapPin className="w-4 h-4 text-rose-400" />
        Top Departamentos de Destino
      </h3>

      <div className="space-y-3">
        {datos.map((item, index) => (
          <div key={item.departamento} className="space-y-1">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-slate-200 flex items-center gap-2">
                <span className="font-mono text-slate-500 w-4 text-right">
                  {index + 1}.
                </span>
                <span className="uppercase">{item.departamento}</span>
              </span>
              <span className="font-mono text-slate-400">
                <strong className="text-white font-bold">{item.total}</strong> envíos ({item.porcentaje}%)
              </span>
            </div>

            {/* Barra de progreso decorativa */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${item.porcentaje}%` }}
              />
            </div>
          </div>
        ))}

        {datos.length === 0 && (
          <p className="text-xs text-slate-500 py-4 text-center">
            No hay registros de envíos aún.
          </p>
        )}
      </div>
    </div>
  )
}