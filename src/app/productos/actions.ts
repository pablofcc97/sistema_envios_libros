'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function crearProducto(data: {
  nombre: string
  nombreCorto?: string
  destacado?: boolean
  esPack?: boolean
  precio?: number
  anio?: number
}) {
  try {
    const producto = await prisma.producto.create({
      data: {
        nombre: data.nombre.trim(),
        nombreCorto: data.nombreCorto?.trim() || null,
        destacado: data.destacado ?? false,
        esPack: data.esPack ?? false,
        precio: data.precio || 0,
        anio: data.anio || new Date().getFullYear(),
      },
    })
    revalidatePath('/productos')
    revalidatePath('/inventario')
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
    destacado?: boolean
    esPack?: boolean
    precio?: number
    anio?: number
  }
) {
  try {
    const esPack = data.esPack ?? false
    if (esPack) {
      const [existencias, movimientos, usadoEnPacks] = await Promise.all([
        prisma.existenciaAlmacen.count({ where: { productoId: id } }),
        prisma.movimientoInventario.count({ where: { productoId: id } }),
        prisma.componentePack.count({ where: { productoId: id } }),
      ])
      if (existencias > 0 || movimientos > 0 || usadoEnPacks > 0) {
        return {
          success: false,
          error: 'No se puede convertir: el producto tiene stock/movimientos o ya es componente de otro pack.',
        }
      }
    }

    if (!esPack) {
      const componentes = await prisma.componentePack.count({ where: { packId: id } })
      if (componentes > 0) {
        return {
          success: false,
          error: 'Quita primero los componentes del pack antes de convertirlo en producto individual.',
        }
      }
    }

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        nombre: data.nombre.trim(),
        nombreCorto: data.nombreCorto?.trim() || null,
        destacado: data.destacado ?? false,
        esPack,
        precio: data.precio || 0,
        anio: data.anio || new Date().getFullYear(),
      },
    })
    revalidatePath('/productos')
    revalidatePath('/inventario')
    return { success: true, producto }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar producto' }
  }
}

export async function eliminarProducto(id: string) {
  try {
    const [enviosAsociados, existencias, movimientos, componentesPack, usadoEnPacks, snapshots] = await Promise.all([
      prisma.envioProducto.count({ where: { productoId: id } }),
      prisma.existenciaAlmacen.count({ where: { productoId: id } }),
      prisma.movimientoInventario.count({ where: { productoId: id } }),
      prisma.componentePack.count({ where: { packId: id } }),
      prisma.componentePack.count({ where: { productoId: id } }),
      prisma.envioProductoComponente.count({ where: { productoId: id } }),
    ])

    if (enviosAsociados > 0 || existencias > 0 || movimientos > 0 || componentesPack > 0 || usadoEnPacks > 0 || snapshots > 0) {
      return {
        success: false,
        error: 'No se puede eliminar: el producto tiene envíos, existencias, movimientos o forma parte de un pack.',
      }
    }

    await prisma.producto.delete({
      where: { id },
    })

    revalidatePath('/productos')
    revalidatePath('/inventario')
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al eliminar el producto',
    }
  }
}

export async function guardarComponentesPack(
  packId: string,
  componentes: { productoId: string; cantidad: number }[],
) {
  if (!packId || !Array.isArray(componentes) || componentes.length === 0) {
    return { success: false, error: 'Un pack debe contener al menos un producto.' }
  }

  if (componentes.some((componente) => !componente || typeof componente.productoId !== 'string')) {
    return { success: false, error: 'La lista de componentes no es válida.' }
  }

  const productosUnicos = new Set(componentes.map((componente) => componente.productoId))
  if (
    productosUnicos.size !== componentes.length
    || componentes.some((componente) => !componente.productoId || componente.productoId === packId
      || !Number.isSafeInteger(componente.cantidad) || componente.cantidad <= 0)
  ) {
    return { success: false, error: 'Revisa los productos y cantidades del pack.' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const pack = await tx.producto.findUnique({ where: { id: packId }, select: { esPack: true } })
      if (!pack?.esPack) throw new Error('Marca el producto como pack antes de configurar sus componentes.')

      const productos = await tx.producto.findMany({
        where: { id: { in: componentes.map((componente) => componente.productoId) } },
        select: { id: true, esPack: true },
      })
      if (productos.length !== componentes.length || productos.some((producto) => producto.esPack)) {
        throw new Error('Los packs solo pueden contener productos individuales existentes.')
      }

      await tx.componentePack.deleteMany({ where: { packId } })
      await tx.componentePack.createMany({
        data: componentes.map((componente) => ({ ...componente, packId })),
      })
    })

    revalidatePath('/productos')
    revalidatePath('/envios')
    revalidatePath('/inventario')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo guardar la composición del pack.',
    }
  }
}
