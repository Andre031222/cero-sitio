import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { idiomaDe, TEXTOS } from '../idioma.js'

/**
 * Elegir módulos y ver qué te llevas.
 *
 * Quien llega aquí no pregunta «qué módulos hay» sino «qué necesito y cuánto pesa». Por eso las
 * dependencias las resuelve el servidor —que es quien conoce el grafo de verdad— y la página
 * enseña lo que se arrastra sin pedirlo, que es la parte que sorprende.
 */
export default function Descargas() {
  const { pathname } = useLocation()
  const t = TEXTOS[idiomaDe(pathname)].descargas
  const [catalogo, setCatalogo] = useState([])
  const [elegidos, setElegidos] = useState(new Set())
  const [resultado, setResultado] = useState(null)
  const [fallo, setFallo] = useState(null)
  const [copiado, setCopiado] = useState(false)

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
    <section className="descargas">
      <h1 className="titulo-pagina">{t.titulo}</h1>
      <p className="entradilla">
{t.entrada[0]}<code>pom.xml</code>{t.entrada[1]}
      </p>

      {fallo && <p className="fallo" role="alert">{fallo}</p>}

      {/* Quien llega no piensa en módulos, piensa en lo que quiere construir. Los atajos
          traducen esa intención a una selección, que luego se puede afinar a mano. */}
      <div className="atajos">
        <span className="etiqueta">{t.atajos}</span>
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
          {elegidos.size > 0 && (
            <button type="button" className="atajo vaciar"
                    onClick={() => { setElegidos(new Set()); setCopiado(false) }}>
              {t.limpiar}
            </button>
          )}
        </div>
      </div>

      <div className="rejilla">
        {catalogo.map((m) => {
          const marcado = elegidos.has(m.nombre)
          return (
            <label
              key={m.nombre}
              className={`modulo${marcado ? ' marcado' : ''}${arrastrado(m.nombre) ? ' arrastrado' : ''}`
                + (['corvo-core', 'corvo-http'].includes(m.nombre) ? ' habitual' : '')}
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

      {resultado && (
        <div className="resumen">
          <div className="total">
            <div><b>{resultado.kb}</b><span>KB</span><em>{t.enTotal}</em></div>
            <div><b>{resultado.clases}</b><span></span><em>{t.clases}</em></div>
            <div><b>{resultado.resueltos.length}</b><span></span><em>{t.modulos}</em></div>
          </div>

          {resultado.arrastrados.length > 0 && (
            <p className="nota">
{t.seAnaden[0]}<b>{resultado.arrastrados.join(', ')}</b>{t.seAnaden[1]}
            </p>
          )}

          <div className="codigo">
            <div className="barra-codigo">
              <span>pom.xml</span>
              <button type="button" onClick={copiar}>{copiado ? t.copiado : t.copiar}</button>
            </div>
            <pre>{resultado.pom}</pre>
          </div>
        </div>
      )}

      {!resultado && !fallo && (
        <p className="nota">{t.marcaAlgo}</p>
      )}
    </section>
  )
}
