import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Orden from '../Orden.jsx'
import Terminal from '../Terminal.jsx'
import Geometria from '../Geometria.jsx'
import Lamina from '../Lamina.jsx'
import Fondo from '../Fondo.jsx'
import Flujo from '../Flujo.jsx'
import Fisica from '../Fisica.jsx'
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
        <Fisica />
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
        <Lamina nombre="geometria-cian-01" lado="izquierda" alto="34rem" fuerza={.46} />
        <div className="centro">
          <h2 className="rotulo" data-revelar>{t.promesa[1]}</h2>
          <figure className="pt-diagrama" data-revelar>
            <div className="pt-recorridos">
              <Flujo clase="fl--pesada" ritmo={190}
                     rotulo={t.flujoPesado[0]} resumen={t.flujoPesado[1]}
                     pasos={[
                       { icono: 'codigo',    texto: t.flujoPesado[2] },
                       { icono: 'paquete',   texto: t.flujoPesado[3], orden: 'app.war' },
                       { icono: 'servidor',  texto: t.flujoPesado[4] },
                       { icono: 'ajuste',    texto: t.flujoPesado[5], orden: 'web.xml' },
                       { icono: 'subir',     texto: t.flujoPesado[6] },
                       { icono: 'reiniciar', texto: t.flujoPesado[7], orden: 'systemctl restart' },
                       { icono: 'listo',     texto: t.flujoPesado[8] },
                     ]} />
              <Flujo clase="fl--cero" ritmo={120}
                     rotulo={t.flujoCero[0]} resumen={t.flujoCero[1]}
                     pasos={[
                       { icono: 'codigo',  texto: t.flujoCero[2] },
                       { icono: 'paquete', texto: t.flujoCero[3], orden: 'app.jar' },
                       { icono: 'listo',   texto: t.flujoCero[4], orden: 'java -jar app.jar' },
                     ]} />
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
function Pila({ capas, orden, hueco, clase, ritmo = 150, rotulo, peso }) {
  const base = 250
  const cima = base - (capas.length - 1) * 58
  return (
    <figure className={clase ? `pt-pila ${clase}` : 'pt-pila'} data-revelar>
      <figcaption className="pt-pila-rotulo">
        <span className="pt-pila-nombre">{rotulo}</span>
        <span className="pt-pila-peso">{peso}</span>
      </figcaption>

      <svg viewBox={`0 0 280 ${base + 100}`} aria-hidden="true">
        <defs>
          <linearGradient id={`brillo-${clase || 'base'}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="currentColor" stopOpacity=".22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity=".04" />
          </linearGradient>
        </defs>

        <line className="pt-cable" x1="140" y1={base + 48} x2="140" y2={cima} strokeWidth="1.5" />

        {hueco && (
          <g className="pt-hueco-grupo">
            <rect className="hueco" x="24" y={cima - 122} width="232" height="106" rx="10"
                  fill="none" strokeWidth="1.5" strokeDasharray="7 8" />
            <text className="pt-hueco-texto" x="140" y={cima - 63} fontSize="13" textAnchor="middle">
              nada más
            </text>
          </g>
        )}

        {capas.map((nombre, i) => {
          const y = base - i * 58
          return (
            <g key={nombre} className="pt-piso" style={{ '--piso': `${i * ritmo}ms` }}>
              <rect x="24" y={y} width="232" height="48" rx="10" strokeWidth="1.5"
                    stroke="currentColor" fill={`url(#brillo-${clase || 'base'})`} />
              <text x="140" y={y + 30} fontSize="16" textAnchor="middle" fill="currentColor">
                {nombre}
              </text>
            </g>
          )
        })}

        <circle className="pt-pulso" cx="140" r="4" fill="currentColor"
                style={{ '--desde': `${base + 42}px`, '--hasta': `${cima}px` }} />
      </svg>

      <code className="pt-pila-orden">{orden}</code>
    </figure>
  )
}
