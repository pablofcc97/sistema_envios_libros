'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { BadgeEstado } from '@/components/ui/badge-estado'
import { MapPin, Package, Phone, User, Key, Copy, Check, Mail } from 'lucide-react'

interface DetalleEnvioSheetProps {
  envio: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DetalleEnvioSheet({ envio, open, onOpenChange }: DetalleEnvioSheetProps) {
  const [copiadoCampo, setCopiadoCampo] = useState<string | null>(null)

  if (!envio) return null

  // Formatear fecha: Ej. "Martes 09/septiembre/2026"
  const formatearFechaExtendida = (fechaIso: string) => {
    if (!fechaIso) return ''
    const fecha = new Date(fechaIso)
    
    const diaSemanaRaw = fecha.toLocaleDateString('es-PE', { weekday: 'long' })
    const diaSemana = diaSemanaRaw.charAt(0).toUpperCase() + diaSemanaRaw.slice(1)
    
    const diaNum = fecha.getDate().toString().padStart(2, '0')
    const mes = fecha.toLocaleDateString('es-PE', { month: 'long' })
    const anio = fecha.getFullYear()

    return `${diaSemana} ${diaNum}/${mes}/${anio}`
  }

  // Helper para copiar al portapapeles
  const handleCopiar = (texto: string, campo: string) => {
    if (!texto) return
    navigator.clipboard.writeText(texto)
    setCopiadoCampo(campo)
    setTimeout(() => setCopiadoCampo(null), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-900 border-l border-slate-800 text-slate-100 sm:max-w-lg w-full p-6 overflow-y-auto">
        
        {/* Cabecera */}
        <SheetHeader className="border-b border-slate-800/80 pb-5 pt-2">
          <div className="flex items-start justify-between gap-4 pr-6">
            <div className="space-y-1">
              <SheetTitle className="text-white text-xl font-bold">
                Detalle del Envío
              </SheetTitle>
              <SheetDescription className="text-slate-400 text-xs flex flex-col">
                <span>Registrado el:</span>
                <span className="text-slate-200 text-sm font-semibold mt-0.5">
                  {formatearFechaExtendida(envio.createdAt)}
                </span>
              </SheetDescription>
            </div>
            <div className="shrink-0">
              <BadgeEstado estado={envio.estado} />
            </div>
          </div>
        </SheetHeader>

        {/* Cuerpo del Detalle */}
        <div className="space-y-6 pt-6 text-sm">
          
          {/* Bloque 1: Cliente con Botones de Copiar */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" /> Cliente
            </h4>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
              
              {/* Nombre */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                <span className="font-bold text-white text-base">
                  {envio.cliente.nombre}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopiar(envio.cliente.nombre, 'nombre')}
                  className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copiar nombre"
                >
                  {copiadoCampo === 'nombre' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* DNI / RUC */}
              <div className="flex items-center justify-between text-sm">
                <div className="text-slate-300">
                  <span className="text-slate-400">DNI / RUC:</span>{' '}
                  <span className="font-mono text-white font-semibold text-base ml-1">
                    {envio.cliente.dni}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopiar(envio.cliente.dni, 'dni')}
                  className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Copiar DNI/RUC"
                >
                  {copiadoCampo === 'dni' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Celular */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400">Celular:</span>
                  <span className="font-mono text-white font-semibold text-base ml-1">
                    {envio.cliente.celular}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopiar(envio.cliente.celular, 'celular')}
                  className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Copiar celular"
                >
                  {copiadoCampo === 'celular' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Correo */}
              {envio.cliente.email && (
                <div className="flex items-center justify-between text-sm border-t border-slate-800/60 pt-2">
                  <div className="flex items-center gap-1.5 text-slate-300 truncate">
                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-slate-400">Email:</span>
                    <span className="text-white font-medium truncate ml-1">
                      {envio.cliente.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopiar(envio.cliente.email, 'email')}
                    className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Copiar correo"
                  >
                    {copiadoCampo === 'email' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Bloque 2: Destino & Courier */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" /> Destino & Courier
            </h4>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-sm text-slate-400">Agencia / Courier:</span>
                <span className="font-bold text-blue-400 text-base uppercase">
                  {envio.courier.nombre}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-400">Dirección / Referencia:</p>
                <p className="text-sm font-semibold text-slate-100 uppercase leading-relaxed">
                  {envio.referencia ? `(${envio.referencia}) ` : ''}
                  {envio.direccion || 'AGENCIA SHALOM'} - {envio.departamento}
                </p>
              </div>

              {/* Clave de envío con botón de copiar */}
              {envio.claveEnvio && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-sm text-slate-400 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" /> Clave de envío:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-md text-sm border border-amber-800/80">
                      {envio.claveEnvio}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopiar(envio.claveEnvio, 'claveEnvio')}
                      className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copiar clave de envío"
                    >
                      {copiadoCampo === 'claveEnvio' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bloque 3: Contenido / Productos */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" /> Contenido del Paquete
            </h4>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <ul className="divide-y divide-slate-800/80 text-sm">
                {envio.productos.map((item: any) => (
                  <li key={item.id} className="py-2.5 flex justify-between items-center first:pt-0 last:pb-0">
                    <span className="text-slate-100 font-medium">
                      {item.producto.nombreCorto || item.producto.nombre}
                    </span>
                    <span className="font-mono bg-slate-800 text-slate-200 font-bold px-2.5 py-0.5 rounded-md border border-slate-700 text-xs">
                      x{item.cantidad}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bloque 4: Observaciones Internas */}
          {envio.observaciones && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Observaciones Internas
              </h4>
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-sm text-slate-200 italic leading-relaxed">
                {envio.observaciones}
              </div>
            </div>
          )}

        </div>
      </SheetContent>
    </Sheet>
  )
}