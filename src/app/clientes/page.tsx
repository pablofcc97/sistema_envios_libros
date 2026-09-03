import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { eliminarCliente } from './actions'

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nombre: 'asc' } })

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Clientes</h1>
        <Link href="/clientes/nuevo" className="bg-black text-white px-4 py-2 rounded">
          + Nuevo cliente
        </Link>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Nombre</th>
            <th className="p-2">DNI</th>
            <th className="p-2">Celular</th>
            <th className="p-2">Email</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.nombre}</td>
              <td className="p-2">{c.dni}</td>
              <td className="p-2">{c.celular}</td>
              <td className="p-2">{c.email}</td>
              <td className="p-2 flex gap-3">
                <Link href={`/clientes/${c.id}/editar`} className="text-xs underline">Editar</Link>
                <form action={eliminarCliente.bind(null, c.id)}>
                  <button type="submit" className="text-xs text-red-500 hover:underline">Eliminar</button>
                </form>
              </td>
            </tr>
          ))}
          {clientes.length === 0 && (
            <tr><td colSpan={4} className="p-4 text-center text-gray-500">Sin clientes registrados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}