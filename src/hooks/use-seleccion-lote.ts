'use client'

import { useState, useCallback } from 'react'

export function useSeleccionLote<T extends { id: string }>(
  itemsPaginados: T[],
  itemsFiltrados: T[]
) {
  const [seleccionados, setSeleccionados] = useState<string[]>([])

  // Comprobar si los visibles en la página actual están seleccionados
  const todosPaginaSeleccionados =
    itemsPaginados.length > 0 &&
    itemsPaginados.every((item) => seleccionados.includes(item.id))

  // Alternar selección de la página actual o desmarcar todo si ya hay selecciones
  const toggleSeleccionarPagina = useCallback(() => {
    if (todosPaginaSeleccionados || seleccionados.length > 0) {
      setSeleccionados([])
    } else {
      const idsPagina = itemsPaginados.map((item) => item.id)
      setSeleccionados((prev) => Array.from(new Set([...prev, ...idsPagina])))
    }
  }, [todosPaginaSeleccionados, seleccionados.length, itemsPaginados])

  // Alternar la selección de una sola fila
  const toggleSeleccionFila = useCallback((id: string) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  // Seleccionar absolutamente todos los registros de la consulta
  const seleccionarTodosConsulta = useCallback(() => {
    setSeleccionados(itemsFiltrados.map((item) => item.id))
  }, [itemsFiltrados])

  // Limpiar selección manualmente (al buscar o filtrar)
  const limpiarSeleccion = useCallback(() => {
    setSeleccionados([])
  }, [])

  return {
    seleccionados,
    todosPaginaSeleccionados,
    toggleSeleccionarPagina,
    toggleSeleccionFila,
    seleccionarTodosConsulta,
    limpiarSeleccion,
    setSeleccionados,
  }
}