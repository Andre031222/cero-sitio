import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Marco from './Marco.jsx'
import Portada from './paginas/Portada.jsx'
import Descargas from './paginas/Descargas.jsx'
import Contenido from './paginas/Contenido.jsx'
import './estilo.css'

// El contenido se incrusta en el bundle con ?raw: son archivos nuestros, del repositorio, no
// algo que llegue por la red. Así una página no espera a una segunda petición para pintarse.
import empezar from './contenido/empezar.html?raw'
import guia from './contenido/guia.html?raw'
import modulos from './contenido/modulos.html?raw'
import referencia from './contenido/referencia.html?raw'
import empezarEn from './contenido/en/empezar.html?raw'
import guiaEn from './contenido/en/guia.html?raw'
import modulosEn from './contenido/en/modulos.html?raw'
import referenciaEn from './contenido/en/referencia.html?raw'

// Los nombres de ruta no se traducen: /en/guia y no /en/guide. Así cada página y su pareja se
// corresponden con una sustitución, sin tabla de equivalencias que se desincronice.
const PAGINAS = [
  ['empezar', { es: [empezar, 'Empezar'], en: [empezarEn, 'Get started'] }],
  ['guia', { es: [guia, 'Guía'], en: [guiaEn, 'Guide'] }],
  ['modulos', { es: [modulos, 'Módulos'], en: [modulosEn, 'Modules'] }],
  ['referencia', { es: [referencia, 'Referencia'], en: [referenciaEn, 'Reference'] }],
]

const noEncontrada = (idioma) => {
  const t = idioma === 'en'
    ? ['Not found', 'That page does not exist. Try from', 'the home page', '/en']
    : ['No encontrada', 'Esa página no existe. Prueba desde', 'el inicio', '/']
  return `<h1 class="titulo-pagina">${t[0]}</h1><p class="entradilla">${t[1]} <a href="${t[3]}">${t[2]}</a>.</p>`
}

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <BrowserRouter>
      <Marco>
        <Routes>
          <Route path="/" element={<Portada />} />
          <Route path="/descargas" element={<Descargas />} />
          <Route path="/en" element={<Portada />} />
          <Route path="/en/descargas" element={<Descargas />} />
          {PAGINAS.map(([ruta, v]) => (
            <Route key={ruta} path={`/${ruta}`}
                   element={<Contenido titulo={v.es[1]} html={v.es[0]} />} />
          ))}
          {PAGINAS.map(([ruta, v]) => (
            <Route key={`en-${ruta}`} path={`/en/${ruta}`}
                   element={<Contenido titulo={v.en[1]} html={v.en[0]} />} />
          ))}
          <Route path="/en/*" element={<Contenido titulo="Not found" html={noEncontrada('en')} />} />
          <Route path="*" element={<Contenido titulo="No encontrada" html={noEncontrada('es')} />} />
        </Routes>
      </Marco>
    </BrowserRouter>
  </StrictMode>,
)
