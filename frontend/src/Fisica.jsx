import { useEffect, useRef } from 'react'

const QUIETO = '(prefers-reduced-motion: reduce)'

const PIEZAS = [
  { lados: 3, radio: 54, color: '#22d3ee' },
  { lados: 4, radio: 40, color: '#38bdf8' },
  { lados: 3, radio: 34, color: '#f59e0b' },
  { lados: 6, radio: 44, color: '#1d4ed8' },
  { lados: 4, radio: 58, color: '#e2e8f0' },
  { lados: 3, radio: 42, color: '#22d3ee' },
  { lados: 5, radio: 36, color: '#38bdf8' },
  { lados: 4, radio: 30, color: '#f59e0b' },
]

/** Formas del kit cayendo y chocando. Decorativa: el motor se carga solo si va a verse. */
export default function Fisica() {
  const caja = useRef(null)

  useEffect(() => {
    const nodo = caja.current
    const estrecha = window.matchMedia('(max-width: 60rem)').matches
    const pocaCpu = (navigator.hardwareConcurrency || 8) <= 4
    if (!nodo || window.matchMedia(QUIETO).matches || estrecha || pocaCpu) return

    let motor = null
    let render = null
    let corredor = null
    let observador = null
    let vivo = true

    const arrancar = async () => {
      const M = (await import('matter-js')).default
      if (!vivo) return

      const ancho = nodo.clientWidth
      const alto = nodo.clientHeight
      motor = M.Engine.create({ enableSleeping: true })
      motor.gravity.y = 0.42

      render = M.Render.create({
        element: nodo,
        engine: motor,
        options: { width: ancho, height: alto, wireframes: false, background: 'transparent',
                   pixelRatio: Math.min(window.devicePixelRatio, 2) },
      })

      const muro = (x, y, w, h) =>
        M.Bodies.rectangle(x, y, w, h, { isStatic: true, render: { visible: false } })
      M.Composite.add(motor.world, [
        muro(ancho / 2, alto + 30, ancho * 2, 60),
        muro(-30, alto / 2, 60, alto * 2),
        muro(ancho + 30, alto / 2, 60, alto * 2),
      ])

      const cuerpos = PIEZAS.map((p, i) =>
        M.Bodies.polygon(ancho * (0.15 + 0.1 * i), -120 - i * 90, p.lados, p.radio, {
          restitution: 0.45,
          friction: 0.06,
          angle: Math.random() * Math.PI,
          render: { fillStyle: 'transparent', strokeStyle: p.color, lineWidth: 1.6 },
        }))
      M.Composite.add(motor.world, cuerpos)

      const raton = M.Mouse.create(render.canvas)
      raton.element.removeEventListener('wheel', raton.mousewheel)
      M.Composite.add(motor.world, M.MouseConstraint.create(motor, {
        mouse: raton,
        constraint: { stiffness: 0.12, render: { visible: false } },
      }))
      render.mouse = raton

      // Una pieza que se escape del lienzo no vuelve sola: se recoloca arriba.
      M.Events.on(motor, 'afterUpdate', () => {
        for (const cuerpo of cuerpos) {
          const { x, y } = cuerpo.position
          if (y > alto + 200 || x < -200 || x > ancho + 200) {
            M.Body.setPosition(cuerpo, { x: ancho * (0.25 + Math.random() * 0.5), y: -80 })
            M.Body.setVelocity(cuerpo, { x: 0, y: 0 })
          }
        }
      })

      corredor = M.Runner.create()
      M.Runner.run(corredor, motor)
      M.Render.run(render)
    }

    // Solo se descarga el motor si la sección llega a verse.
    observador = new IntersectionObserver((entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return
      observador.disconnect()
      arrancar()
    }, { rootMargin: '120px' })
    observador.observe(nodo)

    const alRedimensionar = () => {
      if (!render || !nodo) return
      render.canvas.width = nodo.clientWidth
      render.canvas.height = nodo.clientHeight
      render.options.width = nodo.clientWidth
      render.options.height = nodo.clientHeight
    }
    window.addEventListener('resize', alRedimensionar)

    return () => {
      vivo = false
      window.removeEventListener('resize', alRedimensionar)
      observador?.disconnect()
      if (render) { render.canvas?.remove(); render.textures = {} }
      if (corredor && motor) import('matter-js').then(({ default: M }) => {
        M.Render.stop(render); M.Runner.stop(corredor); M.Engine.clear(motor)
      })
    }
  }, [])

  return <div className="fisica" ref={caja} aria-hidden="true" />
}
