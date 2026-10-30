'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { aplicarMovimientoStock } from '@/lib/inventario/stock'

function validarTexto(valor: unknown, maximo: number) {
  return typeof valor === 'string' ? valor.trim().slice(0, maximo) : ''
}

function validarCantidad(valor: number) {
  return Number.isSafeInteger(valor) && valor > 0
}

function revalidarInventario() {
  revalidatePath('/inventario')
  revalidatePath('/productos')
}

export async function registrarEntradaStock(
  almacenId: string,
  productoId: string,
  cantidad: number,
  motivo: string,
) {
  if (!almacenId || !productoId || !validarCantidad(cantidad)) {
    return { success: false, error: 'Selecciona un almacén, un producto y una cantidad válida.' }
  }

  try {
    await prisma.$transaction((tx) => aplicarMovimientoStock(tx, {
      almacenId,
      productoId,
      delta: cantidad,
      tipo: 'ENTRADA',
      motivo: validarTexto(motivo, 200) || 'Entrada de inventario',
    }))
    revalidarInventario()
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'No se pudo registrar la entrada.' }
  }
}

export async function ajustarStock(
  almacenId: string,
  productoId: string,
  cantidadObjetivo: number,
  motivo: string,
) {
  if (!almacenId || !productoId || !Number.isSafeInteger(cantidadObjetivo) || cantidadObjetivo < 0) {
    return { success: false, error: 'Ingresa una existencia final válida (cero o más).'}
  }

  try {
    const cambio = await prisma.$transaction(async (tx) => {
      const existencia = await tx.existenciaAlmacen.findUnique({
        where: { almacenId_productoId: { almacenId, productoId } },
      })
      const delta = cantidadObjetivo - (existencia?.cantidad ?? 0)
      if (delta === 0) return false

      await aplicarMovimientoStock(tx, {
        almacenId,
        productoId,
        delta,
        tipo: 'AJUSTE',
        motivo: validarTexto(motivo, 200) || 'Ajuste manual de inventario',
      })
      return true
    })
    if (cambio) revalidarInventario()
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'No se pudo ajustar el stock.' }
  }
}

export async function transferirStock(
  almacenOrigenId: string,
  almacenDestinoId: string,
  productoId: string,
  cantidad: number,
  motivo: string,
) {
  if (!almacenOrigenId || !almacenDestinoId || almacenOrigenId === almacenDestinoId || !productoId || !validarCantidad(cantidad)) {
    return { success: false, error: 'Selecciona almacenes distintos y una cantidad válida.' }
  }

  try {
    const operacionId = randomUUID()
    await prisma.$transaction(async (tx) => {
      await aplicarMovimientoStock(tx, {
        almacenId: almacenOrigenId,
        productoId,
        delta: -cantidad,
        tipo: 'TRANSFERENCIA',
        motivo: `Salida hacia otro almacén${validarTexto(motivo, 160) ? `: ${validarTexto(motivo, 160)}` : ''}`,
        operacionId,
      })
      await aplicarMovimientoStock(tx, {
        almacenId: almacenDestinoId,
        productoId,
        delta: cantidad,
        tipo: 'TRANSFERENCIA',
        motivo: `Entrada desde otro almacén${validarTexto(motivo, 160) ? `: ${validarTexto(motivo, 160)}` : ''}`,
        operacionId,
      })
    })
    revalidarInventario()
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'No se pudo completar la transferencia.' }
  }
}
