import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { BarraResumenAgencia } from '@/components/layout/barra-resumen-agencia'
import { obtenerMetricasRapidas } from '@/app/envios/actions'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Envíos Shalom',
  description: 'Gestión de envíos y paquetes',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const metricas = await obtenerMetricasRapidas()

  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      {/* h-screen y overflow-hidden en el body para evitar el scroll global de la ventana */}
      <body className={`${inter.className} flex h-dvh overflow-hidden bg-slate-950 text-slate-100 antialiased`}>
        <AppSidebar />
        
        {/* main se restringe a h-screen y maneja el scroll interno */}
        <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
          {/* Barra Fija en el borde superior del main */}
          <BarraResumenAgencia
            ultimaClave={metricas.ultimaClave}
            totalShalom={metricas.totalShalom}
            totalOlva={metricas.totalOlva}
            totalParaAgencia={metricas.totalParaAgencia}
          />

          {/* Área de contenido */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
