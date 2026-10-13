import { Suspense } from 'react'
import { consultarClientesPaginados } from '@/lib/clientes-query'
import { TablaClientes } from '@/components/tablas/tabla-clientes'

export const revalidate = 0

export default async function ClientesPage() {
  const filtrosIniciales = { busqueda: '', pagina: 1, filasPorPagina: 10 }
  const resultadoInicial = await consultarClientesPaginados(filtrosIniciales)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Gestión de Clientes
        </h1>
        <p className="text-sm text-slate-400">
          Administra la base de datos de remitentes y destinatarios.
        </p>
      </div>

      <Suspense fallback={null}>
        <TablaClientes
          clientesIniciales={resultadoInicial.clientes}
          totalInicial={resultadoInicial.total}
          filtrosIniciales={filtrosIniciales}
        />
      </Suspense>
    </div>
  )
}
