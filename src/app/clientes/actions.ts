'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function crearCliente(data: {
  nombre: string
  dni: string
  celular: string
  email?: string
}) {
  try {
    const cliente = await prisma.cliente.create({
      data: {
        nombre: data.nombre.trim(),
        dni: data.dni.trim(),
        celular: data.celular.trim(),
        email: data.email?.trim() || null,
      },
    })
    revalidatePath('/clientes')
    return { success: true, cliente }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear cliente' }
  }
}

export async function actualizarCliente(
  id: string,
  data: {
    nombre: string
    dni: string
    celular: string
    email?: string
  }
) {
  try {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nombre: data.nombre.trim(),
        dni: data.dni.trim(),
        celular: data.celular.trim(),
        email: data.email?.trim() || null,
      },
    })
    revalidatePath('/clientes')
    return { success: true, cliente }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar cliente' }
  }
}

export async function eliminarCliente(id: string) {
  try {
    await prisma.cliente.delete({
      where: { id },
    })
    revalidatePath('/clientes')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'No se puede eliminar un cliente con envíos asociados.' }
  }
}