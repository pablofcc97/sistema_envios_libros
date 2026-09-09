'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { crearCliente, actualizarCliente } from '@/app/clientes/actions'

interface FormularioClienteProps {
  cliente?: {
    id: string
    nombre: string
    dni: string
    celular: string
    email?: string | null
  } | null
  onSuccess: () => void
}

export default function FormularioClienteForm({
  cliente,
  onSuccess,
}: FormularioClienteProps) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [nombre, setNombre] = useState(cliente?.nombre || '')
  const [dni, setDni] = useState(cliente?.dni || '')
  const [celular, setCelular] = useState(cliente?.celular || '')
  const [email, setEmail] = useState(cliente?.email || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    const payload = { nombre, dni, celular, email }

    const res = cliente
      ? await actualizarCliente(cliente.id, payload)
      : await crearCliente(payload)

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
          Nombre Completo *
        </label>
        <Input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Juan Pérez"
          className="bg-slate-900 border-slate-800 text-slate-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            DNI / RUC *
          </label>
          <Input
            required
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="72723047"
            className="bg-slate-900 border-slate-800 text-slate-100 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Celular *
          </label>
          <Input
            required
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="955870376"
            className="bg-slate-900 border-slate-800 text-slate-100 font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          Correo Electrónico (Opcional)
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="cliente@correo.com"
          className="bg-slate-900 border-slate-800 text-slate-100"
        />
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button
          type="submit"
          disabled={cargando}
          className="bg-blue-600 hover:bg-blue-500 text-white w-full cursor-pointer"
        >
          {cargando ? 'Guardando...' : cliente ? 'Guardar Cambios' : 'Crear Cliente'}
        </Button>
      </div>
    </form>
  )
}