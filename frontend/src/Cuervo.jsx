import { useEffect, useRef } from 'react'

/**
 * El cuervo de la portada, con volumen.
 *
 * El dibujo es un grabado plano del XVIII y no hay forma honesta de convertirlo en un modelo 3D.
 * Lo que sí se puede es darle profundidad: se monta sobre una caja con `perspective` y se inclina
 * siguiendo al puntero, con la sombra desplazándose al revés que la figura. El ojo lee eso como
 * relieve aunque la imagen siga siendo plana, y cuesta un `transform` en la GPU en lugar de una
 * librería de tres dimensiones que pesaría más que el framework entero.
 *
 * Tres cosas que lo mantienen honrado:
 *
 * - **Se mueve en el hilo de pintado.** El `mousemove` solo guarda coordenadas; el `transform` se
 *   escribe dentro de un `requestAnimationFrame`. Escribirlo en el evento fuerza un reflujo por
 *   cada píxel que se mueve el ratón.
 * - **No se activa donde no hay puntero.** En un teléfono no hay ratón que seguir, así que ni se
 *   registra el oyente: la inclinación se queda en su sitio y el cuervo pasa a ser una marca de
 *   agua detrás del texto, que es lo que cabe en esa pantalla.
 * - **Se está quieto si se lo piden.** Con `prefers-reduced-motion: reduce` no hay entrada, ni
 *   flotación, ni seguimiento: aparece y se queda.
 */

/** Cuánto llega a girar en los bordes. Más de esto y la lámina se deforma. */
const GIRO_MAXIMO = 9

export default function Cuervo() {
  const escena = useRef(null)

  useEffect(() => {
    const caja = escena.current
    if (!caja) return
    const quieto = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const hayPuntero = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
    if (quieto || !hayPuntero) return

    let pedido = 0
    let x = 0
    let y = 0

    const pintar = () => {
      pedido = 0
      caja.style.setProperty('--giro-y', `${x * GIRO_MAXIMO}deg`)
      caja.style.setProperty('--giro-x', `${-y * GIRO_MAXIMO}deg`)
      // La sombra va al lado contrario del giro: es lo que da la sensación de que hay un
      // cuerpo separado del fondo y no un cromo pegado.
      caja.style.setProperty('--sombra-x', `${-x * 18}px`)
      caja.style.setProperty('--sombra-y', `${-y * 10 + 12}px`)
    }

    // Se escucha en la ventana y no en la figura: la figura tiene pointer-events:none para no
    // robarle el clic a nada, así que nunca recibiría el evento.
    const seguir = (e) => {
      const marco = caja.getBoundingClientRect()
      const centroX = marco.left + marco.width / 2
      const centroY = marco.top + marco.height / 2
      // Normalizado a [-1, 1] contra la ventana, no contra la figura: si se midiera contra la
      // figura, el giro saltaría al máximo en cuanto el puntero rozara el borde.
      x = Math.max(-1, Math.min(1, (e.clientX - centroX) / (window.innerWidth / 2)))
      y = Math.max(-1, Math.min(1, (e.clientY - centroY) / (window.innerHeight / 2)))
      if (!pedido) pedido = requestAnimationFrame(pintar)
    }

    window.addEventListener('pointermove', seguir, { passive: true })
    return () => {
      window.removeEventListener('pointermove', seguir)
      if (pedido) cancelAnimationFrame(pedido)
    }
  }, [])

  return (
    <div className="cuervo" ref={escena} aria-hidden="true">
      <div className="cuervo-figura" />
    </div>
  )
}
