import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { prisma } from '@/lib/prisma'

function inicioYFinDelDia(fecha: string) {
  const inicio = new Date(fecha + 'T00:00:00')
  const fin = new Date(fecha + 'T23:59:59.999')
  return { inicio, fin }
}

export async function GET(req: NextRequest) {
  const fecha = req.nextUrl.searchParams.get('fecha') ?? undefined

  const where = fecha
    ? { createdAt: { gte: inicioYFinDelDia(fecha).inicio, lte: inicioYFinDelDia(fecha).fin } }
    : {}


  const enviosDb = await prisma.envio.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { cliente: true, courier: true, productos: { include: { producto: true } } },
  }) 

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Envíos')

  sheet.columns = [
    { header: 'Cliente', key: 'cliente', width: 30 },
    { header: 'DNI', key: 'dni', width: 14 },
    { header: 'Celular', key: 'celular', width: 14 },
    { header: 'Correo', key: 'email', width: 14 },
    { header: 'Dirección', key: 'direccion', width: 35 },
    { header: 'Referencia', key: 'referencia', width: 35 },
    { header: 'Departamento', key: 'departamento', width: 35 },
    { header: 'Courier', key: 'courier', width: 16 },
    { header: 'Clave de envío', key: 'claveEnvio', width: 18 },
    { header: 'Libros', key: 'libros', width: 40 },
    { header: 'Estado', key: 'estado', width: 16 },
    { header: 'Fecha', key: 'fecha', width: 14 },
    { header: 'Observaciones', key: 'observaciones', width: 40 },
  ]
  sheet.getRow(1).font = { bold: true }

  enviosDb.forEach((e) => {
    sheet.addRow({
      cliente: e.cliente.nombre,
      dni: e.cliente.dni,
      celular: e.cliente.celular,
      email: e.cliente.email,
      direccion: e.direccion,
      referencia: e.referencia,
      departamento: e.departamento,
      courier: e.courier.nombre,
      claveEnvio: e.claveEnvio,
      libros: e.productos.map((p) => `${p.producto.nombre} x${p.cantidad}`).join(', '),
      estado: e.estado,
      fecha: e.createdAt.toLocaleDateString('es-PE'),
      observaciones: e.observaciones,
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const nombre = fecha ? `envios_${fecha}.xlsx` : 'envios.xlsx'

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${nombre}"`,
    },
  })
}