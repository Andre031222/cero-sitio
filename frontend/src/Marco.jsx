import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Tema from './Tema.jsx'
import { idiomaDe, parejaDe, TEXTOS, raizDe } from './idioma.js'
import './marco.css'

const subirDelTodo = (e) => {
  e.preventDefault()
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' })
}

/** La barra y el pie, en el idioma que toque según la ruta. */
export default function Marco({ children }) {
  const { pathname } = useLocation()
  const idioma = idiomaDe(pathname)
  const t = TEXTOS[idioma]
  const raiz = raizDe(idioma)
  const pareja = parejaDe(pathname)
  const enPortada = pathname === '/' || pathname === '/en'
  const [posada, setPosada] = useState(false)

  // El lang del documento y las etiquetas hreflang no son adorno: son lo que hace que un
  // buscador ofrezca la versión correcta y que un lector de pantalla pronuncie bien.
  useEffect(() => {
    document.documentElement.lang = t.lang
    const base = 'https://cero.ginit.dev'
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

  // La barra solo se vela cuando hay algo que velar debajo.
  useEffect(() => {
    const mirar = () => setPosada(window.scrollY > 8)
    mirar()
    window.addEventListener('scroll', mirar, { passive: true })
    return () => window.removeEventListener('scroll', mirar)
  }, [])

  return (
    <>
      <header className={posada ? 'barra-sitio posada' : 'barra-sitio'}>
        <div className="centro barra-caja">
          <Link to={raiz || '/'} className="marca">
            <span className="simbolo" aria-hidden="true" />
            {/* «Ce» en azul y «ro» en tinta, como manda el kit. */}
            <span className="palabra"><i>Ce</i>ro</span>
          </Link>
          <nav className="barra-menu">
            {t.menu.map(([sufijo, texto]) => {
              const a = `${raiz}${sufijo}` || '/'
              const aqui = pathname === a
              return (
                <Link key={a} to={a} className={aqui ? 'activo' : undefined}
                      aria-current={aqui ? 'page' : undefined}
                      onClick={aqui ? subirDelTodo : undefined}>{texto}</Link>
              )
            })}
          </nav>
          <div className="mandos">
            {/* Icono más código, y no solo el icono. */}
            <Link className="idioma" to={pareja} hrefLang={idioma === 'es' ? 'en' : 'es'}
                  lang={idioma === 'es' ? 'en' : 'es'} title={t.otroTitulo}
                  aria-label={t.otroTitulo}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
                   strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" />
              </svg>
              <span className="codigo" aria-hidden="true">{t.otroCodigo}</span>
            </Link>
            <Tema />
          </div>
        </div>
      </header>

      <main className={enPortada ? 'lienzo' : 'marco'}>{children}</main>

      <footer className="pie-sitio">
        <div className="centro">
          <div className="pie-caja">
            <p className="pie-firma">
              <b>Richar Andre Vilca-Solorzano · Ramiro Pedro Laura-Murillo</b>
              {t.sede}
            </p>
            {/* Los enlaces del pie no van en otro <nav>: dos landmarks de navegación sin nada
                que los distinga estorban al navegar por landmarks más de lo que ayudan. */}
            <div className="pie-menu">
              {t.menu.map(([sufijo, texto]) => {
                const a = `${raiz}${sufijo}` || '/'
                return <Link key={a} to={a}>{texto}</Link>
              })}
            </div>
          </div>
          <p className="pie-legal">
            <span>{t.licencia}</span>
            <span>{t.servido}</span>
          </p>
        </div>
      </footer>
    </>
  )
}
