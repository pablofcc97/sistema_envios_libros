'use client'

import { useEffect, useState } from 'react'
import type { Prisma } from '@prisma/client'
import { obtenerHistorialCliente } from '@/app/clientes/actions'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { BadgeEstado } from '@/components/ui/badge-estado'
import { User, Phone, Mail, FileText, MapPin, Package, History, Copy, Check, AlertTriangle } from 'lucide-react'
import { copiarTexto } from '@/lib/copiar-texto'

type ClienteDetalle = Prisma.ClienteGetPayload<Record<string, never>>
type EnvioHistorial = Prisma.EnvioGetPayload<{
  include: {
    courier: true
    productos: { include: { producto: true } }
  }
}>

interface DetalleClienteSheetProps {
  cliente: ClienteDetalle | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DetalleClienteSheet({ cliente, open, onOpenChange }: DetalleClienteSheetProps) {
  const [copiadoCampo, setCopiadoCampo] = useState<string | null>(null)
  const [errorCopiaCampo, setErrorCopiaCampo] = useState<string | null>(null)
  const [envios, setEnvios] = useState<EnvioHistorial[]>([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [errorHistorial, setErrorHistorial] = useState('')
  const clienteId = cliente?.id

  useEffect(() => {
    if (!open || !clienteId) return

    let vigente = true
    const cargarHistorial = async () => {
      setCargandoHistorial(true)
      setErrorHistorial('')
      try {
        const historial = await obtenerHistorialCliente(clienteId)
        if (vigente) setEnvios(historial)
      } catch {
        if (vigente) setErrorHistorial('No se pudo cargar el historial de envíos.')
      } finally {
        if (vigente) setCargandoHistorial(false)
      }
    }

    void cargarHistorial()
    return () => { vigente = false }
  }, [open, clienteId])

  if (!cliente) return null

  // Helper para copiar al portapapeles
  const handleCopiar = async (texto: string, campo: string) => {
    if (!texto) return
    const copiado = await copiarTexto(texto)
    setCopiadoCampo(copiado ? campo : null)
    setErrorCopiaCampo(copiado ? null : campo)
    setTimeout(() => {
      setCopiadoCampo(null)
      setErrorCopiaCampo(null)
    }, 2000)
  }

  // Ordenar envíos de más reciente a más antiguo
  const enviosOrdenados = [...envios].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Obtener el departamento del último envío realizado
  const ultimoDepartamento = enviosOrdenados[0]?.departamento || 'Sin envíos registrados'

  // Calcular el consolidado total de productos adquiridos por el cliente
  const conteoProductos = new Map<string, number>()
  enviosOrdenados.forEach((e) => {
    e.productos?.forEach((p) => {
      const nombreProd = p.producto.nombreCorto || p.producto.nombre
      const actual = conteoProductos.get(nombreProd) || 0
      conteoProductos.set(nombreProd, actual + p.cantidad)
    })
  })

  const listaProductosAcumulados = Array.from(conteoProductos.entries())

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-900 border-l border-slate-800 text-slate-100 sm:max-w-lg w-full p-6 overflow-y-auto">
        
        {/* Cabecera */}
        <SheetHeader className="border-b border-slate-800/80 pb-5 pt-2">
          <div className="space-y-1">
            <SheetTitle className="text-white text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Detalle del Cliente
            </SheetTitle>
            <SheetDescription className="text-slate-400 text-xs">
              Información general y resumen histórico de despachos
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-1 text-sm">
          
          {/* Datos del Cliente con Copiar */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
            
            {/* Nombre */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <span className="font-bold text-white text-base">{cliente.nombre}</span>
              <button
                type="button"
                onClick={() => handleCopiar(cliente.nombre, 'nombre')}
                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title={errorCopiaCampo === 'nombre' ? 'No se pudo copiar' : copiadoCampo === 'nombre' ? '¡Copiado!' : 'Copiar nombre'}
              >
                {copiadoCampo === 'nombre' ? <Check className="w-4 h-4 text-emerald-400" /> : errorCopiaCampo === 'nombre' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* DNI */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-slate-300">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400">DNI / RUC:</span>
                <span className="font-mono text-white font-semibold text-base ml-1">{cliente.dni}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopiar(cliente.dni, 'dni')}
                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={errorCopiaCampo === 'dni' ? 'No se pudo copiar' : copiadoCampo === 'dni' ? '¡Copiado!' : 'Copiar DNI'}
              >
                {copiadoCampo === 'dni' ? <Check className="w-4 h-4 text-emerald-400" /> : errorCopiaCampo === 'dni' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Celular */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Celular:</span>
                <span className="font-mono text-white font-semibold text-base ml-1">{cliente.celular}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopiar(cliente.celular, 'celular')}
                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={errorCopiaCampo === 'celular' ? 'No se pudo copiar' : copiadoCampo === 'celular' ? '¡Copiado!' : 'Copiar Celular'}
              >
                {copiadoCampo === 'celular' ? <Check className="w-4 h-4 text-emerald-400" /> : errorCopiaCampo === 'celular' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Correo */}
            <div className="flex items-center justify-between text-sm border-t border-slate-800/60 pt-2">
              <div className="flex items-center gap-1.5 text-slate-300 truncate">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-400">Email:</span>
                <span className="text-white font-medium truncate ml-1">{cliente.email || 'Sin registrar'}</span>
              </div>
              {cliente.email && (
                <button
                  type="button"
                  onClick={() => handleCopiar(cliente.email || '', 'email')}
                  className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title={errorCopiaCampo === 'email' ? 'No se pudo copiar' : copiadoCampo === 'email' ? '¡Copiado!' : 'Copiar Correo'}
                >
                  {copiadoCampo === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : errorCopiaCampo === 'email' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Departamento del Último Envío */}
            <div className="flex items-center justify-between text-sm border-t border-slate-800/60 pt-2">
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-slate-400">Último Departamento:</span>
                <span className="font-bold text-amber-300 uppercase ml-1">{cargandoHistorial ? 'Cargando…' : ultimoDepartamento}</span>
              </div>
            </div>

          </div>

          {/* Consolidado de Libros Adquiridos */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" /> Libros Adquiridos (Total)
            </h4>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              {cargandoHistorial ? (
                <p className="text-xs text-slate-500">Cargando historial…</p>
              ) : errorHistorial ? (
                <p role="alert" className="text-xs text-rose-300">{errorHistorial}</p>
              ) : listaProductosAcumulados.length > 0 ? (
                <ul className="divide-y divide-slate-800/80 text-sm">
                  {listaProductosAcumulados.map(([nombreProd, cantidad]) => (
                    <li key={nombreProd} className="py-2 flex justify-between items-center first:pt-0 last:pb-0">
                      <span className="text-slate-100 font-medium">{nombreProd}</span>
                      <span className="font-mono bg-purple-950/60 text-purple-300 border border-purple-800/80 font-bold px-2.5 py-0.5 rounded-md text-xs">
                        x{cantidad}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No registra compra de libros aún.</p>
              )}
            </div>
          </div>

          {/* Historial de Pedidos / Envíos */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" /> Historial de Pedidos ({cargandoHistorial ? '…' : enviosOrdenados.length})
            </h4>
            <div className="bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden">
              {cargandoHistorial ? (
                <p className="p-4 text-xs text-slate-500">Cargando historial…</p>
              ) : errorHistorial ? (
                <p role="alert" className="p-4 text-xs text-rose-300">{errorHistorial}</p>
              ) : enviosOrdenados.length > 0 ? (
                <div className="divide-y divide-slate-800/80">
                  {enviosOrdenados.map((envio) => (
                    <div key={envio.id} className="p-3.5 space-y-2 hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-400">
                          {new Date(envio.createdAt).toLocaleDateString('es-PE')}
                        </span>
                        <BadgeEstado estado={envio.estado} />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-blue-400 uppercase">{envio.courier?.nombre}</span>
                        <span className="text-slate-300 font-medium">{envio.departamento}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {envio.productos
                          ?.map((p) => `${p.producto.nombreCorto || p.producto.nombre} (x${p.cantidad})`)
                          .join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-xs text-slate-500 italic">Este cliente no posee envíos en el sistema.</p>
              )}
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}
