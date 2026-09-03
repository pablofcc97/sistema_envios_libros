'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function crearProducto(formData: FormData) {
  const nombre = formData.get('nombre') as string
  await prisma.producto.create({ data: { nombre } })
  revalidatePath('/productos')
}

export async function eliminarProducto(id: string) {
  await prisma.producto.delete({ where: { id } })
  revalidatePath('/productos')
}