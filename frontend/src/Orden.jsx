import { useState } from 'react'

/** Una orden de terminal con su botón de copiar. */
export default function Orden({ children }) {
  const [copiado, setCopiado] = useState(false)
  const texto = String(children)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1600)
    } catch {
      // Sin permiso de portapapeles el texto sigue ahí para seleccionarlo a mano.
    }
  }

  return (
    <div className="orden">
      <code><span className="senal">$</span> {texto}</code>
      <button type="button" onClick={copiar} aria-label="Copiar la orden">
        {copiado ? '✓' : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  )
}
