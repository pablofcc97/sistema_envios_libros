import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { TablaExistencias } from '@/components/inventario/tabla-existencias'

export const revalidate = 0

export default async function InventarioPage() {
  const [almacenes, productos, existencias, movimientos] = await Promise.all([
    prisma.almacen.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.producto.findMany({
      orderBy: [{ destacado: 'desc' }, { nombre: 'asc' }],
      include: {
        componentesPack: {
          include: { producto: { select: { id: true, nombre: true, nombreCorto: true } } },
        },
      },
    }),
    prisma.existenciaAlmacen.findMany({ select: { almacenId: true, productoId: true, cantidad: true } }),
    prisma.movimientoInventario.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        producto: { select: { nombre: true, nombreCorto: true } },
        almacen: { select: { nombre: true } },
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Existencias</h1>
          <p className="text-sm text-slate-400">
            Consulta y actualiza el stock por almacén. Cada cambio queda registrado como movimiento.
          </p>
        </div>
        {almacenes.length === 0 && (
          <Link
            href="/inventario/almacenes"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-blue-500/40 bg-blue-600/15 px-4 text-sm font-medium text-blue-200 hover:bg-blue-600/25"
          >
            Crear el primer almacén
          </Link>
        )}
        {productos.length === 0 && almacenes.length > 0 && (
          <Link
            href="/productos"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-blue-500/40 bg-blue-600/15 px-4 text-sm font-medium text-blue-200 hover:bg-blue-600/25"
          >
            Crear productos
          </Link>
        )}
      </div>

      <TablaExistencias
        almacenes={almacenes}
        productos={productos.map(({ id, nombre, nombreCorto, destacado, esPack, componentesPack }) => ({
          id,
          nombre,
          nombreCorto,
          destacado,
          esPack,
          componentesPack: componentesPack.map(({ productoId, cantidad, producto }) => ({
            productoId,
            cantidad,
            producto,
          })),
        }))}
        existencias={existencias}
        movimientos={movimientos}
      />
    </div>
  )
}
