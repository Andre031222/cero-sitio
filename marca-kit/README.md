# Corvo — kit de marca (opción A)

Sistema geométrico de planos plegados para usar en toda la web.
Todos los SVG y PNG van con fondo transparente.

## Tipografía
- Display / wordmark: **Space Grotesk Bold**
- UI / body: **Inter**
- Letter-spacing wordmark: -0.04em
- "Co" en #2563EB · "rvo" en #0B1220 (claro) o #F8FAFC (oscuro)

## Paleta
| Token        | Hex     | Uso                         |
|--------------|---------|-----------------------------|
| navy         | #1E3A8A | plano izquierdo             |
| cobalt       | #1D4ED8 | pliegue principal           |
| blue         | #2563EB | acentos, botones, "Co"      |
| sky          | #38BDF8 | shard superior              |
| cyan         | #22D3EE | shard inferior              |
| purple       | #7C3AED | pliegue violeta             |
| amber        | #F59E0B | tetraedro (pico)            |
| ink          | #0B1220 | texto                       |

## Archivos
- `svg/logo-mark.svg` — isotipo con Cv
- `svg/logo-mark-notext.svg` — solo geometría
- `svg/logo-icon.svg` — app icon / favicon grande
- `svg/wordmark.svg` + `wordmark-lockup.svg` + `wordmark-stacked.svg`
- `svg/shape-*.svg` — formas sueltas para hero, footer, docs, 404
- `png/` — mismos assets raster + logo A original recortado

## Cómo usar las formas en la web
```html
<img class="deco deco--amber" src="/brand/shape-tetra-amber.svg" alt="">
<img class="deco deco--purple" src="/brand/shape-pentagon-purple.svg" alt="">
<img class="deco deco--blue" src="/brand/shape-diamond-blue.svg" alt="">
```

```css
.deco { position: absolute; pointer-events: none; user-select: none; }
.deco--amber  { width: 88px;  top: 40px;   right: 12%; rotate: 18deg;  opacity: .95; }
.deco--purple { width: 72px;  top: 46%;    right: 4%;  rotate: -8deg; }
.deco--blue   { width: 64px;  bottom: 12%; right: 18%; rotate: 28deg; }
.deco--cyan   { width: 96px;  bottom: -20px; left: 8%; rotate: -16deg; opacity: .8; }
```

Colócalas como JxMVC: 3–4 formas por sección, nunca un enjambre.
