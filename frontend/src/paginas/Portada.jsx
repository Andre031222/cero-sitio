import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Orden from '../Orden.jsx'
import Terminal from '../Terminal.jsx'
import { idiomaDe, TEXTOS, raizDe } from '../idioma.js'

export default function Portada() {
  const { pathname } = useLocation()
  const idioma = idiomaDe(pathname)
  const t = TEXTOS[idioma].portada
  const raiz = raizDe(idioma)

  useEffect(() => {
    document.title = idioma === 'en'
      ? 'Corvo — web framework for Java'
      : 'Corvo — framework web para Java'
  }, [idioma])

  return (
    <section className="portada">
      {/* El bloque de la propuesta va envuelto para que en pantallas anchas sea UNA celda del
          grid, con la terminal al lado. Sin envolver, cada párrafo sería su propia fila y la
          altura de la terminal las estiraría todas. */}
      <div className="propuesta">
        <p className="antetitulo">
          <span className="nuevo">{t.nuevo}</span>
          {t.ante}
          <span className="desde">v0.4.0</span>
        </p>

        <h1 className="titular">{t.titular[0]}<br /><span>{t.titular[1]}</span></h1>

        <p className="promesa">
          {t.promesa[0]}<b>{t.promesa[1]}</b>{t.promesa[2]}
          <code>java -jar</code>{t.promesa[3]}<code>web.xml</code>{t.promesa[4]}
        </p>

        <div className="botones">
          <Link className="boton principal" to={`${raiz}/empezar`}>{t.empezar}</Link>
          <a className="boton" href="https://github.com/Andre031222/Corvo">{t.codigo}</a>
        </div>
      </div>

      <Orden>curl -fsSL https://corvo.ginit.dev/instalar | sh</Orden>
      <p className="tras-orden">
        {t.windows[0]}<code>irm https://corvo.ginit.dev/instalar.ps1 | iex</code>
        {t.windows[1]}<code>corvo new mi-app</code>.
      </p>

      <Terminal />

      <div className="cifras">
        {t.cifras.map(([n, u, q]) => (
          <div className="cifra" key={q}><b>{n}</b><span>{u}</span><em>{q}</em></div>
        ))}
      </div>

      <p className="nota">{t.nota}</p>
    </section>
  )
}
