import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type FiltrosClientes = {
  busqueda: string
  pagina: number
  filasPorPagina: number
}

export type ClienteLista = Prisma.ClienteGetPayload<Record<string, never>>

function construirFiltro(busquedaRaw: string): Prisma.ClienteWhereInput {
  const busqueda = busquedaRaw.trim().slice(0, 100)
  if (!busqueda) return {}

  return {
    OR: [
      { nombre: { contains: busqueda } },
      { dni: { contains: busqueda } },
      { celular: { contains: busqueda } },
      { email: { contains: busqueda } },
    ],
  }
}

function normalizarPaginacion(filtros: FiltrosClientes) {
  const filasPorPagina = [10, 25, 50, 100].includes(filtros.filasPorPagina)
    ? filtros.filasPorPagina
    : 10
  const pagina = Number.isSafeInteger(filtros.pagina)
    ? Math.min(Math.max(1, filtros.pagina), 100_000)
    : 1

  return { pagina, filasPorPagina }
}

export async function consultarClientesPaginados(filtros: FiltrosClientes) {
  const where = construirFiltro(filtros.busqueda)
  const { pagina, filasPorPagina } = normalizarPaginacion(filtros)

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
      skip: (pagina - 1) * filasPorPagina,
      take: filasPorPagina,
    }),
    prisma.cliente.count({ where }),
  ])

  return { clientes, total }
}

export async function obtenerIdsClientesFiltrados(busqueda: string) {
  return prisma.cliente.findMany({
    where: construirFiltro(busqueda),
    select: { id: true },
    orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
  })
}
