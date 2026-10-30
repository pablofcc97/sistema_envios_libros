'use client'

import { useCallback, useEffect, useState } from 'react'

const CLAVE_PREFERENCIA = 'sistema-envios:filas-por-pagina'
const EVENTO_PREFERENCIA = 'sistema-envios:filas-por-pagina:actualizada'
const VALORES_PERMITIDOS = [10, 25, 50, 100]

function leerPreferencia(): number {
  const valor = Number(window.localStorage.getItem(CLAVE_PREFERENCIA))
  return VALORES_PERMITIDOS.includes(valor) ? valor : 10
}

export function usePreferenciaFilas() {
  const [filasPorPagina, setFilasPorPagina] = useState(10)
  const [preferenciaLista, setPreferenciaLista] = useState(false)

  useEffect(() => {
    const sincronizar = () => setFilasPorPagina(leerPreferencia())
    sincronizar()
    setPreferenciaLista(true)

    const sincronizarOtraPestana = (event: StorageEvent) => {
      if (event.key === CLAVE_PREFERENCIA) sincronizar()
    }

    window.addEventListener('storage', sincronizarOtraPestana)
    window.addEventListener(EVENTO_PREFERENCIA, sincronizar)
    return () => {
      window.removeEventListener('storage', sincronizarOtraPestana)
      window.removeEventListener(EVENTO_PREFERENCIA, sincronizar)
    }
  }, [])

  const guardarFilasPorPagina = useCallback((filas: number) => {
    if (!VALORES_PERMITIDOS.includes(filas)) return
    window.localStorage.setItem(CLAVE_PREFERENCIA, String(filas))
    setFilasPorPagina(filas)
    window.dispatchEvent(new Event(EVENTO_PREFERENCIA))
  }, [])

  return { filasPorPagina, guardarFilasPorPagina, preferenciaLista }
}
