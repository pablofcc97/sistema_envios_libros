'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function crearCourier(formData: FormData) {
  const nombre = formData.get('nombre') as string
  await prisma.courier.create({ data: { nombre } })
  revalidatePath('/couriers')
}

export async function eliminarCourier(id: string) {
  await prisma.courier.delete({ where: { id } })
  revalidatePath('/couriers')
}