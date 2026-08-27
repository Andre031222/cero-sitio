import { Link, useLocation } from 'react-router-dom'
import Tema from './Tema.jsx'

/** La barra y el pie, que no cambian entre páginas. */
export default function Marco({ children }) {
  const { pathname } = useLocation()
  const enlace = (a, texto) => (
    <Link to={a} className={pathname === a ? 'activo' : undefined}>{texto}</Link>
  )

  return (
    <>
      <header className="barra">
        <div className="marco">
          <Link to="/" className="marca">
            {/* El logo va aquí en cuanto llegue el archivo. */}
            <span className="logo" aria-hidden="true" />
            <span className="palabra">Corvo</span>
          </Link>
          <nav>
            {enlace('/', 'Inicio')}
            {enlace('/descargas', 'Descargas')}
          </nav>
          <Tema />
        </div>
      </header>

      <main className="marco">{children}</main>

      <footer className="pie marco">
        <div>
          Richar Andre Vilca-Solorzano · Ramiro Pedro Laura-Murillo<br />
          Universidad Nacional del Altiplano · Puno, Perú
        </div>
        <div style={{ textAlign: 'right' }}>
          Corvo 0.4.0 · Licencia MIT<br />
          Servido por Corvo, sin contenedor
        </div>
      </footer>
    </>
  )
}
