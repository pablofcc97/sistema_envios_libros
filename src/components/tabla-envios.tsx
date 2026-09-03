'use client'

import { useState } from 'react'
import { marcarRegistrado } from '@/app/envios/actions'

type Envio = {
  id: string
  direccion: string
  departamento: string
  referencia: string
  claveEnvio: string
  estado: string
  observaciones: string
  createdAt: Date
  cliente: { nombre: string; dni: string; email: string; celular: string }
  courier: { nombre: string }
  productos: { cantidad: number; producto: { nombre: string } }[]
}

function BotonCopiar({ valor }: { valor: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(valor)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1200)
  }

  return (
    <button onClick={copiar} className="text-xs text-gray-500 hover:text-black ml-1" title="Copiar">
      {copiado ? '✓' : '📋'}
    </button>
  )
}

function Celda({ valor }: { valor: string }) {
  return (
    <td className="p-2">
      <div className="flex items-center gap-1">
        <span>{valor}</span>
        <BotonCopiar valor={valor} />
      </div>
    </td>
  )
}

export function TablaEnvios({ envios }: { envios: Envio[] }) {
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  function toggle(id: string) {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div>
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm text-gray-500">{seleccionados.length} seleccionados</span>
        <a
          href={`/api/rotulos?ids=${seleccionados.join(',')}`}
          target="_blank"
          className={`px-4 py-2 rounded text-white ${seleccionados.length ? 'bg-black' : 'bg-gray-300 pointer-events-none'}`}
        >
          Generar rótulos (PDF)
        </a>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2"></th>
            <th className="p-2">Cliente</th>
            <th className="p-2">DNI</th>
            <th className="p-2">Celular</th>
            <th className="p-2">Correo</th>
            <th className="p-2">Dirección</th>
            <th className="p-2">Referencia</th>
            <th className="p-2">Departamento</th>
            <th className="p-2">Courier</th>
            <th className="p-2">Clave</th>
            <th className="p-2">Libros</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Observaciones</th>
            <th className="p-2">Fecha</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {envios.map((e) => (
            <tr key={e.id} className="border-b">
              <td className="p-2">
                <input type="checkbox" checked={seleccionados.includes(e.id)} onChange={() => toggle(e.id)} />
              </td>
              <Celda valor={e.cliente.nombre} />
              <Celda valor={e.cliente.dni} />
              <Celda valor={e.cliente.celular} />
              <Celda valor={e.cliente.email} />
              <Celda valor={e.direccion} />
              <Celda valor={e.referencia} />
              <Celda valor={e.departamento} />
              <Celda valor={e.courier.nombre} />
              <Celda valor={e.claveEnvio} />
              <Celda valor={e.productos.map((p) => `${p.producto.nombre} x${p.cantidad}`).join(', ')} />
              <td className="p-2">
                <span className={e.estado === 'registrado' ? 'text-green-600' : 'text-gray-500'}>
                  {e.estado}
                </span>
              </td>
              <Celda valor={e.observaciones} />
              <td className="p-2">{e.createdAt.toLocaleDateString('es-PE')}</td>
              <td className="p-2">
                {e.estado !== 'registrado' && (
                  <button
                    onClick={() => marcarRegistrado(e.id)}
                    className="text-xs border px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Marcar registrado
                  </button>
                )}
              </td>
            </tr>
          ))}
          {envios.length === 0 && (
            <tr><td colSpan={10} className="p-4 text-center text-gray-500">Sin envíos registrados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}