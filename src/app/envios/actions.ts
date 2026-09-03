'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function marcarRegistrado(id: string) {
  await prisma.envio.update({ where: { id }, data: { estado: 'registrado' } })
  revalidatePath('/envios')
}

export async function crearEnvio(formData: FormData) {
  const dni = (formData.get('dni') as string)?.trim()
  const nombre = (formData.get('nombre') as string)?.trim()
  const celular = (formData.get('celular') as string)?.trim()
  
  // Convertir strings vacíos a null para campos opcionales en Prisma
  const emailRaw = (formData.get('email') as string)?.trim()
  const email = emailRaw ? emailRaw : null

  const direccion = (formData.get('direccion') as string)?.trim()
  
  const referenciaRaw = (formData.get('referencia') as string)?.trim()
  const referencia = referenciaRaw ? referenciaRaw : null

  const departamento = formData.get('departamento') as string
  const courierId = formData.get('courierId') as string
  const claveEnvio = (formData.get('claveEnvio') as string)?.trim()

  const observacionesRaw = (formData.get('observaciones') as string)?.trim()
  const observaciones = observacionesRaw ? observacionesRaw : null

  if (!dni || !nombre || !celular || !direccion || !departamento || !courierId || !claveEnvio) {
    throw new Error('Todos los campos obligatorios deben ser completados.')
  }

  // Upsert del cliente: si el DNI ya existe, actualiza nombre/celular; si no, lo crea
  const cliente = await prisma.cliente.upsert({
    where: { dni },
    update: { nombre, celular, email },
    create: { nombre, dni, celular, email },
  })

  // Recolecta los productos marcados con su cantidad
  const productos = await prisma.producto.findMany()
  const productosEnvio = productos
    .filter((p) => formData.get(`producto_${p.id}`) === 'on')
    .map((p) => ({
      productoId: p.id,
      cantidad: Number(formData.get(`cantidad_${p.id}`)) || 1,
    }))

  if (productosEnvio.length === 0) {
    throw new Error('Debes seleccionar al menos un producto para registrar el envío.')
  }

  await prisma.envio.create({
    data: {
      clienteId: cliente.id,
      courierId,
      direccion,
      referencia,
      departamento,
      claveEnvio,
      observaciones,
      productos: {
        create: productosEnvio,
      },
    },
  })

  redirect('/envios')
}