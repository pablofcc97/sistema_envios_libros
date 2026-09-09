'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function crearCourier(nombre: string) {
  try {
    const courier = await prisma.courier.create({
      data: { nombre: nombre.trim() },
    })
    revalidatePath('/configuracion')
    return { success: true, courier }
  } catch (error: any) {
    return { success: false, error: 'El courier ya existe o no se pudo crear.' }
  }
}

export async function actualizarCourier(id: string, nombre: string) {
  try {
    const courier = await prisma.courier.update({
      where: { id },
      data: { nombre: nombre.trim() },
    })
    revalidatePath('/configuracion')
    return { success: true, courier }
  } catch (error: any) {
    return { success: false, error: 'No se pudo actualizar el courier.' }
  }
}

export async function eliminarCourier(id: string) {
  try {
    const enviosAsociados = await prisma.envio.count({
      where: { courierId: id },
    })

    if (enviosAsociados > 0) {
      return {
        success: false,
        error: 'No se puede eliminar porque existen envíos registrados con este courier.',
      }
    }

    await prisma.courier.delete({ where: { id } })
    revalidatePath('/configuracion')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Error al eliminar el courier.' }
  }
}