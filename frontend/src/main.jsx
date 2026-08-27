import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Marco from './Marco.jsx'
import Portada from './paginas/Portada.jsx'
import Descargas from './paginas/Descargas.jsx'
import Contenido from './paginas/Contenido.jsx'
import './estilo.css'

// El contenido se incrusta en el bundle con ?raw: son archivos nuestros, del repositorio,
// no algo que llegue por la red. Así una página no espera a una segunda petición para pintarse.
import empezar from './contenido/empezar.html?raw'
import guia from './contenido/guia.html?raw'
import modulos from './contenido/modulos.html?raw'
import referencia from './contenido/referencia.html?raw'

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <BrowserRouter>
      <Marco>
        <Routes>
          <Route path="/" element={<Portada />} />
          <Route path="/empezar" element={<Contenido titulo="Empezar" html={empezar} />} />
          <Route path="/guia" element={<Contenido titulo="Guía" html={guia} />} />
          <Route path="/modulos" element={<Contenido titulo="Módulos" html={modulos} />} />
          <Route path="/referencia" element={<Contenido titulo="Referencia" html={referencia} />} />
          <Route path="/descargas" element={<Descargas />} />
          <Route path="*" element={<Contenido titulo="No encontrada" html={
            '<h1 class="titulo-pagina">No encontrada</h1><p class="entradilla">Esa página no existe. Prueba desde <a href="/">el inicio</a>.</p>'
          } />} />
        </Routes>
      </Marco>
    </BrowserRouter>
  </StrictMode>,
)
