import { Link } from 'react-router-dom'
import Orden from '../Orden.jsx'

export default function Portada() {
  return (
    <section className="portada">
      <span className="cuervo" aria-hidden="true" />
      <p className="antetitulo">
        <span className="nuevo">Nuevo</span>
        Framework web para Java
        <span className="desde">v0.4.0</span>
      </p>

      <h1 className="titular">Sin<br /><span>contenedor.</span></h1>

      <p className="promesa">
        Un servidor HTTP propio, un hilo virtual por conexión y <b>cero dependencias</b>.
        <code>java -jar</code> y está corriendo — sin Tomcat, sin <code>web.xml</code>,
        sin despliegue.
      </p>

      <div className="botones">
        <Link className="boton principal" to="/descargas">Empezar</Link>
        <a className="boton" href="https://github.com/Andre031222/Corvo">Código</a>
      </div>

      <Orden>curl -fsSL https://corvo.ginit.dev/instalar | sh</Orden>
      <p className="tras-orden">
        En Windows, <code>irm https://corvo.ginit.dev/instalar.ps1 | iex</code>.
        Requiere Maven y un JDK 21. Después: <code>corvo new mi-app</code>.
      </p>

      <div className="cifras">
        {[['308', 'KB', 'Desplegado'],
          ['106', 'ms', 'Arranque'],
          ['0', 'deps', 'En ejecución'],
          ['1258', '', 'Pruebas']].map(([n, u, q]) => (
          <div className="cifra" key={q}>
            <b>{n}</b><span>{u}</span><em>{q}</em>
          </div>
        ))}
      </div>

      <p className="nota">
        Esta página la sirve el propio Corvo: la API en Java y el front en React, dentro
        del mismo jar. Si el framework falla, falla aquí antes que en las aplicaciones de nadie.
      </p>
    </section>
  )
}
