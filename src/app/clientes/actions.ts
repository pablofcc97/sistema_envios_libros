'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function crearCliente(formData: FormData) {
  await prisma.cliente.create({
    data: {
      nombre: formData.get('nombre') as string,
      dni: formData.get('dni') as string,
      celular: formData.get('celular') as string,
      email: formData.get('email') as string,
    },
  })
  redirect('/clientes')
}

export async function actualizarCliente(id: string, formData: FormData) {
  await prisma.cliente.update({
    where: { id },
    data: {
      nombre: formData.get('nombre') as string,
      dni: formData.get('dni') as string,
      celular: formData.get('celular') as string,
      email: formData.get('email') as string,
    },
  })
  redirect('/clientes')
}

export async function eliminarCliente(id: string) {
  await prisma.cliente.delete({ where: { id } })
  revalidatePath('/clientes')
}