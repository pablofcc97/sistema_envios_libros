export async function copiarTexto(texto: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texto)
      return true
    } catch {
      // En algunos navegadores móviles el portapapeles no está disponible
      // si la página se abrió por HTTP. En ese caso probamos el método clásico.
    }
  }

  const campoTemporal = document.createElement('textarea')
  campoTemporal.value = texto
  campoTemporal.setAttribute('readonly', '')
  campoTemporal.setAttribute('aria-hidden', 'true')
  campoTemporal.style.position = 'fixed'
  campoTemporal.style.top = '0'
  campoTemporal.style.left = '0'
  campoTemporal.style.opacity = '0'
  campoTemporal.style.fontSize = '16px'

  try {
    document.body.appendChild(campoTemporal)
    campoTemporal.focus()
    campoTemporal.select()
    campoTemporal.setSelectionRange(0, campoTemporal.value.length)
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    campoTemporal.remove()
  }
}
