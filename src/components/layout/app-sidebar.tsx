'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  Menu,
  X,
  Package, 
  Users, 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  Truck
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Envíos', href: '/envios', icon: Package },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Productos', href: '/productos', icon: BookOpen },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((actual) => !actual)}
        aria-label={abierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        aria-expanded={abierto}
        className="fixed left-3 top-3 z-[60] inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-100 shadow-lg hover:bg-slate-800 md:hidden"
      >
        {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {abierto && (
        <button
          type="button"
          onClick={() => setAbierto(false)}
          aria-label="Cerrar menú de navegación"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex min-h-screen w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-200 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${abierto ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Encabezado del Sistema */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 pl-16 pr-6 md:px-6">
          <div className="rounded-lg bg-blue-600 p-2 text-white">
            <Truck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold leading-tight text-white">Shalom Envíos</h2>
            <p className="text-xs text-slate-400">Panel de Gestión</p>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setAbierto(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Pie del Sidebar */}
        <div className="border-t border-slate-800 p-4 text-center text-xs text-slate-500">
          v1.0.0 — Sistema de Envíos
        </div>
      </aside>
    </>
  )
}
