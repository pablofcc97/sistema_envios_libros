'use server'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  consultarEnviosPaginados,
  obtenerIdsEnviosFiltrados,
  obtenerIdsEnviosRegistradosHoy,
  type FiltrosEnvios,
} from '@/lib/envios-query'
import { aplicarMovimientoStock } from '@/lib/inventario/stock'

type ProductoConComponentes = Prisma.ProductoGetPayload<{
  include: { componentesPack: { include: { producto: true } } }
}>

function obtenerDesgloseFisico(producto: ProductoConComponentes, cantidad: number) {
  if (!producto.esPack) {
    return [{ productoId: producto.id, cantidad, nombreProducto: producto.nombre, nombreCorto: producto.nombreCorto }]
  }

  if (producto.componentesPack.length === 0) {
    throw new Error(`Configura los componentes del pack “${producto.nombreCorto || producto.nombre}” antes de usarlo.`)
  }

  if (producto.componentesPack.some((componente) => componente.producto.esPack)) {
    throw new Error('Un pack solo puede contener productos individuales, no otros packs.')
  }

  return producto.componentesPack.map((componente) => ({
    productoId: componente.productoId,
    cantidad: componente.cantidad * cantidad,
    nombreProducto: componente.producto.nombre,
    nombreCorto: componente.producto.nombreCorto,
  }))
}

async function guardarSnapshotsPack(
  tx: Prisma.TransactionClient,
  lineas: Array<{
    id: string
    cantidad: number
    producto: ProductoConComponentes
  }>,
) {
  const snapshots = lineas.flatMap((linea) => (
    linea.producto.esPack
      ? obtenerDesgloseFisico(linea.producto, linea.cantidad).map((componente) => ({
          envioProductoId: linea.id,
          productoId: componente.productoId,
          nombreProducto: componente.nombreProducto,
          nombreCorto: componente.nombreCorto,
          cantidad: componente.cantidad,
        }))
      : []
  ))

  if (snapshots.length > 0) {
    await tx.envioProductoComponente.createMany({ data: snapshots })
  }
}

async function revertirMovimientosEnvio(
  tx: Prisma.TransactionClient,
  envioId: string,
  motivo: string,
) {
  const movimientos = await tx.movimientoInventario.findMany({
    where: { envioId },
    select: { almacenId: true, productoId: true, cantidad: true },
  })
  const saldos = new Map<string, { almacenId: string; productoId: string; cantidad: number }>()

  for (const movimiento of movimientos) {
    const key = `${movimiento.almacenId}:${movimiento.productoId}`
    const saldo = saldos.get(key)
    saldos.set(key, {
      almacenId: movimiento.almacenId,
      productoId: movimiento.productoId,
      cantidad: (saldo?.cantidad ?? 0) + movimiento.cantidad,
    })
  }

  for (const saldo of saldos.values()) {
    if (saldo.cantidad !== 0) {
      await aplicarMovimientoStock(tx, {
        almacenId: saldo.almacenId,
        productoId: saldo.productoId,
        delta: -saldo.cantidad,
        tipo: 'REVERSION_ENVIO',
        motivo,
        envioId,
      })
    }
  }
}

export async function consultarEnvios(filtros: FiltrosEnvios) {
  return consultarEnviosPaginados(filtros)
}

export async function consultarIdsEnvios(filtros: FiltrosEnvios) {
  return obtenerIdsEnviosFiltrados(filtros)
}

export async function consultarIdsEnviosRegistradosHoy() {
  return obtenerIdsEnviosRegistradosHoy()
}

export async function crearEnvio(formData: FormData) {
  const dni = (formData.get('dni') as string)?.trim()
  const nombre = (formData.get('nombre') as string)?.trim()
  const celular = (formData.get('celular') as string)?.trim()
  
  const emailRaw = (formData.get('email') as string)?.trim()
  const email = emailRaw ? emailRaw : null

  const direccionRaw = (formData.get('direccion') as string)?.trim()
  const direccion = direccionRaw ? direccionRaw : null
  
  const referenciaRaw = (formData.get('referencia') as string)?.trim()
  const referencia = referenciaRaw || null

  const departamento = formData.get('departamento') as string
  const courierId = formData.get('courierId') as string

  const claveEnvioRaw = (formData.get('claveEnvio') as string)?.trim()
  const claveEnvio = claveEnvioRaw ? claveEnvioRaw : null

  const observacionesRaw = (formData.get('observaciones') as string)?.trim()
  const observaciones = observacionesRaw ? observacionesRaw : null
  const almacenSolicitadoId = (formData.get('almacenId') as string | null)?.trim() || null

  if (!dni || !nombre || !celular || !departamento || !courierId) {
    throw new Error('Completa los campos obligatorios del cliente, departamento y courier.')
  }

  await prisma.$transaction(async (tx) => {
    const courier = await tx.courier.findUnique({
      where: { id: courierId },
      select: { descuentaInventario: true, almacenPredeterminadoId: true },
    })
    if (!courier) throw new Error('Selecciona una courier válida.')

    const almacenId = formData.has('almacenId') ? almacenSolicitadoId : courier.almacenPredeterminadoId
    if (courier.descuentaInventario && !almacenId) {
      throw new Error('Selecciona un almacén para poder descontar el inventario.')
    }

    const productos = await tx.producto.findMany({
      include: { componentesPack: { include: { producto: true } } },
    })
    const productosEnvio = productos
      .filter((producto) => formData.get(`producto_${producto.id}`) === 'on')
      .map((producto) => ({
        producto,
        productoId: producto.id,
        cantidad: Number(formData.get(`cantidad_${producto.id}`) || 1),
      }))

    if (productosEnvio.length === 0) {
      throw new Error('Debes seleccionar al menos un producto para registrar el envío.')
    }
    if (productosEnvio.some((producto) => !Number.isSafeInteger(producto.cantidad) || producto.cantidad <= 0)) {
      throw new Error('Las cantidades de los productos deben ser enteros mayores a cero.')
    }
    const desgloseFisico = productosEnvio.flatMap((linea) => obtenerDesgloseFisico(linea.producto, linea.cantidad))

    const cliente = await tx.cliente.upsert({
      where: { dni },
      update: { nombre, celular, email },
      create: { nombre, dni, celular, email },
    })

    const envio = await tx.envio.create({
      data: {
        clienteId: cliente.id,
        courierId,
        almacenId,
        inventarioProcesado: true,
        stockDescontado: courier.descuentaInventario,
        direccion,
        referencia,
        departamento,
        claveEnvio,
        observaciones,
        productos: { create: productosEnvio.map(({ productoId, cantidad }) => ({ productoId, cantidad })) },
      },
      include: {
        productos: {
          include: {
            producto: { include: { componentesPack: { include: { producto: true } } } },
          },
        },
      },
    })

    await guardarSnapshotsPack(tx, envio.productos)

    if (courier.descuentaInventario && almacenId) {
      for (const producto of desgloseFisico) {
        await aplicarMovimientoStock(tx, {
          almacenId,
          productoId: producto.productoId,
          delta: -producto.cantidad,
          tipo: 'SALIDA_ENVIO',
          motivo: 'Descuento por creación de envío',
          envioId: envio.id,
        })
      }
    }
  })

  // Revalida los datos en segundo plano sin interrumpir la promesa del cliente
  revalidatePath('/envios')
  revalidatePath('/inventario')
}

// Acción para actualizar datos de envío o marcarlo como 'registrado'
export async function actualizarEnvio(id: string, formData: FormData) {
  const direccion = (formData.get('direccion') as string)?.trim()
  const claveEnvio = (formData.get('claveEnvio') as string)?.trim()
  const referencia = (formData.get('referencia') as string)?.trim() || null
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
  await prisma.$transaction(async (tx) => {
    const envio = await tx.envio.findUnique({
      where: { id },
      select: {
        stockDescontado: true,
      },
    })
    if (!envio) throw new Error('No se encontró el envío.')

    if (envio.stockDescontado) {
      await revertirMovimientosEnvio(tx, id, `Reversión por eliminación de envío ${id}`)
    }

    await tx.envio.delete({ where: { id } })
  })

  revalidatePath('/envios')
  revalidatePath('/inventario')
}

// Acción para actualizar todos los campos de un envío
export async function actualizarEnvioCompleto(id: string, formData: FormData) {
  const direccion = (formData.get('direccion') as string)?.trim() || null
  const claveEnvio = (formData.get('claveEnvio') as string)?.trim() || null
  const referencia = (formData.get('referencia') as string)?.trim() || null
  const departamento = formData.get('departamento') as string
  const courierId = formData.get('courierId') as string
  const almacenSolicitadoId = (formData.get('almacenId') as string | null)?.trim() || null
  const observaciones = (formData.get('observaciones') as string)?.trim() || null

  // Procesar Fecha de Envío/Registro
  const fechaStr = formData.get('createdAt') as string
  const nuevaFecha = fechaStr ? new Date(`${fechaStr}T12:00:00Z`) : undefined

  const actualizarCliente = formData.has('dni')
  const dni = (formData.get('dni') as string | null)?.trim()
  const nombre = (formData.get('nombre') as string | null)?.trim()
  const celular = (formData.get('celular') as string | null)?.trim()
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() || null

  if (actualizarCliente && (!dni || !nombre || !celular)) {
    throw new Error('Completa el nombre, DNI y celular del cliente.')
  }
  if (actualizarCliente && (!/^\d{8}$/.test(dni!) || !/^\d{9}$/.test(celular!))) {
    throw new Error('Verifica que el DNI tenga 8 dígitos y el celular 9.')
  }

  await prisma.$transaction(async (tx) => {
    const envioActual = await tx.envio.findUnique({
      where: { id },
      select: {
        clienteId: true,
        almacenId: true,
        inventarioProcesado: true,
        stockDescontado: true,
      },
    })
    if (!envioActual) throw new Error('No se encontró el envío que quieres actualizar.')

    const courier = await tx.courier.findUnique({
      where: { id: courierId },
      select: { descuentaInventario: true, almacenPredeterminadoId: true },
    })
    if (!courier) throw new Error('Selecciona una courier válida.')
    const almacenId = formData.has('almacenId') ? almacenSolicitadoId : courier.almacenPredeterminadoId

    const productos = await tx.producto.findMany({
      include: { componentesPack: { include: { producto: true } } },
    })
    const productosEnvio = productos
      .filter((producto) => formData.get(`producto_${producto.id}`) === 'on')
      .map((producto) => ({
        producto,
        productoId: producto.id,
        cantidad: Number(formData.get(`cantidad_${producto.id}`) || 1),
      }))
    if (productosEnvio.length === 0) {
      throw new Error('Debes seleccionar al menos un producto para el envío.')
    }
    if (productosEnvio.some((producto) => !Number.isSafeInteger(producto.cantidad) || producto.cantidad <= 0)) {
      throw new Error('Las cantidades de los productos deben ser enteros mayores a cero.')
    }
    const desgloseFisico = productosEnvio.flatMap((linea) => obtenerDesgloseFisico(linea.producto, linea.cantidad))

    // Solo los envíos creados con el módulo de inventario activo se recalculan al editar.
    const recalcularInventario = envioActual.inventarioProcesado
    const descontarNuevoStock = recalcularInventario && courier.descuentaInventario
    if (descontarNuevoStock && !almacenId) {
      throw new Error('Selecciona un almacén para poder descontar el inventario.')
    }

    if (recalcularInventario && envioActual.stockDescontado && envioActual.almacenId) {
      await revertirMovimientosEnvio(tx, id, 'Reversión antes de editar envío')
    }

    if (actualizarCliente && dni && nombre && celular) {
      const clienteConDni = await tx.cliente.findUnique({ where: { dni } })
      if (clienteConDni && clienteConDni.id !== envioActual.clienteId) {
        throw new Error('Ese DNI ya está asociado a otro cliente.')
      }

      await tx.cliente.update({
        where: { id: envioActual.clienteId },
        data: { nombre, dni, celular, email },
      })
    }

    const envioActualizado = await tx.envio.update({
      where: { id },
      data: {
        courierId,
        almacenId,
        ...(recalcularInventario
          ? { stockDescontado: courier.descuentaInventario }
          : {}),
        departamento,
        direccion,
        referencia,
        claveEnvio,
        observaciones,
        ...(nuevaFecha ? { createdAt: nuevaFecha } : {}),
        productos: {
          deleteMany: {},
          create: productosEnvio.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
        },
      },
      include: {
        productos: {
          include: {
            producto: { include: { componentesPack: { include: { producto: true } } } },
          },
        },
      },
    })

    await guardarSnapshotsPack(tx, envioActualizado.productos)

    if (descontarNuevoStock && almacenId) {
      for (const producto of desgloseFisico) {
        await aplicarMovimientoStock(tx, {
          almacenId,
          productoId: producto.productoId,
          delta: -producto.cantidad,
          tipo: 'SALIDA_ENVIO',
          motivo: 'Descuento por edición de envío',
          envioId: id,
        })
      }
    }
  })

  revalidatePath('/envios')
  revalidatePath('/inventario')
  if (actualizarCliente) revalidatePath('/clientes')
}

export async function marcarComoRotulados(ids: string[]) {
  if (!ids || ids.length === 0) return

  await prisma.envio.updateMany({
    where: {
      id: { in: ids },
    },
    data: {
      estado: 'rotulado',
    },
  })

  revalidatePath('/envios')
}

export async function obtenerMetricasRapidas() {
  const hoyStr = new Date().toISOString().split('T')[0]
  const inicio = new Date(`${hoyStr}T00:00:00`)
  const fin = new Date(`${hoyStr}T23:59:59.999`)

  // Envíos del día que no estén en estado 'pendiente' (listos o ya procesados)
  const enviosHoy = await prisma.envio.findMany({
    where: {
      createdAt: { gte: inicio, lte: fin },
    },
    include: { courier: true },
    orderBy: { createdAt: 'desc' },
  })

  // Última clave de envío generada/registrada hoy
  const ultimoEnvioConClave = enviosHoy.find((e) => e.claveEnvio)
  const ultimaClave = ultimoEnvioConClave?.claveEnvio || 'Sin clave hoy'

  // Conteo de paquetes para llevar a agencia hoy (que estén 'registrado' o 'rotulado')
  const enviosListos = enviosHoy.filter((e) => e.estado === 'registrado' || e.estado === 'rotulado')
  
  const totalShalom = enviosListos.filter((e) => e.courier.nombre.toUpperCase().includes('SHALOM')).length
  const totalOlva = enviosListos.filter((e) => e.courier.nombre.toUpperCase().includes('OLVA')).length

  return {
    ultimaClave,
    totalShalom,
    totalOlva,
    totalParaAgencia: totalShalom + totalOlva,
  }
}
