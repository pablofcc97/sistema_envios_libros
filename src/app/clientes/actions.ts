'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import {
  consultarClientesPaginados,
  obtenerIdsClientesFiltrados,
  type FiltrosClientes,
} from '@/lib/clientes-query'

export async function consultarClientes(filtros: FiltrosClientes) {
  return consultarClientesPaginados(filtros)
}

export async function consultarIdsClientes(busqueda: string) {
  return obtenerIdsClientesFiltrados(busqueda)
}

export async function obtenerClienteParaEdicion(id: string) {
  return prisma.cliente.findUnique({ where: { id } })
}

const incluirEnviosHistorial = {
  courier: true,
  productos: { include: { producto: true } },
} satisfies Prisma.EnvioInclude

export async function obtenerHistorialCliente(clienteId: string) {
  return prisma.envio.findMany({
    where: { clienteId },
    include: incluirEnviosHistorial,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
}

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
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear cliente' }
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
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar cliente' }
  }
}

export async function eliminarCliente(id: string) {
  try {
    await prisma.cliente.delete({
      where: { id },
    })
    revalidatePath('/clientes')
    return { success: true }
  } catch {
    return { success: false, error: 'No se puede eliminar un cliente con envíos asociados.' }
  }
}
