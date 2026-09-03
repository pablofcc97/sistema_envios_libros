import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppSidebar } from '@/components/app-sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Envíos Shalom',
  description: 'Gestión de envíos y paquetes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex antialiased`}>
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </body>
    </html>
  )
}