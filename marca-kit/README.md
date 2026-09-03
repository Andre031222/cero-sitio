# Cero — kit de marca

**Principal:** negro + cian eléctrico  
**Variante clara:** ice (gris + azul + ámbar)

## Tipografía
- Display: Space Grotesk Bold · tracking −0.04em
- UI: Inter
- Wordmark principal: `Ce` #22D3EE · `ro` #0A0A0B
- Wordmark ice: `Ce` #2563EB · `ro` #1E293B

## Paleta principal
| Token   | Hex     | Uso              |
|---------|---------|------------------|
| ink     | #0A0A0B | pliegues / texto |
| cyan    | #22D3EE | acento / Ce      |
| cyan-hi | #67E8F9 | highlights       |
| slate   | #1F2937 | pliegues medios  |
| paper   | #FAFAFA | fondos claros    |

## Paleta ice (docs / light)
| Token | Hex     |
|-------|---------|
| ice   | #94A3B8 |
| blue  | #2563EB |
| amber | #F59E0B |
| slate | #1E293B |

## Archivos clave
- `png/logo-primary.png` — isotipo negro+cian transparente
- `png/logo-light.png` — isotipo ice transparente
- `png/logo-primary-{32,64,128,256,512}.png`
- `png/wordmark*.png` + `svg/wordmark*.svg`
- `png/shape-*.png` + `svg/shape-*.svg` — decoraciones
- `catalogo.html` — hoja de sistema

## Uso de formas
```css
.deco { position: absolute; pointer-events: none; user-select: none; }
.deco-cyan   { width: 72px; top: 36px; right: 10%; rotate: 14deg; }
.deco-char   { width: 64px; bottom: 18%; right: 6%; rotate: -10deg; }
.deco-amber  { width: 56px; bottom: 8%; left: 12%; rotate: 22deg; }
```
