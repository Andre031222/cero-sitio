import { useEffect, useState } from 'react'

const CLAVE = 'corvo.tema'

/**
 * Conmutador de tema.
 *
 * Tres estados y no dos: claro, oscuro y «el del sistema», que es el de partida. Forzar una
 * elección desde el principio es peor que respetar lo que el visitante ya decidió en su equipo.
 *
 * La preferencia se guarda en localStorage, y ese acceso va en try/catch: en una ventana privada
 * o con las cookies bloqueadas, leerlo lanza. Si falla, se sigue con el tema del sistema.
 */
export default function Tema() {
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem(CLAVE) || 'sistema'
    } catch {
      return 'sistema'
    }
  })

  useEffect(() => {
    const raiz = document.documentElement
    if (tema === 'sistema') {
      raiz.removeAttribute('data-tema')
    } else {
      raiz.setAttribute('data-tema', tema)
    }
    try {
      tema === 'sistema' ? localStorage.removeItem(CLAVE) : localStorage.setItem(CLAVE, tema)
    } catch {
      // Sin almacenamiento la elección dura lo que la pestaña. Es aceptable.
    }
  }, [tema])

  const oscuroAhora =
    tema === 'oscuro' ||
    (tema === 'sistema' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)

  return (
    <button
      type="button"
      className="tema"
      onClick={() => setTema(oscuroAhora ? 'claro' : 'oscuro')}
      aria-label={oscuroAhora ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={oscuroAhora ? 'Tema claro' : 'Tema oscuro'}
    >
      {oscuroAhora ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  )
}
