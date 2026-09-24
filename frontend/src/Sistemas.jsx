import { useEffect, useState } from 'react'

/** Los logos son archivos libres (Simple Icons CC0, Bootstrap Icons MIT); ver public/plataformas.
 *  Se pintan con máscara para que tomen el color del tema: dos de los tres no usan currentColor. */
function Marca({ clave }) {
  const archivo = clave === 'mac' ? 'macos' : clave === 'win' ? 'windows' : 'linux'
  return <span className="sis-logo" style={{ '--logo': `url("/plataformas/${archivo}.svg")` }} />
}

/** Detecta el sistema del visitante. `userAgentData` cuando está; si no, el agente de siempre. */
function sistemaDelVisitante() {
  const plataforma = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || ''
  const texto = plataforma.toLowerCase()
  if (texto.includes('win')) return 'win'
  if (texto.includes('mac') || texto.includes('iphone') || texto.includes('ipad')) return 'mac'
  if (texto.includes('linux') || texto.includes('android') || texto.includes('x11')) return 'linux'
  return null
}

export default function Sistemas({ textos }) {
  const [elegido, setElegido] = useState(textos.sistemas[0].clave)
  const [copiado, setCopiado] = useState(false)
  const [detectado, setDetectado] = useState(null)

  useEffect(() => {
    const suyo = sistemaDelVisitante()
    if (!suyo) return
    setDetectado(suyo)
    if (textos.sistemas.some((s) => s.clave === suyo)) setElegido(suyo)
  }, [textos])

  const activo = textos.sistemas.find((s) => s.clave === elegido) ?? textos.sistemas[0]

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(activo.orden)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1600)
    } catch {
      // Sin portapapeles el bloque sigue ahí para seleccionarlo a mano.
    }
  }

  return (
    <div className="sis" data-revelar>
      <div className="sis-pestanas" role="tablist" aria-label={textos.instalar}>
        {textos.sistemas.map((s) => (
          <button key={s.clave} type="button" role="tab"
                  id={`sis-${s.clave}`} aria-controls="sis-panel"
                  aria-selected={s.clave === elegido}
                  className={s.clave === elegido ? 'sis-pestana activa' : 'sis-pestana'}
                  onClick={() => { setElegido(s.clave); setCopiado(false) }}>
            <span className="sis-glifo"><Marca clave={s.clave} /></span>
            <span className="sis-nombre">{s.nombre}</span>
            {s.clave === detectado && <span className="sis-tuyo">{textos.elTuyo}</span>}
          </button>
        ))}
      </div>

      <div className="sis-panel" id="sis-panel" role="tabpanel" aria-labelledby={`sis-${activo.clave}`}>
        <p className="sis-detalle">{activo.detalle}</p>
        <div className="sis-orden">
          <code>{activo.orden}</code>
          <button type="button" onClick={copiar}>{copiado ? textos.copiado : textos.copiar}</button>
        </div>
      </div>
    </div>
  )
}
