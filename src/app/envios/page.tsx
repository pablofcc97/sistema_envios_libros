import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { consultarEnviosPaginados, obtenerIdsEnviosRegistradosHoy } from '@/lib/envios-query'
import { TablaEnvios } from '@/components/tablas/tabla-envios'
import { BotonNuevoEnvio } from '@/components/envios/boton-nuevo-envio'

export const revalidate = 0

export default async function EnviosPage() {
  const filtrosIniciales = {
    busqueda: '',
    fecha: '',
    departamento: '',
    soloConObservaciones: false,
    pagina: 1,
    filasPorPagina: 10,
  }

  const [resultadoInicial, couriers, productos, config, gruposDepartamento, idsRegistradosHoy] = await Promise.all([
    consultarEnviosPaginados(filtrosIniciales),
    prisma.courier.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.producto.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.configuracion.findUnique({ where: { id: 'global' } }),
    prisma.envio.groupBy({
      by: ['departamento'],
      orderBy: { departamento: 'asc' },
    }),
    obtenerIdsEnviosRegistradosHoy(),
  ])

  return (
    <div className="space-y-6 text-slate-100">
      {/* Encabezado y Acción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Envíos</h1>
          <p className="text-sm text-slate-400">
            Filtra, genera rótulos y administra tus despachos.
          </p>
        </div>

        {/* Botón y Sheet controlado client-side */}
        <Suspense fallback={null}>
          <BotonNuevoEnvio 
            couriers={couriers} 
            productos={productos} 
            courierPorDefectoId={config?.courierPorDefectoId} 
          />
        </Suspense>
      </div>

      {/* Tabla Interactiva con Filtros y Exportación */}
      <TablaEnvios
        enviosIniciales={resultadoInicial.envios}
        totalInicial={resultadoInicial.total}
        posiblesDuplicadosIniciales={resultadoInicial.posiblesDuplicados}
        filtrosIniciales={filtrosIniciales}
        departamentosDisponibles={gruposDepartamento.map((grupo) => grupo.departamento)}
        idsRegistradosHoyIniciales={idsRegistradosHoy}
        couriers={couriers}
        productos={productos}
      />
    </div>
  )
}
