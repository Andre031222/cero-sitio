import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El build va directo a los recursos del backend: de ahí lo sirve Corvo, y sale un solo jar
// con las dos cosas dentro. Sin nginx delante para juntarlas ni dos despliegues que se
// puedan desincronizar.

// En desarrollo la API va en el 8181 y no en el 8080. El 8080 es un puerto disputado —aquí
// lo tenía un contenedor de Docker atado a 127.0.0.1— y el modo en que falla es de los malos:
// el proxy recibe un 200 con HTML de otra aplicación, `r.json()` revienta y la página de
// descargas dice «no se pudo leer el catálogo» como si fuera culpa suya.
//
// En producción sigue siendo el 8080; esto es solo para el `npm run dev`.
const API = process.env.CORVO_API ?? 'http://127.0.0.1:8181'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/src/main/resources/front',
    emptyOutDir: true,
  },
  server: {
    // El backend abre CORS para este origen y solo para este.
    port: 5173,
    proxy: { '/api': API },
  },
})
