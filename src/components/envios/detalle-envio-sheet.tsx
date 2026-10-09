'use client'

import { useState } from 'react'
import type { Prisma } from '@prisma/client'
import {
  CalendarDays,
  Check,
  Copy,
  Key,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { BadgeEstado } from '@/components/ui/badge-estado'

type EnvioDetalle = Prisma.EnvioGetPayload<{
  include: {
    cliente: true
    courier: true
    productos: { include: { producto: true } }
  }
}>

interface DetalleEnvioSheetProps {
  envio: EnvioDetalle | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function obtenerColorTexto(color: string | null | undefined) {
  if (!color || !/^#[\da-f]{6}$/i.test(color)) return '#FFFFFF'

  const canales = color.slice(1).match(/.{2}/g)!.map((canal) => parseInt(canal, 16) / 255)
  const lineales = canales.map((canal) => (
    canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4
  ))
  const luminancia = 0.2126 * lineales[0] + 0.7152 * lineales[1] + 0.0722 * lineales[2]
  const contrasteNegro = (luminancia + 0.05) / 0.05
  const contrasteBlanco = 1.05 / (luminancia + 0.05)

  return contrasteNegro >= contrasteBlanco ? '#000000' : '#FFFFFF'
}

export function DetalleEnvioSheet({ envio, open, onOpenChange }: DetalleEnvioSheetProps) {
  const [copiadoCampo, setCopiadoCampo] = useState<string | null>(null)

  if (!envio) return null

  const formatearFechaExtendida = (fechaIso: Date | string) => {
    if (!fechaIso) return ''
    const fecha = new Date(fechaIso)
    const diaSemanaRaw = fecha.toLocaleDateString('es-PE', { weekday: 'long' })
    const diaSemana = diaSemanaRaw.charAt(0).toUpperCase() + diaSemanaRaw.slice(1)
    const diaNum = fecha.getDate().toString().padStart(2, '0')
    const mes = fecha.toLocaleDateString('es-PE', { month: 'long' })
    const anio = fecha.getFullYear()

    return `${diaSemana} ${diaNum}/${mes}/${anio}`
  }

  const handleCopiar = async (texto: string, campo: string) => {
    if (!texto) return
    await navigator.clipboard.writeText(texto)
    setCopiadoCampo(campo)
    setTimeout(() => setCopiadoCampo(null), 2000)
  }

  const colorCourier = envio.courier.color || '#2563EB'
  const colorTextoCourier = obtenerColorTexto(colorCourier)
  const copiarBoton = (texto: string, campo: string, etiqueta: string) => (
    <button
      type="button"
      onClick={() => void handleCopiar(texto, campo)}
      className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      title={`Copiar ${etiqueta}`}
      aria-label={`Copiar ${etiqueta}`}
    >
      {copiadoCampo === campo
        ? <Check className="h-4 w-4 text-emerald-400" />
        : <Copy className="h-4 w-4" />}
    </button>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l border-slate-800 bg-slate-950 p-0 text-slate-100 sm:max-w-lg">
        <SheetHeader className="border-b border-slate-800 bg-slate-900/70 px-5 pb-5 pt-7 sm:px-6">
          <div className="flex items-start justify-between gap-4 pr-7">
            <div className="space-y-1.5">
              <SheetTitle className="text-xl font-bold tracking-tight text-white">
                Detalle del envío
              </SheetTitle>
            </div>
            <BadgeEstado estado={envio.estado} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 ">
            <div className="rounded-xl border border-slate-800  p-3.5">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" /> Fecha de envío
              </p>
              <p className="text-sm font-semibold text-slate-100">
                {formatearFechaExtendida(envio.createdAt)}
              </p>
            </div>

            <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-3.5">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400/80">
                <Key className="h-3.5 w-3.5" /> Clave de envío
              </p>
              <div className="flex min-w-0 items-center justify-between gap-2">
                <p className={`truncate font-mono text-base font-bold ${envio.claveEnvio ? 'text-amber-300' : 'text-slate-500'}`}>
                  {envio.claveEnvio || 'Pendiente'}
                </p>
                {envio.claveEnvio && copiarBoton(envio.claveEnvio, 'claveEnvio', 'clave de envío')}
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <section className="space-y-2.5">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <User className="h-4 w-4 text-blue-400" /> Cliente
            </h3>
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <p className="min-w-0 break-words text-base font-bold text-white">
                  {envio.cliente.nombre}
                </p>
                {copiarBoton(envio.cliente.nombre, 'nombre', 'nombre')}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-950/70 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">DNI / RUC</p>
                    <p className="truncate font-mono text-sm font-semibold text-slate-100">{envio.cliente.dni}</p>
                  </div>
                  {copiarBoton(envio.cliente.dni, 'dni', 'DNI / RUC')}
                </div>
                <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-950/70 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      <Phone className="h-3 w-3 text-emerald-400" /> Celular
                    </p>
                    <p className="truncate font-mono text-sm font-semibold text-slate-100">{envio.cliente.celular}</p>
                  </div>
                  {copiarBoton(envio.cliente.celular, 'celular', 'celular')}
                </div>
              </div>

              {envio.cliente.email && (
                <div className="flex min-w-0 items-center justify-between gap-2 border-t border-slate-800 pt-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-violet-400" />
                    <p className="truncate text-sm text-slate-300">{envio.cliente.email}</p>
                  </div>
                  {copiarBoton(envio.cliente.email, 'email', 'correo electrónico')}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <MapPin className="h-4 w-4 text-amber-400" /> Destino y courier
            </h3>
            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Courier</span>
                <span
                  className="inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
                  style={{ backgroundColor: colorCourier, color: colorTextoCourier }}
                >
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{envio.courier.nombre}</span>
                </span>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Dirección / referencia</p>
                {envio.referencia && (
                  <p className="mb-1 text-xs font-semibold text-amber-300">{envio.referencia}</p>
                )}
                <p className="break-words text-sm font-semibold uppercase leading-relaxed text-slate-100">
                  {envio.direccion || 'Dirección pendiente'}
                </p>
                <p className="mt-2 inline-flex rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-medium text-slate-300">
                  {envio.departamento || 'Región no especificada'}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Package className="h-4 w-4 text-purple-400" /> Contenido del paquete
            </h3>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              {envio.productos.length > 0 ? (
                <ul className="divide-y divide-slate-800">
                  {envio.productos.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="min-w-0 break-words text-sm font-medium text-slate-100">
                        {item.producto.nombreCorto || item.producto.nombre}
                      </span>
                      <span className="shrink-0 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1 font-mono text-xs font-bold text-slate-200">
                        ×{item.cantidad}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No hay productos asociados.</p>
              )}
            </div>
          </section>

          {envio.observaciones?.trim() && (
            <section className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Observaciones internas
              </h3>
              <div className="rounded-xl border border-amber-900/50 border-l-4 border-l-amber-500 bg-amber-950/20 px-4 py-3.5 text-sm leading-relaxed text-slate-200">
                {envio.observaciones}
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
