import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Marco from './Marco.jsx'
import Portada from './paginas/Portada.jsx'
import Descargas from './paginas/Descargas.jsx'
import Contenido from './paginas/Contenido.jsx'
import './diseno.css'
import './comun.css'
import './marco.css'
import './portada.css'
import './producto.css'
import './documento.css'
import './piezas.css'
import './flujo.css'
import './sistemas.css'

// El contenido se pide al entrar en su ruta, no se incrusta: son 324 kB de documentación y
// quien solo abre la portada no tiene por qué descargarlos.
const CONTENIDO = {
  'empezar:es': () => import('./contenido/empezar.html?raw'),
  'empezar:en': () => import('./contenido/en/empezar.html?raw'),
  'guia:es': () => import('./contenido/guia.html?raw'),
  'guia:en': () => import('./contenido/en/guia.html?raw'),
  'modulos:es': () => import('./contenido/modulos.html?raw'),
  'modulos:en': () => import('./contenido/en/modulos.html?raw'),
  'referencia:es': () => import('./contenido/referencia.html?raw'),
  'referencia:en': () => import('./contenido/en/referencia.html?raw'),
  'acerca:es': () => import('./contenido/acerca.html?raw'),
  'acerca:en': () => import('./contenido/en/acerca.html?raw'),
}

// Los nombres de ruta no se traducen: /en/guia y no /en/guide. Así cada página y su pareja se
// corresponden con una sustitución, sin tabla de equivalencias que se desincronice.
const PAGINAS = [
  ['empezar', { es: 'Empezar', en: 'Get started' }],
  ['guia', { es: 'Guía', en: 'Guide' }],
  ['modulos', { es: 'Módulos', en: 'Modules' }],
  ['referencia', { es: 'Referencia', en: 'Reference' }],
  ['acerca', { es: 'Acerca de', en: 'About' }],
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
                   element={<Contenido titulo={v.es} pide={CONTENIDO[`${ruta}:es`]} />} />
          ))}
          {PAGINAS.map(([ruta, v]) => (
            <Route key={`en-${ruta}`} path={`/en/${ruta}`}
                   element={<Contenido titulo={v.en} pide={CONTENIDO[`${ruta}:en`]} />} />
          ))}
          <Route path="/en/*" element={<Contenido titulo="Not found" html={noEncontrada('en')} />} />
          <Route path="*" element={<Contenido titulo="No encontrada" html={noEncontrada('es')} />} />
        </Routes>
      </Marco>
    </BrowserRouter>
  </StrictMode>,
)
