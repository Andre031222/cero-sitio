import { useEffect } from 'react'

const QUIETO = '(prefers-reduced-motion: reduce)'

/** Revela los [data-revelar] al entrar en pantalla. Se remonta por ruta: los nodos cambian. */
export default function useRevelar(dependencia) {
  useEffect(() => {
    const nodos = [...document.querySelectorAll('[data-revelar]')]
    if (!nodos.length) return

    const mostrar = (nodo) => nodo.classList.add('dentro')

    if (window.matchMedia(QUIETO).matches || !('IntersectionObserver' in window)) {
      nodos.forEach(mostrar)
      return
    }

    // Umbral 0: con un umbral por porcentaje, un elemento más alto que la pantalla no lo alcanza nunca.
    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue
        mostrar(entrada.target)
        observador.unobserve(entrada.target)
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 })

    nodos.forEach((nodo, i) => {
      if (nodo.classList.contains('dentro')) return
      if (!nodo.style.getPropertyValue('--retraso')) {
        // El escalonado depende del orden de entrada, que una hoja de estilo no conoce.
        nodo.style.setProperty('--retraso', `${Math.min(i % 6, 5) * 70}ms`)
      }
      observador.observe(nodo)
    })

    // Red de seguridad: nada puede quedarse invisible si el observador no llega a disparar.
    const plazo = setTimeout(() => nodos.forEach(mostrar), 1200)

    return () => { clearTimeout(plazo); observador.disconnect() }
  }, [dependencia])
}
