import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Portada from './paginas/Portada.jsx'
import Descargas from './paginas/Descargas.jsx'
import Marco from './Marco.jsx'
import './estilo.css'

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <BrowserRouter>
      <Marco>
        <Routes>
          <Route path="/" element={<Portada />} />
          <Route path="/descargas" element={<Descargas />} />
        </Routes>
      </Marco>
    </BrowserRouter>
  </StrictMode>,
)
