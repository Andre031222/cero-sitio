import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { idiomaDe, TEXTOS } from '../idioma.js'
import useRevelar from '../revelar.js'
import Orden from '../Orden.jsx'
import Lamina from '../Lamina.jsx'
import Fondo from '../Fondo.jsx'
import Sistemas from '../Sistemas.jsx'
import { VERSION, VERSION_CENTRAL } from '../version.js'
import '../producto.css'

const INSTALAR = 'curl -fsSL https://cero.ginit.dev/instalar | sh'

const POM = `<dependency>
  <groupId>dev.ginit.cero</groupId>
  <artifactId>cero-core</artifactId>
  <version>${VERSION_CENTRAL}</version>
</dependency>`

/** Elegir módulos y ver qué te llevas. */
export default function Descargas() {
  const { pathname } = useLocation()
  const t = TEXTOS[idiomaDe(pathname)].descargas
  const [catalogo, setCatalogo] = useState([])
  const [elegidos, setElegidos] = useState(new Set())
  const [resultado, setResultado] = useState(null)
  const [fallo, setFallo] = useState(null)
  const [copiado, setCopiado] = useState(false)

  // El revelado se rearma cuando cambia lo que hay pintado: el catálogo y el resumen llegan por
  // red, y sus nodos no existen en el primer montaje.
  useRevelar(`${pathname}|${catalogo.length}|${resultado?.resueltos.length ?? -1}`)

  useEffect(() => {
    fetch('/api/modulos')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setCatalogo)
      .catch((e) => setFallo(`${t.falloCatalogo}: ${e.message}`))
  }, [])

  useEffect(() => {
    if (elegidos.size === 0) { setResultado(null); return }
    let cancelado = false
    fetch('/api/seleccion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modulos: [...elegidos] }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => { if (!cancelado) { setResultado(d); setFallo(null) } })
      .catch((e) => { if (!cancelado) setFallo(`${t.falloResolver}: ${e.message}`) })
    return () => { cancelado = true }
  }, [elegidos])

  const alternar = (nombre) => {
    setElegidos((antes) => {
      const s = new Set(antes)
      s.has(nombre) ? s.delete(nombre) : s.add(nombre)
      return s
    })
    setCopiado(false)
  }

  const copiar = async () => {
    if (!resultado?.pom) return
    try {
      await navigator.clipboard.writeText(resultado.pom)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1600)
    } catch {
      // Si el navegador no deja copiar, el bloque sigue ahí para seleccionarlo a mano.
    }
  }

  const arrastrado = (n) => resultado?.arrastrados?.includes(n)

  return (
    <div className="producto descargas">

      <section className="escena escena--apretada">
        <div className="centro">
          <h1 className="heroe" data-revelar>{t.titulo}</h1>
          <p className="guia sub" data-revelar>
{t.entrada[0]}<code>pom.xml</code>{t.entrada[1]}
          </p>
          {fallo && <p className="fallo sub" role="alert">{fallo}</p>}
        </div>
      </section>

      <section className="escena escena--panel">
        <Fondo nombre="02-prisma-recorrido" poster="02-prisma-horizonte" tenue />
        <Lamina nombre="10-umbral" lado="derecha" alto="24rem" fuerza={.36} />
        <div className="centro">
          <h2 className="rotulo" data-revelar>{t.instalar}</h2>
          <p className="guia sub" data-revelar>{t.instalarGuia}</p>
          <Sistemas textos={t} />
        </div>
      </section>

      <section className="escena">
        <Lamina nombre="02-prisma-horizonte" lado="izquierda" alto="22rem" fuerza={.32} />
        <div className="centro centro--medio">
          <h2 className="rotulo" data-revelar>{t.coordenadas}</h2>
          <p className="guia sub" data-revelar>{t.coordenadasGuia}</p>
          <div className="codigo" data-revelar>
            <div className="barra-codigo"><span>pom.xml</span></div>
            <pre>{POM}</pre>
          </div>
          {VERSION_CENTRAL !== VERSION && (
            <p className="nota" data-revelar>
              {t.coordenadasCentral[0]}<b>{VERSION_CENTRAL}</b>{t.coordenadasCentral[1]}
              <b>{VERSION}</b>{t.coordenadasCentral[2]}
            </p>
          )}
        </div>
      </section>

      {/* Quien llega no piensa en módulos, piensa en lo que quiere construir. Los atajos
          traducen esa intención a una selección, que luego se puede afinar a mano. */}
      <section className="escena escena--panel">
        <div className="centro">
          <h2 className="rotulo" data-revelar>{t.atajos}</h2>

          <div className="atajos" data-revelar>
            <div className="fichas">
              {t.escenarios.map(([nombre, modulos]) => {
                const activo = modulos.every((m) => elegidos.has(m))
                  && [...elegidos].every((m) => modulos.includes(m))
                return (
                  <button key={nombre} type="button"
                          className={`atajo${activo ? ' activo' : ''}`}
                          onClick={() => { setElegidos(new Set(modulos)); setCopiado(false) }}>
                    {nombre}
                  </button>
                )
              })}
              <button type="button" className="atajo todo"
                      onClick={() => { setElegidos(new Set(catalogo.map((m) => m.nombre))); setCopiado(false) }}>
                {t.bajarTodo}
              </button>
              {elegidos.size > 0 && (
                <button type="button" className="atajo vaciar"
                        onClick={() => { setElegidos(new Set()); setCopiado(false) }}>
                  {t.limpiar}
                </button>
              )}
            </div>
          </div>

          <div className="rejilla" data-revelar>
            {catalogo.map((m) => {
              const marcado = elegidos.has(m.nombre)
              return (
                <label
                  key={m.nombre}
                  className={`modulo${marcado ? ' marcado' : ''}${arrastrado(m.nombre) ? ' arrastrado' : ''}`
                    + (['cero-core', 'cero-http'].includes(m.nombre) ? ' habitual' : '')}
                >
                  <input type="checkbox" checked={marcado} onChange={() => alternar(m.nombre)} />
                  <div>
                    <div className="cabeza">
                      <span className="mono">{m.nombre}</span>
                      <span className="peso">{m.kb} KB</span>
                    </div>
                    <p>{m.hace}</p>
                    {m.necesita && <p className="necesita">{t.necesita} {m.necesita}</p>}
                    {arrastrado(m.nombre) && !marcado && (
                      <p className="aviso">{t.incluido}</p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>

          {!resultado && !fallo && (
            <p className="nota sub" data-revelar>{t.marcaAlgo}</p>
          )}
        </div>
      </section>

      {resultado && (
        <>
          <section className="escena">
            <div className="centro">
              <div className="resumen">
                <div className="total" data-revelar>
                  <div><b>{resultado.kb}</b><span>KB</span><em>{t.enTotal}</em></div>
                  <div><b>{resultado.clases}</b><span></span><em>{t.clases}</em></div>
                  <div><b>{resultado.resueltos.length}</b><span></span><em>{t.modulos}</em></div>
                </div>

                {resultado.arrastrados.length > 0 && (
                  <p className="nota sub" data-revelar>
{t.seAnaden[0]}<b>{resultado.arrastrados.join(', ')}</b>{t.seAnaden[1]}
                  </p>
                )}

                {/* El botón va antes del pom: */}
                <div className="bajar" data-revelar>
                  <a className="boton principal"
                     href={`/api/zip?modulos=${[...elegidos].join(',')}`}
                     download>
                    {t.bajarZip}
                    <span className="detalle">
                      {t.pesoZip[0]}{resultado.resueltos.length}{t.pesoZip[1]} · {resultado.kb} KB
                    </span>
                  </a>
                  {/* Un jar de biblioteca descargado suelto invita a probar `java -jar`, que falla con «no main manifest… */}
                  <p className="que-son">
                    <b>{t.queSon[0]}</b>{t.queSon[1]}<code>java -jar</code>{t.queSon[2]}
                    <code>pom.xml</code>{t.queSon[3]}<code>cero-launcher</code>{t.queSon[4]}
                  </p>

                  <ul className="sueltos">
                    {resultado.resueltos.map((n) => (
                      <li key={n}>
                        <a href={`/api/jar?modulo=${n}`} download>
                          <span className="mono">{n}</span>
                          <span className="peso">{t.bajarUno}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Las coordenadas van en su propia escena: es lo que se copia y se pega en otro
              sitio, no algo que se lea de pasada. */}
          <section className="escena escena--panel">
            <div className="centro centro--medio">
              <div className="codigo" data-revelar>
                <div className="barra-codigo">
                  <span>pom.xml</span>
                  <button type="button" onClick={copiar}>{copiado ? t.copiado : t.copiar}</button>
                </div>
                <pre>{resultado.pom}</pre>
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  )
}
