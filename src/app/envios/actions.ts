'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function crearEnvio(formData: FormData) {
  const dni = (formData.get('dni') as string)?.trim()
  const nombre = (formData.get('nombre') as string)?.trim()
  const celular = (formData.get('celular') as string)?.trim()
  
  const emailRaw = (formData.get('email') as string)?.trim()
  const email = emailRaw ? emailRaw : null

  const direccionRaw = (formData.get('direccion') as string)?.trim()
  const direccion = direccionRaw ? direccionRaw : null
  
  const referenciaRaw = (formData.get('referencia') as string)?.trim()
  const referencia = referenciaRaw ? referenciaRaw : 'Agencia SHALOM'

  const departamento = formData.get('departamento') as string
  const courierId = formData.get('courierId') as string

  const claveEnvioRaw = (formData.get('claveEnvio') as string)?.trim()
  const claveEnvio = claveEnvioRaw ? claveEnvioRaw : null

  const observacionesRaw = (formData.get('observaciones') as string)?.trim()
  const observaciones = observacionesRaw ? observacionesRaw : null

  // Clave y dirección ya NO son obligatorias para crear
  if (!dni || !nombre || !celular || !departamento || !courierId) {
    throw new Error('Completa los campos obligatorios del cliente, departamento y courier.')
  }

  const cliente = await prisma.cliente.upsert({
    where: { dni },
    update: { nombre, celular, email },
    create: { nombre, dni, celular, email },
  })

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
      cliente: {
        connect: { id: cliente.id }
      },
      courier: {
        connect: { id: courierId }
      },
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

  revalidatePath('/envios')
  redirect('/envios')
}

// Acción para actualizar datos de envío o marcarlo como 'registrado'
export async function actualizarEnvio(id: string, formData: FormData) {
  const direccion = (formData.get('direccion') as string)?.trim()
  const claveEnvio = (formData.get('claveEnvio') as string)?.trim()
  const referencia = (formData.get('referencia') as string)?.trim() || 'Agencia SHALOM'
  const observaciones = (formData.get('observaciones') as string)?.trim() || null
  const marcarComoRegistrado = formData.get('marcarRegistrado') === 'true'

  if (marcarComoRegistrado && (!direccion || !claveEnvio)) {
    throw new Error('Para marcar como registrado, la dirección y la clave de envío son obligatorias.')
  }

  await prisma.envio.update({
    where: { id },
    data: {
      direccion,
      claveEnvio,
      referencia,
      observaciones,
      ...(marcarComoRegistrado && { estado: 'registrado' }),
    },
  })

  revalidatePath('/envios')
}

export async function marcarRegistrado(id: string, formData: FormData) {
  const direccion = (formData.get('direccion') as string)?.trim()
  const claveEnvio = (formData.get('claveEnvio') as string)?.trim()

  if (!direccion || !claveEnvio) {
    throw new Error('Debes ingresar la dirección/agencia y la clave de envío.')
  }

  await prisma.envio.update({
    where: { id },
    data: {
      direccion,
      claveEnvio,
      estado: 'registrado',
    },
  })

  revalidatePath('/envios')
}

// Acción para eliminar un envío por su ID
export async function eliminarEnvio(id: string) {
  await prisma.envio.delete({
    where: { id },
  })

  revalidatePath('/envios')
}

// Acción para actualizar todos los campos de un envío
export async function actualizarEnvioCompleto(id: string, formData: FormData) {
  const direccion = (formData.get('direccion') as string)?.trim() || null
  const claveEnvio = (formData.get('claveEnvio') as string)?.trim() || null
  const referencia = (formData.get('referencia') as string)?.trim() || 'Agencia SHALOM'
  const departamento = formData.get('departamento') as string
  const courierId = formData.get('courierId') as string
  const observaciones = (formData.get('observaciones') as string)?.trim() || null

  const productos = await prisma.producto.findMany()
  const productosEnvio = productos
    .filter((p) => formData.get(`producto_${p.id}`) === 'on')
    .map((p) => ({
      productoId: p.id,
      cantidad: Number(formData.get(`cantidad_${p.id}`)) || 1,
    }))

  await prisma.envio.update({
    where: { id },
    data: {
      courierId,
      departamento,
      direccion,
      referencia,
      claveEnvio,
      observaciones,
      productos: {
        deleteMany: {}, // Limpia los productos anteriores
        create: productosEnvio, // Inserta la nueva lista
      },
    },
  })

  revalidatePath('/envios')
}