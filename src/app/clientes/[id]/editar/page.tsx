import { prisma } from '@/lib/prisma'
import { actualizarCliente } from '../../actions'
import { notFound } from 'next/navigation'

export default async function EditarCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cliente = await prisma.cliente.findUnique({ where: { id } })
  if (!cliente) notFound()

  const actualizar = actualizarCliente.bind(null, id)

  return (
    <form action={actualizar} className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Editar cliente</h1>
      <input name="nombre" defaultValue={cliente.nombre} required className="w-full border p-2 rounded" />
      <input name="dni" defaultValue={cliente.dni} required className="w-full border p-2 rounded" />
      <input name="celular" defaultValue={cliente.celular} required className="w-full border p-2 rounded" />
      <input name="email" defaultValue={cliente.email ?? ''} required type="email" className="w-full border p-2 rounded" />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">Guardar cambios</button>
    </form>
  )
}