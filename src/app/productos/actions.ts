'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function crearProducto(data: {
  nombre: string
  nombreCorto?: string
  precio?: number
  anio?: number
}) {
  try {
    const producto = await prisma.producto.create({
      data: {
        nombre: data.nombre.trim(),
        nombreCorto: data.nombreCorto?.trim() || null,
        precio: data.precio || 0,
        anio: data.anio || new Date().getFullYear(),
      },
    })
    revalidatePath('/productos')
    return { success: true, producto }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear producto' }
  }
}

export async function actualizarProducto(
  id: string,
  data: {
    nombre: string
    nombreCorto?: string
    precio?: number
    anio?: number
  }
) {
  try {
    const producto = await prisma.producto.update({
      where: { id },
      data: {
        nombre: data.nombre.trim(),
        nombreCorto: data.nombreCorto?.trim() || null,
        precio: data.precio || 0,
        anio: data.anio || new Date().getFullYear(),
      },
    })
    revalidatePath('/productos')
    return { success: true, producto }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar producto' }
  }
}

export async function eliminarProducto(id: string) {
  try {
    // Verificar si el producto tiene envíos asociados antes de eliminar
    const enviosAsociados = await prisma.envioProducto.count({
      where: { productoId: id },
    })

    if (enviosAsociados > 0) {
      return {
        success: false,
        error: 'No se puede eliminar el producto porque está asociado a uno o más envíos.',
      }
    }

    await prisma.producto.delete({
      where: { id },
    })

    revalidatePath('/productos')
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al eliminar el producto',
    }
  }
}