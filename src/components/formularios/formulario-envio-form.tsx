'use client'

import { useState } from 'react'
import { Search, Star } from 'lucide-react'
import { actualizarEnvioCompleto, crearEnvio } from '@/app/envios/actions'

const DEPARTAMENTOS_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios',
  'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna',
  'Tumbes', 'Ucayali',
]

const OTRA_REFERENCIA = '__otra__'

type Courier = {
  id: string
  nombre: string
  color?: string
  referenciaPredeterminada?: string | null
}

type Producto = { id: string; nombre: string; nombreCorto?: string | null; destacado?: boolean }

type EnvioInicial = {
  id: string
  clienteId: string
  courierId: string
  departamento: string
  referencia: string | null
  direccion: string | null
  claveEnvio: string | null
  observaciones: string | null
  createdAt: Date | string
  cliente: {
    id: string
    nombre: string
    dni: string
    celular: string
    email: string | null
  }
  productos: { productoId: string; cantidad: number }[]
}

interface FormularioEnvioFormProps {
  modo: 'crear' | 'editar'
  couriers: Courier[]
  productos: Producto[]
  courierPorDefectoId?: string | null
  envio?: EnvioInicial
  onSuccess: () => void
}

const inputClass = 'w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const seccionClass = 'space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800'
const labelClass = 'block text-xs text-slate-400 mb-1'

function limpiarTextoNumerico(texto: string, maxLen: number) {
  return texto.replace(/\D/g, '').slice(0, maxLen)
}

function normalizarNombre(nombre: string) {
  return nombre.trim().replace(/\s+/g, ' ')
}

function obtenerFechaInput(fecha: Date | string) {
  return new Date(fecha).toISOString().split('T')[0]
}

export function FormularioEnvioForm({
  modo,
  couriers,
  productos,
  courierPorDefectoId,
  envio,
  onSuccess,
}: FormularioEnvioFormProps) {
  const esEdicion = modo === 'editar' && Boolean(envio)
  const courierInicialId = envio?.courierId
    || courierPorDefectoId
    || couriers.find((courier) => courier.nombre.toUpperCase().includes('SHALOM'))?.id
    || couriers[0]?.id
    || ''
  const courierInicial = couriers.find((courier) => courier.id === courierInicialId)
  const referenciasDisponibles = Array.from(new Set(
    couriers
      .map((courier) => courier.referenciaPredeterminada?.trim())
      .filter((referencia): referencia is string => Boolean(referencia)),
  ))
  const referenciaInicial = envio?.referencia?.trim()
    || courierInicial?.referenciaPredeterminada?.trim()
    || ''
  const referenciaInicialEsConocida = referenciasDisponibles.includes(referenciaInicial)

  const [nombre, setNombre] = useState(envio?.cliente.nombre ?? '')
  const [dni, setDni] = useState(envio?.cliente.dni ?? '')
  const [celular, setCelular] = useState(envio?.cliente.celular ?? '')
  const [email, setEmail] = useState(envio?.cliente.email ?? '')
  const [courierId, setCourierId] = useState(courierInicialId)
  const [referenciaSeleccionada, setReferenciaSeleccionada] = useState(
    referenciaInicial && !referenciaInicialEsConocida ? OTRA_REFERENCIA : referenciaInicial,
  )
  const [referenciaOtro, setReferenciaOtro] = useState(
    referenciaInicial && !referenciaInicialEsConocida ? referenciaInicial : '',
  )
  const [fechaEnvio, setFechaEnvio] = useState(
    envio ? obtenerFechaInput(envio.createdAt) : obtenerFechaInput(new Date()),
  )
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [busquedaProducto, setBusquedaProducto] = useState('')

  const productosSeleccionados = new Map(
    envio?.productos.map((producto) => [producto.productoId, producto.cantidad]) ?? [],
  )
  const productosDestacados = productos.filter((producto) => producto.destacado)
  const productosRegulares = productos.filter((producto) => !producto.destacado)
  const consultaProducto = busquedaProducto.trim().toLocaleLowerCase('es')
  const coincideBusqueda = (producto: Producto) => !consultaProducto
    || producto.nombre.toLocaleLowerCase('es').includes(consultaProducto)
    || (producto.nombreCorto || '').toLocaleLowerCase('es').includes(consultaProducto)

  const renderProducto = (producto: Producto) => (
    <div
      key={producto.id}
      className={`${coincideBusqueda(producto) ? 'flex' : 'hidden'} items-center gap-2 py-1 border-b border-slate-800/60 last:border-0`}
    >
      <input type="checkbox" name={`producto_${producto.id}`} id={`envio-producto-${producto.id}`} defaultChecked={productosSeleccionados.has(producto.id)} className="w-4 h-4 cursor-pointer rounded accent-blue-600" />
      <label htmlFor={`envio-producto-${producto.id}`} className="flex-1 text-xs text-slate-200 cursor-pointer">{producto.nombreCorto || producto.nombre}</label>
      <input type="number" name={`cantidad_${producto.id}`} defaultValue={productosSeleccionados.get(producto.id) || 1} min={1} aria-label={`Cantidad de ${producto.nombre}`} className="w-14 bg-slate-800 border border-slate-700 text-slate-100 p-1 text-center rounded text-xs font-mono" />
    </div>
  )

  const handleCourierChange = (nuevoCourierId: string) => {
    setCourierId(nuevoCourierId)
    const courier = couriers.find((item) => item.id === nuevoCourierId)
    setReferenciaSeleccionada(courier?.referenciaPredeterminada?.trim() || '')
    setReferenciaOtro('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const dniLimpio = limpiarTextoNumerico(dni, 8)
    const celularLimpio = limpiarTextoNumerico(celular, 9)
    if (dniLimpio.length !== 8) {
      setError('El DNI debe contener exactamente 8 dígitos.')
      return
    }
    if (celularLimpio.length !== 9) {
      setError('El celular debe contener exactamente 9 dígitos.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const tieneProductos = productos.some((producto) => formData.get(`producto_${producto.id}`) === 'on')
    if (!tieneProductos) {
      setError('Selecciona al menos un producto para el envío.')
      return
    }

    formData.set('nombre', normalizarNombre(nombre))
    formData.set('dni', dniLimpio)
    formData.set('celular', celularLimpio)
    formData.set('email', email.trim().toLowerCase())
    formData.set('referencia', referenciaSeleccionada === OTRA_REFERENCIA
      ? referenciaOtro.trim()
      : referenciaSeleccionada)

    setCargando(true)
    try {
      if (esEdicion && envio) {
        await actualizarEnvioCompleto(envio.id, formData)
      } else {
        await crearEnvio(formData)
      }
      onSuccess()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar el envío.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
      {error && (
        <div role="alert" className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-lg text-xs">
          {error}
        </div>
      )}

      <section className={seccionClass}>
        <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">Cliente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="envio-nombre" className={labelClass}>Nombre *</label>
            <input id="envio-nombre" name="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Nombre del cliente" className={inputClass} />
          </div>
          <div>
            <label htmlFor="envio-dni" className={labelClass}>DNI * (8 dígitos)</label>
            <input id="envio-dni" name="dni" value={dni} onChange={(e) => setDni(limpiarTextoNumerico(e.target.value, 8))} inputMode="numeric" maxLength={8} required placeholder="70123456" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label htmlFor="envio-celular" className={labelClass}>Celular * (9 dígitos)</label>
            <input id="envio-celular" name="celular" value={celular} onChange={(e) => setCelular(limpiarTextoNumerico(e.target.value, 9))} inputMode="numeric" maxLength={9} required placeholder="987654321" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label htmlFor="envio-email" className={labelClass}>Email</label>
            <input id="envio-email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="opcional@correo.com" className={inputClass} />
          </div>
        </div>
        {esEdicion && (
          <p className="text-xs text-amber-300/80">Los cambios del cliente se aplicarán a todos sus envíos.</p>
        )}
      </section>

      <section className={seccionClass}>
        <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">Envío</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="envio-courier" className={labelClass}>Courier *</label>
            <select id="envio-courier" name="courierId" value={courierId} onChange={(e) => handleCourierChange(e.target.value)} required className={`${inputClass} cursor-pointer`}>
              <option value="">Selecciona courier</option>
              {couriers.map((courier) => <option key={courier.id} value={courier.id}>{courier.nombre}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="envio-departamento" className={labelClass}>Departamento *</label>
            <select id="envio-departamento" name="departamento" defaultValue={envio?.departamento ?? ''} required className={`${inputClass} cursor-pointer`}>
              <option value="">Selecciona departamento</option>
              {DEPARTAMENTOS_PERU.map((departamento) => <option key={departamento} value={departamento}>{departamento}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="envio-referencia" className={labelClass}>Referencia</label>
            <select id="envio-referencia" value={referenciaSeleccionada} onChange={(e) => setReferenciaSeleccionada(e.target.value)} className={`${inputClass} cursor-pointer`}>
              <option value="">Sin referencia</option>
              {referenciasDisponibles.map((referencia) => <option key={referencia} value={referencia}>{referencia}</option>)}
              <option value={OTRA_REFERENCIA}>Otro</option>
            </select>
            {referenciaSeleccionada === OTRA_REFERENCIA && (
              <input value={referenciaOtro} onChange={(e) => setReferenciaOtro(e.target.value)} placeholder="Escribe otra referencia" className={`${inputClass} mt-2`} />
            )}
            <input type="hidden" name="referencia" value={referenciaSeleccionada === OTRA_REFERENCIA ? referenciaOtro : referenciaSeleccionada} />
          </div>
          <div>
            <label htmlFor="envio-clave" className={labelClass}>Clave de envío (opcional)</label>
            <input id="envio-clave" name="claveEnvio" defaultValue={envio?.claveEnvio ?? ''} placeholder="Ej. 1234" className={`${inputClass} font-mono`} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="envio-direccion" className={labelClass}>Dirección / Agencia (opcional)</label>
            <input id="envio-direccion" name="direccion" defaultValue={envio?.direccion ?? ''} placeholder="Av. Principal 123 o nombre de agencia" className={inputClass} />
          </div>
          {esEdicion && (
            <div className="sm:col-span-2">
              <label htmlFor="envio-fecha" className={labelClass}>Fecha de registro / envío *</label>
              <input id="envio-fecha" type="date" name="createdAt" value={fechaEnvio} onChange={(e) => setFechaEnvio(e.target.value)} required className={`${inputClass} [color-scheme:dark]`} />
            </div>
          )}
        </div>
      </section>

      <section className={seccionClass}>
        <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">Productos</h3>
        <label htmlFor="buscar-producto-envio" className="sr-only">Buscar producto</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input id="buscar-producto-envio" type="search" value={busquedaProducto} onChange={(e) => setBusquedaProducto(e.target.value)} placeholder="Buscar por nombre o nombre corto..." className={`${inputClass} pl-9`} />
        </div>
        <div className="max-h-56 space-y-4 overflow-y-auto pr-1">
          <div>
            <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300">
              <Star className="h-3.5 w-3.5 fill-current" /> Productos destacados
            </h4>
            <div className="space-y-1">
              {productosDestacados.map(renderProducto)}
              {productosDestacados.length === 0 && <p className="py-1 text-xs text-slate-500">Aún no hay productos destacados.</p>}
            </div>
          </div>
          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Todos los productos</h4>
            <div className="space-y-1">
              {productosRegulares.map(renderProducto)}
            </div>
          </div>
          {productos.length === 0 && <p className="text-xs text-slate-500">No hay productos disponibles.</p>}
          {productos.length > 0 && !productos.some(coincideBusqueda) && <p className="text-xs text-slate-500">No se encontraron productos con ese nombre.</p>}
        </div>
      </section>

      <div>
        <label htmlFor="envio-observaciones" className={labelClass}>Observaciones</label>
        <textarea id="envio-observaciones" name="observaciones" defaultValue={envio?.observaciones ?? ''} rows={2} placeholder="Instrucciones adicionales..." className={`${inputClass} resize-none`} />
      </div>

      <button type="submit" disabled={cargando} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20 text-sm cursor-pointer disabled:cursor-not-allowed">
        {cargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar envío pendiente'}
      </button>
    </form>
  )
}
