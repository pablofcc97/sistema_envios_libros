import Link from 'next/link'
import { BadgeEstado } from '@/components/ui/badge-estado'

export function UltimosEnviosTabla({ envios }: { envios: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
          <tr>
            <th className="p-3">Cliente</th>
            <th className="p-3">Agencia</th>
            <th className="p-3">Destino</th>
            <th className="p-3 text-center">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {envios.map((envio) => (
            <tr key={envio.id} className="hover:bg-slate-800/40 transition-colors">
              <td className="p-3 font-medium text-slate-100">
                {envio.cliente.nombre}
              </td>
              <td className="p-3 text-slate-300">{envio.courier.nombre}</td>
              <td className="p-3 text-slate-400">{envio.departamento}</td>
              <td className="p-3 text-center">
                <BadgeEstado estado={envio.estado}/>
              </td>
            </tr>
          ))}

          {envios.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-6 text-slate-500">
                Aún no hay envíos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pt-3 text-right">
        <Link
          href="/envios"
          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
        >
          Ver todos los envíos →
        </Link>
      </div>
    </div>
  )
}