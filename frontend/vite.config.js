import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El build va directo a los recursos del backend: de ahí lo sirve Corvo, y sale un solo jar
// con las dos cosas dentro. Sin nginx delante para juntarlas ni dos despliegues que se
// puedan desincronizar.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/src/main/resources/front',
    emptyOutDir: true,
  },
  server: {
    // En desarrollo el front corre aquí y la API en el 8080; el backend abre CORS para este
    // origen y solo para este.
    port: 5173,
    proxy: { '/api': 'http://localhost:8080' },
  },
})
