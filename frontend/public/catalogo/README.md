# Catálogo visual Cero

Recursos locales para el sitio. Todos usan la paleta del sistema: negro, grafito, cian y un acento ámbar.

## Imágenes

| Archivo | Uso sugerido |
| --- | --- |
| `imagenes/01-nucleo-cero.svg` | Hero o portada principal |
| `imagenes/02-prisma-horizonte.svg` | Fondo ancho o sección editorial |
| `imagenes/03-orbita-azul.svg` | Producto, arquitectura o integración |
| `imagenes/04-malla-cian.svg` | Fondo de documentación |
| `imagenes/05-faceta-ambar.svg` | Destacado o llamada a la acción |
| `imagenes/06-pulso-nocturno.svg` | Rendimiento, métricas o eventos |
| `imagenes/07-monolito.svg` | Seguridad, servidor o despliegue |
| `imagenes/08-convergencia.svg` | Módulos y conexiones |
| `imagenes/09-vector-vertical.svg` | Flujo, guía o progreso |
| `imagenes/10-umbral.svg` | Cierre o cabecera secundaria |

Las versiones `.png` de las piezas 01, 02, 03, 06 y 10 están listas para usos que no acepten SVG. `imagenes/geometria-cian-01.png` es una pieza editorial raster adicional.

## Videos

Los cinco clips son MP4 H.264, 1280 × 720, sin audio y duran 7 segundos:

| Archivo | Uso sugerido |
| --- | --- |
| `videos/01-nucleo-orbita.mp4` | Hero en movimiento |
| `videos/02-prisma-recorrido.mp4` | Fondo panorámico |
| `videos/03-orbita-encuentro.mp4` | Transición o integración |
| `videos/04-pulso-electrico.mp4` | Panel de métricas |
| `videos/05-umbral-lento.mp4` | Cierre visual |

## Uso web

```jsx
<img src="/catalogo/imagenes/01-nucleo-cero.svg" alt="Núcleo geométrico Cero" />

<video autoPlay muted loop playsInline poster="/catalogo/imagenes/01-nucleo-cero.png">
  <source src="/catalogo/videos/01-nucleo-orbita.mp4" type="video/mp4" />
</video>
```
