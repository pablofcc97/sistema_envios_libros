'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { crearProducto, actualizarProducto } from '@/app/productos/actions'

interface FormularioProductoProps {
  producto?: {
    id: string
    nombre: string
    nombreCorto?: string | null
    precio?: number | null
    anio?: number | null
  } | null
  onSuccess: () => void
}

export default function FormularioProductoForm({
  producto,
  onSuccess,
}: FormularioProductoProps) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [nombre, setNombre] = useState(producto?.nombre || '')
  const [nombreCorto, setNombreCorto] = useState(producto?.nombreCorto || '')
  const [precio, setPrecio] = useState<string>(
    producto?.precio !== undefined && producto?.precio !== null ? String(producto.precio) : ''
  )
  const [anio, setAnio] = useState<string>(
    producto?.anio ? String(producto.anio) : '2026'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    const payload = {
      nombre,
      nombreCorto,
      precio: precio ? parseFloat(precio) : 0,
      anio: anio ? parseInt(anio) : 2026,
    }

    const res = producto
      ? await actualizarProducto(producto.id, payload)
      : await crearProducto(payload)

    setCargando(false)

    if (res.success) {
      onSuccess()
    } else {
      setError(res.error || 'Ocurrió un error inesperado')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-200 mt-4">
      {error && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-lg text-xs">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          Nombre Completo del Producto *
        </label>
        <Input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Cómo se hace una tesis 2026"
          className="bg-slate-900 border-slate-800 text-slate-100"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          Nombre Corto (Para Rótulos / Etiquetas)
        </label>
        <Input
          value={nombreCorto}
          onChange={(e) => setNombreCorto(e.target.value)}
          placeholder="Ej: Tesis 2026"
          className="bg-slate-900 border-slate-800 text-slate-100 font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Año / Edición
          </label>
          <Input
            type="number"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            placeholder="2026"
            className="bg-slate-900 border-slate-800 text-slate-100 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Precio Referencial (S/)
          </label>
          <Input
            type="number"
            step="0.01"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="0.00"
            className="bg-slate-900 border-slate-800 text-slate-100 font-mono"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button
          type="submit"
          disabled={cargando}
          className="bg-blue-600 hover:bg-blue-500 text-white w-full cursor-pointer"
        >
          {cargando ? 'Guardando...' : producto ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  )
}