import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { prisma } from '@/lib/prisma'
import { RotulosDocument } from '@/lib/pdf/rotulos-document'

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('ids')?.split(',') ?? []

  if (ids.length === 0) {
    return NextResponse.json({ error: 'No se enviaron ids' }, { status: 400 })
  }

  const enviosDb = await prisma.envio.findMany({
    where: { id: { in: ids } },
    include: { cliente: true, courier: true, productos: { include: { producto: true } } },
  })

  const envios = enviosDb.map((e) => ({
    id: e.id,
    cliente: e.cliente.nombre,
    dni: e.cliente.dni,
    celular: e.cliente.celular,
    direccion: e.direccion || '',
    referencia: e.referencia || '',
    departamento: e.departamento,
    courier: e.courier.nombre,
    observaciones: e.observaciones || '',
    libros: e.productos
      .map((p) => `${p.producto.nombreCorto || p.producto.nombre} x${p.cantidad}`)
      .join(', '),
    productosDetalle: e.productos.map((p) => ({
      nombre: p.producto.nombreCorto || p.producto.nombre,
      cantidad: p.cantidad,
    })),
  }))

  const buffer = await renderToBuffer(<RotulosDocument envios={envios} />)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="rotulos.pdf"',
    },
  })
}