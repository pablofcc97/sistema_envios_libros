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
import { User, Phone, Mail, FileText, MapPin, Package, History, Copy, Check } from 'lucide-react'

interface DetalleClienteSheetProps {
  cliente: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DetalleClienteSheet({ cliente, open, onOpenChange }: DetalleClienteSheetProps) {
  const [copiadoCampo, setCopiadoCampo] = useState<string | null>(null)

  if (!cliente) return null

  // Helper para copiar al portapapeles
  const handleCopiar = (texto: string, campo: string) => {
    if (!texto) return
    navigator.clipboard.writeText(texto)
    setCopiadoCampo(campo)
    setTimeout(() => setCopiadoCampo(null), 2000)
  }

  // Ordenar envíos de más reciente a más antiguo
  const enviosOrdenados = [...(cliente.envios || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Obtener el departamento del último envío realizado
  const ultimoDepartamento = enviosOrdenados[0]?.departamento || 'Sin envíos registrados'

  // Calcular el consolidado total de productos adquiridos por el cliente
  const conteoProductos = new Map<string, number>()
  enviosOrdenados.forEach((e) => {
    e.productos?.forEach((p: any) => {
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
                title="Copiar nombre"
              >
                {copiadoCampo === 'nombre' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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
                title="Copiar DNI"
              >
                {copiadoCampo === 'dni' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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
                title="Copiar Celular"
              >
                {copiadoCampo === 'celular' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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
                  onClick={() => handleCopiar(cliente.email, 'email')}
                  className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copiar Correo"
                >
                  {copiadoCampo === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Departamento del Último Envío */}
            <div className="flex items-center justify-between text-sm border-t border-slate-800/60 pt-2">
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-slate-400">Último Departamento:</span>
                <span className="font-bold text-amber-300 uppercase ml-1">{ultimoDepartamento}</span>
              </div>
            </div>

          </div>

          {/* Consolidado de Libros Adquiridos */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" /> Libros Adquiridos (Total)
            </h4>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              {listaProductosAcumulados.length > 0 ? (
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
              <History className="w-4 h-4 text-emerald-400" /> Historial de Pedidos ({enviosOrdenados.length})
            </h4>
            <div className="bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden">
              {enviosOrdenados.length > 0 ? (
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
                          ?.map((p: any) => `${p.producto.nombreCorto || p.producto.nombre} (x${p.cantidad})`)
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