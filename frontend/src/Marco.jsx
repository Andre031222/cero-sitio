import { Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Tema from './Tema.jsx'
import { idiomaDe, parejaDe, TEXTOS, raizDe } from './idioma.js'

/** La barra y el pie, en el idioma que toque según la ruta. */
export default function Marco({ children }) {
  const { pathname } = useLocation()
  const idioma = idiomaDe(pathname)
  const t = TEXTOS[idioma]
  const raiz = raizDe(idioma)
  const pareja = parejaDe(pathname)

  // El lang del documento y las etiquetas hreflang no son adorno: son lo que hace que un
  // buscador ofrezca la versión correcta y que un lector de pantalla pronuncie bien.
  useEffect(() => {
    document.documentElement.lang = t.lang
    const base = 'https://corvo.ginit.dev'
    const rutaEs = idioma === 'es' ? pathname : pareja
    const rutaEn = idioma === 'en' ? pathname : pareja
    const puestos = [['es', rutaEs], ['en', rutaEn], ['x-default', rutaEs]]
    document.querySelectorAll('link[rel="alternate"][data-i18n]').forEach((e) => e.remove())
    for (const [lang, ruta] of puestos) {
      const l = document.createElement('link')
      l.rel = 'alternate'; l.hreflang = lang; l.href = base + ruta
      l.dataset.i18n = '1'
      document.head.appendChild(l)
    }
  }, [pathname, idioma, pareja, t.lang])

  return (
    <>
      <header className="barra">
        <div className="marco">
          <Link to={raiz || '/'} className="marca">
            <span className="logo" aria-hidden="true" />
            <span className="palabra">Corvo</span>
          </Link>
          <nav>
            {t.menu.map(([sufijo, texto]) => {
              const a = `${raiz}${sufijo}` || '/'
              return (
                <Link key={a} to={a} className={pathname === a ? 'activo' : undefined}>{texto}</Link>
              )
            })}
          </nav>
          <div className="mandos">
            <Link className="idioma" to={pareja} hrefLang={idioma === 'es' ? 'en' : 'es'}
                  lang={idioma === 'es' ? 'en' : 'es'} title={t.otroTitulo}>
              {t.otro}
            </Link>
            <Tema />
          </div>
        </div>
      </header>

      <main className="marco">{children}</main>

      <footer className="pie marco">
        <div>
          Richar Andre Vilca-Solorzano · Ramiro Pedro Laura-Murillo<br />
          {t.sede}
        </div>
        <div style={{ textAlign: 'right' }}>
          {t.licencia}<br />
          {t.servido}
        </div>
      </footer>
    </>
  )
}
