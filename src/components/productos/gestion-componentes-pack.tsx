'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Check, Search } from 'lucide-react'
import { guardarComponentesPack } from '@/app/productos/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ProductoOpcion = { id: string; nombre: string; nombreCorto: string | null }
type ComponenteInicial = { productoId: string; cantidad: number; producto: ProductoOpcion }

export function GestionComponentesPack({
  packId,
  packNombre,
  componentesIniciales,
  productosDisponibles,
  onSuccess,
}: {
  packId: string
  packNombre: string
  componentesIniciales: ComponenteInicial[]
  productosDisponibles: ProductoOpcion[]
  onSuccess: () => void
}) {
  const [componentes, setComponentes] = useState<Record<string, string>>(
    Object.fromEntries(componentesIniciales.map((item) => [item.productoId, String(item.cantidad)])),
  )
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const productosFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase('es')
    if (!consulta) return productosDisponibles
    return productosDisponibles.filter((producto) =>
      producto.nombre.toLocaleLowerCase('es').includes(consulta)
      || (producto.nombreCorto ?? '').toLocaleLowerCase('es').includes(consulta),
    )
  }, [busqueda, productosDisponibles])

  const alternarProducto = (productoId: string, seleccionado: boolean) => {
    setComponentes((actuales) => {
      const nuevos = { ...actuales }
      if (seleccionado) nuevos[productoId] = '1'
      else delete nuevos[productoId]
      return nuevos
    })
  }

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCargando(true)
    setError('')

    const resultado = await guardarComponentesPack(
      packId,
      Object.entries(componentes).map(([productoId, cantidad]) => ({
        productoId,
        cantidad: Number(cantidad),
      })),
    )

    setCargando(false)
    if (!resultado.success) {
      setError(resultado.error)
      return
    }

    onSuccess()
  }

  return (
    <form onSubmit={guardar} className="mt-5 space-y-4 text-slate-200">
      <div className="rounded-lg border border-amber-800/70 bg-amber-950/25 p-3 text-xs leading-relaxed text-amber-200">
        Los cambios definirán los descuentos de futuros envíos. Los envíos ya registrados conservan la composición guardada en su historial.
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-800 bg-red-950/60 p-3 text-xs text-red-300">{error}</div>}

      <div>
        <p className="mb-2 text-sm font-semibold text-white">Componentes de {packNombre}</p>
        <label className="relative block">
          <span className="sr-only">Buscar productos componentes</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar productos..."
            className="border-slate-800 bg-slate-900 pl-9 text-slate-100"
          />
        </label>
      </div>

      <div className="max-h-[55vh] space-y-1 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/60 p-2">
        {productosFiltrados.map((producto) => {
          const cantidad = componentes[producto.id]
          const seleccionado = cantidad !== undefined

          return (
            <div key={producto.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-slate-800/70">
              <input
                type="checkbox"
                id={`pack-${packId}-${producto.id}`}
                checked={seleccionado}
                onChange={(event) => alternarProducto(producto.id, event.target.checked)}
                className="h-4 w-4 cursor-pointer rounded accent-blue-500"
              />
              <label htmlFor={`pack-${packId}-${producto.id}`} className="min-w-0 flex-1 cursor-pointer">
                <span className="block truncate text-xs font-medium text-slate-200">{producto.nombre}</span>
                {producto.nombreCorto && <span className="block truncate text-[11px] text-slate-500">{producto.nombreCorto}</span>}
              </label>
              {seleccionado && (
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  Cantidad
                  <input
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={cantidad}
                    onChange={(event) => setComponentes((actuales) => ({ ...actuales, [producto.id]: event.target.value }))}
                    aria-label={`Cantidad de ${producto.nombre} por pack`}
                    className="h-8 w-16 rounded-md border border-slate-700 bg-slate-950 px-2 text-center font-mono text-slate-100"
                  />
                </label>
              )}
            </div>
          )
        })}
        {productosFiltrados.length === 0 && <p className="p-5 text-center text-xs text-slate-500">No hay productos coincidentes.</p>}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
        <span className="text-xs text-slate-400">{Object.keys(componentes).length} productos seleccionados</span>
        <Button type="submit" disabled={cargando} className="cursor-pointer gap-2 bg-blue-600 text-white hover:bg-blue-500">
          <Check className="h-4 w-4" />
          {cargando ? 'Guardando...' : 'Guardar composición'}
        </Button>
      </div>
    </form>
  )
}
