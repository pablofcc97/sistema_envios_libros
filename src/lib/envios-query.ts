import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type FiltrosEnvios = {
  busqueda: string
  fecha: string
  departamento: string
  soloConObservaciones: boolean
  pagina: number
  filasPorPagina: number
}

const incluirEnvio = {
  cliente: true,
  courier: true,
  productos: { include: { producto: true } },
} satisfies Prisma.EnvioInclude

export type EnvioConDetalle = Prisma.EnvioGetPayload<{
  include: typeof incluirEnvio
}>

export type ResultadoEnvios = {
  envios: EnvioConDetalle[]
  total: number
  posiblesDuplicados: Record<string, EnvioConDetalle>
}

function construirFiltro(filtros: Pick<FiltrosEnvios, 'busqueda' | 'fecha' | 'departamento' | 'soloConObservaciones'>) {
  const condiciones: Prisma.EnvioWhereInput[] = []
  const busqueda = filtros.busqueda.trim().slice(0, 100)

  if (busqueda) {
    condiciones.push({
      OR: [
        { cliente: { is: { nombre: { contains: busqueda } } } },
        { cliente: { is: { dni: { contains: busqueda } } } },
        { cliente: { is: { celular: { contains: busqueda } } } },
        { cliente: { is: { email: { contains: busqueda } } } },
      ],
    })
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(filtros.fecha)) {
    const inicio = new Date(`${filtros.fecha}T00:00:00.000Z`)
    if (!Number.isNaN(inicio.getTime()) && inicio.toISOString().slice(0, 10) === filtros.fecha) {
      const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000)
      condiciones.push({ createdAt: { gte: inicio, lt: fin } })
    }
  }

  const departamento = filtros.departamento.trim().slice(0, 80)
  if (departamento) condiciones.push({ departamento })

  if (filtros.soloConObservaciones) {
    condiciones.push({ observaciones: { not: null } }, { NOT: { observaciones: '' } })
  }

  return condiciones.length ? { AND: condiciones } satisfies Prisma.EnvioWhereInput : {}
}

function firmaProductos(envio: EnvioConDetalle) {
  return envio.productos
    .map((producto) => `${producto.productoId}:${producto.cantidad}`)
    .sort()
    .join('|')
}

async function buscarPosiblesDuplicados(envios: EnvioConDetalle[]) {
  const ventanaMs = 5 * 24 * 60 * 60 * 1000
  const condiciones: Prisma.EnvioWhereInput[] = envios.flatMap((envio) => {
    if (envio.estado === 'rotulado' || envio.productos.length === 0) return []

    const anteriorDesde = new Date(envio.createdAt.getTime() - ventanaMs)
    return [{
      clienteId: envio.clienteId,
      AND: [
        { createdAt: { gte: anteriorDesde } },
        {
          OR: [
            { createdAt: { lt: envio.createdAt } },
            { createdAt: envio.createdAt, id: { lt: envio.id } },
          ],
        },
        { productos: { some: { productoId: { in: envio.productos.map((item) => item.productoId) } } } },
      ],
    }]
  })

  if (condiciones.length === 0) return {}

  const candidatos = await prisma.envio.findMany({
    where: { OR: condiciones },
    include: incluirEnvio,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })

  const duplicados: Record<string, EnvioConDetalle> = {}
  for (const envio of envios) {
    if (envio.estado === 'rotulado' || envio.productos.length === 0) continue

    const fechaActual = envio.createdAt.getTime()
    const firmaActual = firmaProductos(envio)
    const anterior = candidatos.find((candidato) => {
      const diferencia = fechaActual - candidato.createdAt.getTime()
      const esAnterior = diferencia > 0
        || (diferencia === 0 && String(candidato.id).localeCompare(String(envio.id)) < 0)

      return candidato.clienteId === envio.clienteId
        && esAnterior
        && diferencia <= ventanaMs
        && firmaProductos(candidato) === firmaActual
    })

    if (anterior) duplicados[envio.id] = anterior
  }

  return duplicados
}

export async function consultarEnviosPaginados(filtros: FiltrosEnvios): Promise<ResultadoEnvios> {
  const filasPermitidas = [10, 25, 50, 100]
  const filasPorPagina = filasPermitidas.includes(filtros.filasPorPagina) ? filtros.filasPorPagina : 10
  const pagina = Number.isSafeInteger(filtros.pagina)
    ? Math.min(Math.max(1, filtros.pagina), 100_000)
    : 1
  const where = construirFiltro(filtros)

  const [envios, total] = await Promise.all([
    prisma.envio.findMany({
      where,
      include: incluirEnvio,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (pagina - 1) * filasPorPagina,
      take: filasPorPagina,
    }),
    prisma.envio.count({ where }),
  ])

  const posiblesDuplicados = await buscarPosiblesDuplicados(envios)
  return { envios, total, posiblesDuplicados }
}

export async function obtenerIdsEnviosFiltrados(filtros: FiltrosEnvios) {
  return prisma.envio.findMany({
    where: construirFiltro(filtros),
    select: { id: true, estado: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
}

export async function obtenerIdsEnviosRegistradosHoy() {
  const hoy = new Date()
  const inicio = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()))
  const fin = new Date(inicio.getTime() + 24 * 60 * 60 * 1000)

  const envios = await prisma.envio.findMany({
    where: { estado: 'registrado', createdAt: { gte: inicio, lt: fin } },
    select: { id: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })

  return envios.map((envio) => envio.id)
}
