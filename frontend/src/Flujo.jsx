const ICONOS = {
  codigo: 'M9 18 3 12l6-6M15 6l6 6-6 6',
  paquete: 'M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8',
  servidor: 'M4 5h16v5H4zM4 14h16v5H4zM8 7.5h.01M8 16.5h.01',
  ajuste: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.9 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 13.9H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z',
  subir: 'M12 19V5M5 12l7-7 7 7',
  reiniciar: 'M21 12a9 9 0 1 1-3-6.7M21 4v5h-5',
  listo: 'M20 6 9 17l-5-5',
}

function Icono({ nombre }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONOS[nombre]} />
    </svg>
  )
}

/** Un recorrido de pasos con flechas. Cada paso entra detrás del anterior. */
export default function Flujo({ pasos, rotulo, resumen, clase, ritmo = 170 }) {
  return (
    <figure className={clase ? `fl ${clase}` : 'fl'} data-revelar>
      <figcaption className="fl-rotulo">
        <span className="fl-nombre">{rotulo}</span>
        <span className="fl-resumen">{resumen}</span>
      </figcaption>

      <ol className="fl-pasos">
        {pasos.map((paso, i) => (
          <li key={paso.texto} className="fl-paso" style={{ '--paso': `${i * ritmo}ms` }}>
            <span className="fl-caja"><Icono nombre={paso.icono} /></span>
            <span className="fl-texto">{paso.texto}</span>
            {paso.orden && <code className="fl-orden">{paso.orden}</code>}
          </li>
        ))}
      </ol>
    </figure>
  )
}
