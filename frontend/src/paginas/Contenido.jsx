import { useEffect } from 'react'

/**
 * Una página cuyo cuerpo es HTML ya redactado.
 *
 * El contenido vive como HTML y no como JSX a propósito: son 5 800 palabras con tablas, bloques
 * de código y avisos, escritas y revisadas una vez. Reescribirlas en JSX sería copiarlas a mano
 * con la posibilidad de erratas y sin ganar nada.
 *
 * Va con `dangerouslySetInnerHTML` y eso pide justificación: el HTML es **nuestro**, está en el
 * repositorio y se compila dentro del bundle. No viene de un usuario ni de la red, así que no
 * hay inyección posible — el riesgo de esta API está en el contenido ajeno, no en el propio.
 */
export default function Contenido({ html, titulo }) {
  useEffect(() => {
    document.title = `${titulo} · Corvo`
    window.scrollTo(0, 0)
  }, [titulo])

  return <div className="pagina" dangerouslySetInnerHTML={{ __html: html }} />
}
