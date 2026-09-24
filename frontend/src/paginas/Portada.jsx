import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Orden from '../Orden.jsx'
import Terminal from '../Terminal.jsx'
import Geometria from '../Geometria.jsx'
import Lamina from '../Lamina.jsx'
import Fondo from '../Fondo.jsx'
import useRevelar from '../revelar.js'
import { idiomaDe, TEXTOS, raizDe } from '../idioma.js'
import { VERSION } from '../version.js'
import '../portada.css'

const REPO = 'https://github.com/Andre031222/Cero'
const INSTALAR = 'curl -fsSL https://cero.ginit.dev/instalar | sh'

export default function Portada() {
  const { pathname } = useLocation()
  const idioma = idiomaDe(pathname)
  const t = TEXTOS[idioma].portada
  const menu = TEXTOS[idioma].menu
  const raiz = raizDe(idioma)
  const rotulo = (sufijo) => menu.find(([s]) => s === sufijo)[1]

  useRevelar(pathname)

  useEffect(() => {
    document.title = idioma === 'en'
      ? 'Cero — web framework for Java'
      : 'Cero — framework web para Java'
  }, [idioma])

  return (
    <>
      {/* 1 · Apertura. Un titular y aire: lo demás ya tiene su propia escena. */}
      <section className="escena escena--alta">
        <Fondo nombre="01-nucleo-orbita" poster="01-nucleo-cero" />
        <div className="malla" aria-hidden="true" />
        <Geometria />
        <div className="centro">
          <p className="pt-antetitulo" data-revelar>
            <span className="pt-nuevo">{t.nuevo}</span>
            {t.ante}
            <span className="pt-version">v{VERSION}</span>
          </p>
          <h1 className="heroe pt-titular" data-revelar>
            {t.titular[0]}<br /><span>{t.titular[1]}</span>
          </h1>
          <p className="guia pt-promesa" data-revelar>
            {t.promesa[0]}<b>{t.promesa[1]}</b>{t.promesa[2]}
          </p>
          <div className="pt-acciones" data-revelar>
            <Link className="boton principal" to={`${raiz}/empezar`}>{t.empezar}</Link>
            <a className="boton" href={REPO} rel="noreferrer">{t.codigo}</a>
          </div>
        </div>
      </section>

      {/* 2 · La terminal, a tamaño real. Es la pieza más honesta de la página: las órdenes
          que salen ahí son las que se teclean, y se pueden copiar. */}
      <section className="escena pt-terminal">
        <Lamina nombre="04-malla-cian" lado="izquierda" alto="30rem" fuerza={.42} />
        <div className="centro" data-revelar>
          <Terminal />
        </div>
      </section>

      {/* 3 · Las cifras. El retraso va escrito aquí y no lo pone el observador: el escalonado
          debe seguir el orden de la fila, no el que estas tarjetas ocupen en la página. */}
      <section className="escena escena--panel">
        <Fondo nombre="04-pulso-electrico" poster="06-pulso-nocturno" tenue />
        <Lamina nombre="08-convergencia" lado="derecha" alto="26rem" fuerza={.38} />
        <div className="centro">
          <div className="pt-cifras">
            {t.cifras.map(([n, u, q], i) => (
              <div className="pt-cifra" key={q} data-revelar style={{ '--retraso': `${i * 90}ms` }}>
                <b>{n}<span>{u}</span></b>
                <em>{q}</em>
              </div>
            ))}
          </div>
          <p className="nota pt-nota" data-revelar>{t.nota}</p>
        </div>
      </section>

      {/* 4 · El argumento, con el diagrama que lo sostiene. */}
      <section className="escena">
        <Lamina nombre="09-vector-vertical" lado="izquierda" alto="32rem" fuerza={.34} />
        <div className="centro">
          <h2 className="rotulo" data-revelar>{t.promesa[1]}</h2>
          <figure className="pt-diagrama" data-revelar>
            <div className="pt-pilas">
              <Pila capas={['systemd', 'JVM', 'Tomcat 10', 'app.war']} ritmo={220}
                    orden="$ systemctl start tomcat" />
              <Pila capas={['JVM', 'app.jar']} orden="$ java -jar app.jar" hueco ritmo={90}
                    clase="pt-pila--cero" />
            </div>
            {/* Los dos dibujos van ocultos al lector de pantalla y el pie hace de alternativa
                textual: así la explicación la lee todo el mundo y no solo quien no ve. */}
            <figcaption className="guia pt-pie-figura">
              <code>java -jar</code>{t.promesa[3]}<code>web.xml</code>{t.promesa[4]}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 5 · Cierre. */}
      <section className="escena escena--panel pt-cierre">
        <Fondo nombre="05-umbral-lento" poster="10-umbral" tenue />
        <Geometria variante="sobria" />
        <div className="centro">
          <h2 className="rotulo" data-revelar>{t.empezar}</h2>
          <div data-revelar>
            <Orden>{INSTALAR}</Orden>
            <p className="guia pt-tras-orden">
              {t.windows[0]}<code>irm https://cero.ginit.dev/instalar.ps1 | iex</code>
              {t.windows[1]}<code>cero new mi-app</code>.
            </p>
            <div className="pt-acciones">
              <Link className="boton principal" to={`${raiz}/guia`}>{rotulo('/guia')}</Link>
              <Link className="boton" to={`${raiz}/descargas`}>{rotulo('/descargas')}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

/** Una pila de capas, de abajo arriba. Se levanta piso a piso al entrar en pantalla. */
function Pila({ capas, orden, hueco, clase, ritmo = 150 }) {
  const alto = 330
  const base = 240
  return (
    <svg className={clase ? `pt-pila ${clase}` : 'pt-pila'} viewBox={`0 0 260 ${alto}`}
         data-revelar aria-hidden="true">
      <line className="pt-cable" x1="130" y1={base + 46} x2="130"
            y2={base - (capas.length - 1) * 56} strokeWidth="1.5" />
      {hueco && (
        <rect className="hueco" x="20" y="72" width="220" height="102" rx="6"
              fill="none" strokeWidth="1.5" strokeDasharray="6 7" />
      )}
      {capas.map((nombre, i) => {
        const y = base - i * 56
        return (
          <g key={nombre} className="pt-piso" style={{ '--piso': `${i * ritmo}ms` }}>
            <rect x="20" y={y} width="220" height="46" rx="6" strokeWidth="1.5"
                  stroke="currentColor" fill="color-mix(in srgb, currentColor 8%, transparent)" />
            <text x="130" y={y + 28} fontSize="15" textAnchor="middle" fill="currentColor">
              {nombre}
            </text>
          </g>
        )
      })}
      <circle className="pt-pulso" cx="130" r="3.5" fill="currentColor"
              style={{ '--desde': `${base + 40}px`, '--hasta': `${base - (capas.length - 1) * 56}px` }} />
      <text className="orden" x="130" y="316" fontSize="13" textAnchor="middle">{orden}</text>
    </svg>
  )
}
