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
    <html lang="es" className="dark">
      {/* h-screen y overflow-hidden en el body para evitar el scroll global de la ventana */}
      <body className={`${inter.className} bg-slate-950 text-slate-100 h-screen overflow-hidden flex antialiased`}>
        <AppSidebar />
        
        {/* main se restringe a h-screen y maneja el scroll interno */}
        <main className="flex-1 h-screen overflow-y-auto relative flex flex-col">
          {/* Barra Fija en el borde superior del main */}
          <BarraResumenAgencia
            ultimaClave={metricas.ultimaClave}
            totalShalom={metricas.totalShalom}
            totalOlva={metricas.totalOlva}
            totalParaAgencia={metricas.totalParaAgencia}
          />

          {/* Área de contenido */}
          <div className="p-8 flex-1">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}