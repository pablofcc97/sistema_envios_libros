'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Package, 
  Users, 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  Truck
} from 'lucide-react'

const navigation = [
  { name: 'Resumen', href: '/', icon: LayoutDashboard },
  { name: 'Envíos', href: '/envios', icon: Package },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Productos', href: '/productos', icon: BookOpen },
  { name: 'Couriers', href: '/couriers', icon: Truck },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col min-h-screen text-slate-200">
      {/* Encabezado del Sistema */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-white leading-tight">Shalom Envíos</h2>
          <p className="text-xs text-slate-400">Panel de Gestión</p>
        </div>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Pie del Sidebar */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        v1.0.0 — Sistema de Envíos
      </div>
    </aside>
  )
}