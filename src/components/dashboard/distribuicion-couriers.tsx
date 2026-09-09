import { Truck } from 'lucide-react'

interface DatosCourier {
  nombre: string
  total: number
}

export function DistribuicionCouriers({ datos }: { datos: DatosCourier[] }) {
  const totalGeneral = datos.reduce((acc, curr) => acc + curr.total, 0)

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        <Truck className="w-4 h-4 text-blue-400" />
        Envíos por Agencia
      </h3>

      <div className="space-y-3">
        {datos.map((item) => {
          const porcentaje =
            totalGeneral > 0
              ? Math.round((item.total / totalGeneral) * 100)
              : 0

          return (
            <div key={item.nombre} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>{item.nombre}</span>
                <span className="font-mono text-slate-400">
                  {item.total} ({porcentaje}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>
          )
        })}

        {datos.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-4">
            Sin datos de agencias.
          </p>
        )}
      </div>
    </div>
  )
}