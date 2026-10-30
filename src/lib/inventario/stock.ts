import type { Prisma } from '@prisma/client'

type Tx = Prisma.TransactionClient

export async function aplicarMovimientoStock(
  tx: Tx,
  input: {
    almacenId: string
    productoId: string
    delta: number
    tipo: string
    motivo?: string | null
    envioId?: string | null
    operacionId?: string | null
  },
) {
  if (!Number.isInteger(input.delta) || input.delta === 0) {
    throw new Error('La cantidad del movimiento debe ser un número entero distinto de cero.')
  }

  const producto = await tx.producto.findUnique({
    where: { id: input.productoId },
    select: { nombre: true, esPack: true },
  })
  if (!producto) throw new Error('No se encontró el producto del movimiento.')
  if (producto.esPack) throw new Error('Los packs no tienen stock propio; registra existencias de sus componentes.')

  const clave = {
    almacenId_productoId: {
      almacenId: input.almacenId,
      productoId: input.productoId,
    },
  }
  const existencia = await tx.existenciaAlmacen.findUnique({ where: clave })
  const cantidadActual = existencia?.cantidad ?? 0
  const cantidadNueva = cantidadActual + input.delta

  if (cantidadNueva < 0) {
    const almacen = await tx.almacen.findUnique({ where: { id: input.almacenId }, select: { nombre: true } })
    throw new Error(
      `Stock insuficiente de ${producto?.nombre ?? 'producto'} en ${almacen?.nombre ?? 'almacén'}. Disponible: ${cantidadActual}.`,
    )
  }

  await tx.existenciaAlmacen.upsert({
    where: clave,
    create: {
      almacenId: input.almacenId,
      productoId: input.productoId,
      cantidad: cantidadNueva,
    },
    update: { cantidad: cantidadNueva },
  })

  await tx.movimientoInventario.create({
    data: {
      tipo: input.tipo,
      cantidad: input.delta,
      motivo: input.motivo?.trim() || null,
      operacionId: input.operacionId ?? null,
      productoId: input.productoId,
      almacenId: input.almacenId,
      envioId: input.envioId ?? null,
    },
  })

  return cantidadNueva
}
