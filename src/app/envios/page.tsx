import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { TablaEnvios } from '@/components/tabla-envios'

function inicioYFinDelDia(fecha: string) {
  const inicio = new Date(fecha + 'T00:00:00')
  const fin = new Date(fecha + 'T23:59:59.999')
  return { inicio, fin }
}

export default async function ListadoEnvios({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>
}) {
  const { fecha } = await searchParams

  const where = fecha
    ? { createdAt: { gte: inicioYFinDelDia(fecha).inicio, lte: inicioYFinDelDia(fecha).fin } }
    : {}

  const envios = await prisma.envio.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      cliente: true,
      courier: true,
      productos: { include: { producto: true } },
    },
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Envíos</h1>
        <Link href="/envios/nuevo" className="bg-black text-white px-4 py-2 rounded">
          + Nuevo envío
        </Link>
        <a href={`/api/exportar${fecha ? `?fecha=${fecha}` : ''}`}
        className="border px-4 py-2 rounded"
        >
        Exportar a Excel
        </a>
      </div>

      <form className="mb-4 flex gap-2 items-end">
        <div>
          <label className="block text-sm">Filtrar por fecha</label>
          <input type="date" name="fecha" defaultValue={fecha} className="border p-2 rounded" />
        </div>
        <button type="submit" className="border px-4 py-2 rounded">Filtrar</button>
        {fecha && (
          <Link href="/envios" className="text-sm underline px-2 py-2">Quitar filtro</Link>
        )}
      </form>

      <TablaEnvios envios={envios} />
    </div>
  )
}