import { useEffect, useRef, useState } from 'react'
import { VERSION } from './version.js'

/** Una terminal que escribe sola los cuatro pasos de la instalación. */

// Lo que sale aquí es lo que sale de verdad al instalar y arrancar: medido el 25 de septiembre
// de 2026 contra el paquete publicado, no escrito a ojo. Un demo que promete lo que no pasa se
// nota a la primera vez que alguien lo prueba.
const GUION = [
  { orden: 'curl -fsSL https://cero.ginit.dev/instalar | sh', salida: [
      `descargando cero-${VERSION}.tar.gz … 349 KB`,
      'comprobando huella sha256 … correcta',
      'compilando … 1 764 pruebas en verde',
      'orden cero lista en ~/.local/bin',
  ]},
  { orden: 'cero new mi-app', salida: [
      'creando mi-app/ …',
      'pom.xml · App.java · InicioController.java · plantillas/ · estaticos/',
      'listo. cd mi-app && mvn -q package',
  ]},
  { orden: 'java -Xmx64m -jar target/mi-app.jar', salida: [
      'cero · http://0.0.0.0:8080 · 2 rutas · 20 ms',
  ]},
]

const PAUSA_TECLA = 28
const PAUSA_LINEA = 190
const PAUSA_ORDEN = 620

export default function Terminal() {
  const caja = useRef(null)
  const [lineas, setLineas] = useState([])
  const [corriendo, setCorriendo] = useState(false)
  const [visible, setVisible] = useState(false)
  const [quieto] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )

  // No animar lo que nadie está mirando.
  useEffect(() => {
    const el = caja.current
    if (!el || !('IntersectionObserver' in window)) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.25 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    if (quieto) { setLineas(completo()); return }
    let vivo = true
    const temporizadores = []
    const esperar = (ms) => new Promise((r) => temporizadores.push(setTimeout(r, ms)))

    ;(async () => {
      setCorriendo(true)
      for (const paso of GUION) {
        // la orden, tecleada
        for (let i = 1; i <= paso.orden.length; i++) {
          if (!vivo) return
          setLineas((l) => {
            const previas = l.filter((x) => x.fija)
            return [...previas, { tipo: 'orden', texto: paso.orden.slice(0, i), fija: false }]
          })
          await esperar(PAUSA_TECLA)
        }
        setLineas((l) => l.map((x) => ({ ...x, fija: true })))
        await esperar(PAUSA_LINEA)
        for (const s of paso.salida) {
          if (!vivo) return
          setLineas((l) => [...l, { tipo: 'salida', texto: s, fija: true }])
          await esperar(PAUSA_LINEA)
        }
        await esperar(PAUSA_ORDEN)
      }
      if (vivo) setCorriendo(false)
    })()

    return () => { vivo = false; temporizadores.forEach(clearTimeout) }
  }, [visible, quieto])

  const repetir = () => { setLineas([]); setVisible(false); requestAnimationFrame(() => setVisible(true)) }

  return (
    <div className="terminal" ref={caja}>
      <div className="terminal-barra">
        <div className="luces" aria-hidden="true"><i /><i /><i /></div>
        <span className="ruta">~/proyectos</span>
        <button type="button" onClick={repetir} disabled={corriendo && !quieto}>
          repetir
        </button>
      </div>
      {/* Sin región viva. */}
      <pre className="terminal-pantalla" aria-label="Instalación paso a paso">
{lineas.map((l, i) => (
  l.tipo === 'orden'
    ? <span key={i} className="linea-orden"><span className="senal">$</span> {l.texto}
        {!l.fija && !quieto && <span className="cursor" />}{'\n'}</span>
    : <span key={i} className="linea-salida">  {l.texto}{'\n'}</span>
))}
      </pre>
    </div>
  )
}

/** El resultado ya completo, para quien pidió menos movimiento. */
function completo() {
  return GUION.flatMap((p) => [
    { tipo: 'orden', texto: p.orden, fija: true },
    ...p.salida.map((s) => ({ tipo: 'salida', texto: s, fija: true })),
  ])
}
