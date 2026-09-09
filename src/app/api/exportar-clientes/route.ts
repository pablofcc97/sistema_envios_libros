import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const idsParam = searchParams.get('ids')

    // 1. Obtener los clientes de la base de datos
    let whereClause = {}
    if (idsParam) {
      const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean)
      if (ids.length > 0) {
        whereClause = { id: { in: ids } }
      }
    }

    const clientes = await prisma.cliente.findMany({
      where: whereClause,
      orderBy: { nombre: 'asc' },
    })

    // 2. Crear el libro y la hoja de cálculo
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Clientes')

    // 3. Definir columnas
    worksheet.columns = [
      { header: 'NOMBRE COMPLETO', key: 'nombre', width: 35 },
      { header: 'DNI / RUC', key: 'dni', width: 16 },
      { header: 'CELULAR', key: 'celular', width: 16 },
      { header: 'CORREO ELECTRÓNICO', key: 'email', width: 30 },
      { header: 'FECHA REGISTRO', key: 'createdAt', width: 18 },
    ]

    // Estilo para el encabezado
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E293B' }, // Slate-800
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

    // 4. Agregar filas
    clientes.forEach((cliente) => {
      worksheet.addRow({
        nombre: cliente.nombre,
        dni: cliente.dni,
        celular: cliente.celular,
        email: cliente.email || '-',
        createdAt: new Date(cliente.createdAt).toLocaleDateString('es-PE'),
      })
    })

    // Alineación de datos
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.getCell('dni').alignment = { horizontal: 'center' }
        row.getCell('celular').alignment = { horizontal: 'center' }
        row.getCell('createdAt').alignment = { horizontal: 'center' }
      }
    })

    // 5. Generar Buffer y responder
    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Reporte_Clientes_${
          new Date().toISOString().split('T')[0]
        }.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Error al exportar clientes:', error)
    return NextResponse.json(
      { error: 'Ocurrió un error al generar el archivo Excel.' },
      { status: 500 }
    )
  }
}