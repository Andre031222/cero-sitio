import { useEffect, useRef } from 'react'

const QUIETO = '(prefers-reduced-motion: reduce)'

/* Todas a la derecha del 55 %: la columna izquierda es donde vive el texto. */
const PIEZAS = [
  { forma: 'tetra-cyan',    x: '84%', y: '18%', tam: '22rem', giro: -14, fondo: .30 },
  { forma: 'diamond-blue',  x: '62%', y: '62%', tam: '14rem', giro: 22,  fondo: .26 },
  { forma: 'triangle-cyan', x: '92%', y: '78%', tam: '11rem', giro: 8,   fondo: .22 },
  { forma: 'tetra-amber',   x: '70%', y: '34%', tam: '6rem',  giro: -30, fondo: .34 },
  { forma: 'diamond-ice',   x: '96%', y: '48%', tam: '9rem',  giro: 12,  fondo: .16 },
]

/** Composición decorativa con las formas del kit. Parallax muy contenido; nunca lleva información. */
export default function Geometria({ variante = 'completa' }) {
  const caja = useRef(null)

  useEffect(() => {
    const raiz = caja.current
    if (!raiz || window.matchMedia(QUIETO).matches) return

    let pedido = 0
    const mover = () => {
      pedido = 0
      const y = window.scrollY
      for (const nodo of raiz.children) {
        nodo.style.setProperty('--desvio', `${y * Number(nodo.dataset.fondo) * -0.12}px`)
      }
    }
    const alRodar = () => { if (!pedido) pedido = requestAnimationFrame(mover) }

    mover()
    window.addEventListener('scroll', alRodar, { passive: true })
    return () => { window.removeEventListener('scroll', alRodar); cancelAnimationFrame(pedido) }
  }, [])

  const piezas = variante === 'sobria' ? PIEZAS.slice(0, 3) : PIEZAS

  return (
    <div className="geometria" ref={caja} aria-hidden="true">
      {piezas.map((p) => (
        <span
          key={p.forma}
          className="geo-pieza"
          data-fondo={p.fondo}
          style={{
            '--x': p.x, '--y': p.y, '--tam': p.tam,
            '--giro': `${p.giro}deg`, '--opacidad': p.fondo,
            backgroundImage: `url("/marca/shape-${p.forma}.svg")`,
          }}
        />
      ))}
    </div>
  )
}
