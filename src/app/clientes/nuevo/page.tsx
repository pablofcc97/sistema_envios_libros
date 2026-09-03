import { crearCliente } from '../actions'

export default function NuevoCliente() {
  return (
    <form action={crearCliente} className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Nuevo cliente</h1>
      <input name="nombre" placeholder="Nombre completo" required className="w-full border p-2 rounded" />
      <input name="dni" placeholder="DNI" required className="w-full border p-2 rounded" />
      <input name="celular" placeholder="Celular" required className="w-full border p-2 rounded" />
      <input name="email" placeholder="Email" type="email" required className="w-full border p-2 rounded" />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">Guardar</button>
    </form>
  )
}