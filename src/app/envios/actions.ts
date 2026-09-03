'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function marcarRegistrado(id: string) {
  await prisma.envio.update({ where: { id }, data: { estado: 'registrado' } })
  revalidatePath('/envios')
}

export async function crearEnvio(formData: FormData) {
  const dni = formData.get('dni') as string
  const nombre = formData.get('nombre') as string
  const celular = formData.get('celular') as string
  const courierId = formData.get('courierId') as string
  const agencia = formData.get('agencia') as string
  const claveEnvio = formData.get('claveEnvio') as string

  // Upsert del cliente: si el DNI ya existe, actualiza nombre/celular; si no, lo crea
  const cliente = await prisma.cliente.upsert({
    where: { dni },
    update: { nombre, celular },
    create: { nombre, dni, celular },
  })

  // Recolecta los productos marcados con su cantidad
  const productos = await prisma.producto.findMany()
  const productosEnvio = productos
    .filter((p) => formData.get(`producto_${p.id}`) === 'on')
    .map((p) => ({
      productoId: p.id,
      cantidad: Number(formData.get(`cantidad_${p.id}`)) || 1,
    }))

  await prisma.envio.create({
    data: {
      clienteId: cliente.id,
      courierId,
      agencia,
      claveEnvio,
      productos: {
        create: productosEnvio,
      },
    },
  })

  redirect('/envios')
}