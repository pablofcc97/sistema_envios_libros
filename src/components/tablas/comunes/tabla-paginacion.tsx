'use client'

import { Button } from '@/components/ui/button'

interface TablaPaginacionProps {
  totalRegistros: number
  paginaActual: number
  filasPorPagina: number
  onPaginaChange: (pagina: number) => void
  onFilasPorPaginaChange: (filas: number) => void
}

export function TablaPaginacion({
  totalRegistros,
  paginaActual,
  filasPorPagina,
  onPaginaChange,
  onFilasPorPaginaChange,
}: TablaPaginacionProps) {
  const totalPaginas = Math.ceil(totalRegistros / filasPorPagina) || 1

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
      {/* Selector de Filas por Página y Resumen */}
      <div className="flex items-center gap-3">
        <span>Mostrar</span>
        <select
          value={filasPorPagina}
          onChange={(e) => onFilasPorPaginaChange(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>
          filas • Mostrando{' '}
          {totalRegistros > 0 ? (paginaActual - 1) * filasPorPagina + 1 : 0} a{' '}
          {Math.min(paginaActual * filasPorPagina, totalRegistros)} de{' '}
          <strong className="text-slate-200">{totalRegistros}</strong> registros
        </span>
      </div>

      {/* Navegación de Páginas */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual === 1}
          onClick={() => onPaginaChange(Math.max(paginaActual - 1, 1))}
          className="h-8 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 cursor-pointer text-xs"
        >
          Anterior
        </Button>

        <span className="px-2">
          Página <strong className="text-slate-100">{paginaActual}</strong> de{' '}
          <strong className="text-slate-100">{totalPaginas}</strong>
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual >= totalPaginas}
          onClick={() => onPaginaChange(Math.min(paginaActual + 1, totalPaginas))}
          className="h-8 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 cursor-pointer text-xs"
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}