#!/usr/bin/env bash
# Dibuja frontend/public/marca/enlace.jpg — la tarjeta que sale al compartir el enlace.
#
# Existe como guion y no como archivo suelto por una razón concreta: la anterior se quedó
# diciendo «CORVO · v0.4.0» con las cifras viejas durante todo un renombrado, y nadie la vio
# porque esa imagen no se mira nunca desde dentro del sitio, solo desde Slack o WhatsApp.
# Cuando cambien la versión o las cifras, se corre esto y ya.
#
#   ./marca-kit/guiones/tarjeta-enlace.sh
set -euo pipefail

VERSION="${VERSION:-0.6.0}"
KB="${KB:-407}"; MS="${MS:-106}"; DEPS="${DEPS:-0}"; PRUEBAS="${PRUEBAS:-1835}"

AQUI="$(cd "$(dirname "$0")/../.." && pwd)"
MARCA="$AQUI/frontend/public/marca"
NEUE="/System/Library/Fonts/HelveticaNeue.ttc"
MONO="/System/Library/Fonts/Menlo.ttc"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# El isotipo va en la variante ice: la principal es negra y sobre este fondo claro se apaga.
magick -size 1200x630 gradient:'#FFFFFF-#EEF3F8' -blur 0x40 "$TMP/lienzo.png"
magick "$TMP/lienzo.png" \
  \( "$MARCA/logo-light.png" -resize 300x300 \) -gravity northeast -geometry +150+120 -composite \
  "$TMP/base.png"

magick "$TMP/base.png" \
  -font "$MONO" -pointsize 25 -fill '#2563EB' -annotate +90+150 "CERO  ·  v$VERSION" \
  -font "$NEUE" -pointsize 88 -fill '#0A0A0B' -annotate +88+265 "Sin" \
  -font "$NEUE" -pointsize 88 -fill '#2563EB' -annotate +88+360 "contenedor." \
  -font "$NEUE" -pointsize 27 -fill '#475569' -annotate +90+425 "Framework web para Java. Un servidor HTTP propio," \
  -font "$NEUE" -pointsize 27 -fill '#475569' -annotate +90+462 "un hilo virtual por conexión y cero dependencias." \
  -font "$MONO" -pointsize 25 -fill '#64748B' -annotate +90+553 "cero.ginit.dev" \
  -font "$NEUE" -pointsize 46 -fill '#2563EB' \
    -annotate +820+490 "$KB" -annotate +915+490 "$MS" -annotate +1010+490 "$DEPS" -annotate +1075+490 "$PRUEBAS" \
  -font "$MONO" -pointsize 17 -fill '#94A3B8' \
    -annotate +826+520 "KB" -annotate +921+520 "MS" -annotate +1000+520 "DEPS" -annotate +1063+520 "PRUEBAS" \
  -quality 92 "$MARCA/enlace.jpg"

echo "listo · $MARCA/enlace.jpg · $(du -h "$MARCA/enlace.jpg" | cut -f1)"
