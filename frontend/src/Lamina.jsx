const LAMINAS = [
  '01-nucleo-cero', '02-prisma-horizonte', '03-orbita-azul', '04-malla-cian', '05-faceta-ambar',
  '06-pulso-nocturno', '07-monolito', '08-convergencia', '09-vector-vertical', '10-umbral',
]

const WEBP = new Set(['geometria-cian-01'])

/** Lámina del catálogo en la banda lateral. Decorativa: se funde con máscara y no lleva información. */
export default function Lamina({ nombre, lado = 'derecha', alto = '34rem', fuerza = .5 }) {
  const pieza = LAMINAS.includes(nombre) || WEBP.has(nombre) ? nombre : LAMINAS[0]
  const ext = WEBP.has(pieza) ? 'webp' : 'svg'
  return (
    <span
      className={`lamina lamina--${lado}`}
      aria-hidden="true"
      data-revelar
      style={{
        '--alto': alto,
        '--fuerza': fuerza,
        backgroundImage: `url("/catalogo/imagenes/${pieza}.${ext}")`,
      }}
    />
  )
}
