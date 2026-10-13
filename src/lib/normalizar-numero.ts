/** Conserva solo dígitos para permitir pegar números con espacios o guiones. */
export function normalizarNumero(texto: string) {
  return texto.replace(/\D/g, '')
}
