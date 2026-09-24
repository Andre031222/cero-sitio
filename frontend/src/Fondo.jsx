import { useEffect, useRef } from 'react'

const QUIETO = '(prefers-reduced-motion: reduce)'

/** Vídeo de fondo. Con movimiento reducido no se carga: se queda el póster. */
export default function Fondo({ nombre, poster, tenue }) {
  const video = useRef(null)

  useEffect(() => {
    const nodo = video.current
    if (!nodo || window.matchMedia(QUIETO).matches) return
    nodo.src = `/catalogo/videos/${nombre}.mp4`
    nodo.play().catch(() => {})
  }, [nombre])

  return (
    <video
      ref={video}
      className={tenue ? "fondo-video fondo-video--tenue" : "fondo-video"}
      poster={poster ? `/catalogo/imagenes/${poster}.png` : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  )
}
