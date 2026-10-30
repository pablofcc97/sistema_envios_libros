'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const rutaAlmacenes = '/inventario/almacenes'

function normalizarNombre(nombre: string) {
  return nombre.trim().replace(/\s+/g, ' ')
}

export async function crearAlmacen(nombre: string) {
  if (typeof nombre !== 'string') {
    return { success: false, error: 'El nombre del almacén no es válido.' }
  }

  const nombreNormalizado = normalizarNombre(nombre)

  if (!nombreNormalizado || nombreNormalizado.length > 80) {
    return { success: false, error: 'Escribe un nombre de hasta 80 caracteres.' }
  }

  try {
    await prisma.almacen.create({ data: { nombre: nombreNormalizado } })
    revalidatePath(rutaAlmacenes)
    return { success: true }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { success: false, error: 'Ya existe un almacén con ese nombre.' }
    }

    return { success: false, error: 'No se pudo crear el almacén.' }
  }
}

export async function actualizarAlmacen(id: string, nombre: string) {
  if (typeof id !== 'string' || typeof nombre !== 'string') {
    return { success: false, error: 'Los datos del almacén no son válidos.' }
  }

  const nombreNormalizado = normalizarNombre(nombre)

  if (!id || !nombreNormalizado || nombreNormalizado.length > 80) {
    return { success: false, error: 'Escribe un nombre de hasta 80 caracteres.' }
  }

  try {
    await prisma.almacen.update({
      where: { id },
      data: { nombre: nombreNormalizado },
    })
    revalidatePath(rutaAlmacenes)
    revalidatePath('/envios')
    return { success: true }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { success: false, error: 'Ya existe un almacén con ese nombre.' }
    }

    return { success: false, error: 'No se pudo actualizar el almacén.' }
  }
}

export async function eliminarAlmacen(id: string) {
  if (typeof id !== 'string' || !id) {
    return { success: false, error: 'No se indicó un almacén válido.' }
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const [enviosAsociados, couriersPredeterminadas, existencias, movimientos] = await Promise.all([
        tx.envio.count({ where: { almacenId: id } }),
        tx.courier.count({ where: { almacenPredeterminadoId: id } }),
        tx.existenciaAlmacen.count({ where: { almacenId: id } }),
        tx.movimientoInventario.count({ where: { almacenId: id } }),
      ])

      if (enviosAsociados > 0 || couriersPredeterminadas > 0 || existencias > 0 || movimientos > 0) {
        return {
          success: false as const,
          error: 'No se puede eliminar: el almacén tiene existencias, movimientos, envíos o couriers asociados.',
        }
      }

      await tx.almacen.delete({ where: { id } })
      return { success: true as const }
    })

    if (resultado.success) {
      revalidatePath(rutaAlmacenes)
      revalidatePath('/configuracion')
    }

    return resultado
  } catch {
    return { success: false, error: 'No se pudo eliminar el almacén.' }
  }
}
