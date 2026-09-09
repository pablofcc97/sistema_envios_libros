'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function BotonCopiar({
  valor,
  tooltip = 'Copiar',
}: {
  valor: string
  tooltip?: string
}) {
  const [copiado, setCopiado] = useState(false)

  async function copiar(e: React.MouseEvent) {
    e.stopPropagation()
    if (!valor) return
    await navigator.clipboard.writeText(valor)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1200)
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="cursor-pointer text-slate-500 hover:text-blue-400 p-1 rounded hover:bg-slate-800 transition-all inline-flex items-center justify-center shrink-0"
      title={copiado ? '¡Copiado!' : tooltip}
    >
      {copiado ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  )
}