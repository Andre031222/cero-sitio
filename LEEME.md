# El sitio de Corvo

`corvo.ginit.dev` — la web oficial del framework, **servida por el propio framework**.

Backend en Corvo (Java 21), frontend en React con Vite, y los dos dentro del mismo jar. No hay
nginx delante para juntarlos ni dos despliegues que puedan desincronizarse.

Que el sitio corra sobre Corvo no es una pose: es la primera aplicación que sufre cualquier
regresión del framework, antes que las de nadie más.

## Estructura

```
51.Soft_Corvo-Web/
├── backend/                     # Corvo — la API y quien sirve el front
│   ├── pom.xml                  # depende de dev.ginit.corvo:corvo-core
│   └── src/main/
│       ├── java/dev/ginit/corvoweb/
│       │   ├── App.java             # arranque: CORS en desarrollo, spa() para el front
│       │   └── ModulosController.java   # /api/modulos y /api/seleccion
│       └── resources/front/     # ← aquí escribe Vite. Generado, no se edita
└── frontend/                    # React + Vite
    ├── vite.config.js           # outDir apunta a los recursos del backend
    └── src/
        ├── main.jsx             # rutas
        ├── Marco.jsx            # barra y pie
        ├── estilo.css
        ├── Tema.jsx             # conmutador claro / oscuro / sistema
        ├── Orden.jsx            # orden de terminal con copiar
        ├── contenido/           # el cuerpo de cada página, en HTML
        │   ├── *.html           # castellano
        │   └── en/*.html        # inglés, ya traducido
        └── paginas/
            ├── Portada.jsx
            ├── Contenido.jsx    # rinde un archivo de contenido/
            └── Descargas.jsx    # elegir módulos
```

## Desarrollo

Dos procesos: el backend en el **8181** y Vite en el 5173, que hace de proxy de `/api`.

```bash
# terminal 1 — la API
cd backend
mvn -q dependency:build-classpath -Dmdep.outputFile=target/cp.txt
mvn -q -DskipTests package
java -cp "target/classes:$(cat target/cp.txt)" dev.ginit.corvoweb.App 8181

# terminal 2 — el front, con recarga en caliente
cd frontend
npm install
npm run dev            # http://localhost:5173
```

**El 8181 y no el 8080, a propósito.** El 8080 es un puerto disputado —en esta máquina lo tenía
un contenedor de Docker atado a `127.0.0.1`— y el modo en que falla es de los malos: el proxy
recibe un **200 con HTML de otra aplicación**, `r.json()` revienta y la página de descargas dice
«no se pudo leer el catálogo» como si el fallo fuera suyo. En producción sigue siendo el 8080.

Para apuntar a otro sitio: `CORVO_API=http://127.0.0.1:9000 npm run dev`.

El backend abre CORS **solo** para `localhost:5173` y `127.0.0.1:5173`.

## Producción: un solo jar

```bash
./construir            # front → framework → backend → un jar
java -jar corvo-sitio.jar 8080
```

1,3 MB con todo dentro: el frontend compilado, la API, el framework y los seis jar que la página
ofrece descargar. Desplegar es copiar un archivo.

Lo empaqueta `corvo-launcher`, la herramienta del propio framework — un plugin de terceros aquí
desmentiría el argumento del proyecto.

El orden dentro del guion importa y no es reversible: **primero el front, después el backend**.
Vite escribe dentro de los recursos del backend, así que al revés se empaqueta la compilación
anterior del front y nadie avisa.

Si el framework no está en `../45.Soft_LuxCore`:

```bash
CORVO_FRAMEWORK=/ruta/al/framework ./construir
```

## Elegir módulos

La página de descargas resuelve en el servidor, no en el navegador.

Quien llega ahí no pregunta «qué módulos hay» sino «qué necesito y cuánto pesa». Así que
`/api/seleccion` recibe lo que marcaste, **añade lo que arrastra cada módulo**, suma el peso real
y devuelve el `pom.xml` ya sin lo redundante: si entra `corvo-core`, declarar `corvo-http` sobra
porque Maven lo trae solo.

```bash
curl -s -X POST localhost:8080/api/seleccion \
     -H 'Content-Type: application/json' \
     -d '{"modulos":["corvo-view"]}'
# resueltos: corvo-http + corvo-core + corvo-view · 273 KB · 110 clases
```

Un módulo mal escrito devuelve **422 diciendo cuál**, en vez de desaparecer del resultado en
silencio y hacerte perder el rato buscando por qué falta.

El grafo de dependencias vive en `ModulosController`, en un solo sitio. Al añadir un módulo al
framework hay que registrarlo ahí.

## Descargar los jar

No solo el `pom.xml`: la página descarga los artefactos.

| Ruta | Qué da |
|---|---|
| `GET /api/jar?modulo=corvo-core` | Un jar suelto |
| `GET /api/zip?modulos=corvo-view,corvo-data` | Un zip con la selección **ya resuelta** y un `LEEME.txt` |

Pedir `corvo-view` trae dentro `corvo-core` y `corvo-http`, que es lo que necesita. El `LEEME.txt`
lleva las órdenes `mvn install:install-file` y el trozo de `pom.xml`: quien abra el zip dentro de
un mes no se acuerda de qué eligió, y lo que hay son seis jar sin contexto.

**Los artefactos viajan dentro del jar del sitio**, en `/artefactos`, puestos ahí por
`maven-dependency-plugin` al empaquetar. Leerlos del repositorio local de Maven en tiempo de
ejecución habría atado el sitio a la máquina donde se compiló: en el servidor no hay `~/.m2` y las
descargas darían 503 sin que nadie se entere hasta que alguien pulse el botón.

El nombre del módulo se valida contra el catálogo **antes** de construir una ruta. Sin eso, un
`../..` en la URL leería cualquier recurso del jar.

Esto obligó a tapar un agujero del framework: `Result` no sabía devolver binario, y el atajo
obvio —mandarlo como `String`— lo rompe en silencio, porque el cuerpo se escribe en UTF-8 y todo
byte sobre `0x7F` sale convertido en otra cosa. De ahí salen `Result.bytes` y `Result.download`,
en Corvo 0.4.0.

## El contenido

Las páginas de Empezar, Guía, Módulos y Referencia son **HTML**, no JSX, y están en
`frontend/src/contenido/`. Son 5 800 palabras con tablas, bloques de código y avisos, escritas y
revisadas una vez: pasarlas a JSX sería copiarlas a mano con la posibilidad de erratas y sin
ganar nada. Se incrustan en el bundle con `?raw`, así que una página no espera a una segunda
petición para pintarse.

`Contenido.jsx` las rinde con `dangerouslySetInnerHTML`, y eso pide justificación: el HTML es
**nuestro**, vive en el repositorio y se compila dentro del bundle. No viene de un usuario ni de
la red, que es donde está el riesgo real de esa API.

La carpeta `en/` tiene la traducción, y **el sitio es bilingüe**: catorce rutas (seis en
castellano, seis en inglés y dos de 404), conmutador en la barra, `hreflang` inyectado y
`document.documentElement.lang` al día. Los textos de interfaz están en `idioma.js`, no repartidos
por los componentes.

## La marca

El **kit de marca de Richar**: cabeza de cuervo facetada, negra con cuñas azules, mirando a la
derecha. Las trece láminas originales quedan en `marca-kit/` — fuera de `public/`, para tenerlas
sin servirlas al navegador.

| Archivo | Dónde | Cómo |
|---|---|---|
| `simbolo.webp` | Barra y portada | El isotipo recortado, 895×675, 36 KB. **Un solo archivo para los dos temas**, y **mira a la izquierda** |
| `favicon.svg` | La pestaña | El isotipo sobre cuadrado claro, con el PNG incrustado en base64 |
| `enlace.jpg` | La tarjeta al compartir | 1200×630, generada renderizando el propio sitio con sus fuentes |

### Mira a la izquierda, a propósito

El isotipo va a la derecha del titular, así que mirando a la derecha le daba la espalda al texto.
El kit trae las dos orientaciones y la que se usa es **el render propio del kit, no un espejo**:
espejar habría invertido también la luz, y las facetas dejan de tener sentido.

Por lo mismo va `justify-self: start` en su columna y no `end`: al fondo de la columna quedaba a
un palmo del texto, mirando a un hueco en vez de mirarlo a él.

### Cómo se recortó, y por qué así

Del **panel claro** del kit, no del oscuro. En el oscuro el fondo y las facetas negras del ave
son el mismo negro —(7,8,13) contra (8,9,13)—: ahí no hay información que separar, y cualquier
relleno por inundación se come el pájaro. Se comprobó con márgenes del 3 %, 5 % y 8 %, y los tres
lo destrozan.

Del claro sí sale, y el resultado **funciona sobre negro** porque la silueta la definen las
facetas grises de arriba y las cuñas azules, no las negras.

Dos detalles que hicieron falta:

- **Una cuña blanca encerrada** bajo el pico no la alcanzaba el relleno desde las esquinas: hay
  que inundarla aparte. Se localiza con `-connected-components`, que da su centroide.
- **El borde va erosionado un píxel.** Los píxeles semitransparentes del contorno arrastraban el
  claro del que se recortó, y sobre negro se veía un halo alrededor del ave.

Se reescala al 200 % con Lanczos y aguanta: es un render de facetas planas, no una fotografía.

### El color

La paleta sale del kit: `#111827` · `#1F2937` · `#6B7280` · `#F8FAFC`.

**El azul no es el que declara la hoja del kit.** El kit dice `#2563EB`, pero el dibujo del ave
usa de verdad un azul mucho más vivo —su tono dominante es `#166BFB`— y el declarado se quedaba
apagado justo al lado del propio logo. El acento es `#0B5CFF`: saturación máxima y, además,
**más** contraste que el declarado (5,26× contra 5,17× sobre blanco). Salir ganando en las dos
cosas no suele pasar; cuando pasa, se coge.

En oscuro sube a `#5b8dff` (6,70× sobre negro), porque un azul de ese peso sobre negro se queda
corto.

`--acento-2` (`#5b91f5` / `#8fbaff`) existe **solo para los degradados**: un degradado de un color
a sí mismo aclarado se ve sucio. No llega a AA para texto corrido, y por eso aparece únicamente
sobre el titular, las cifras y reglas decorativas.

Los tokens están **tres veces** —`:root`, `prefers-color-scheme` y `[data-tema]`— para que el
conmutador gane en las dos direcciones, y además quemados en `favicon.svg` y `enlace.jpg`, que se
regeneran aparte.

### Trampas ya mordidas

- **El recorte horizontal va en `html`, no en la portada.** Recortando en la portada, el corte cae
  en el borde del marco y deja una línea recta atravesando el isotipo. `clip` y no `hidden`:
  `hidden` haría de la raíz un contenedor de desplazamiento y rompería el `sticky` de la barra.
- **La palabra de la barra no se oculta en el móvil.** Hubo una regla que la escondía por debajo
  de 26 rem porque el símbolo bastaba; al quitar el símbolo temporalmente, la barra del teléfono
  se quedó sin nada. Ahora encoge.
- **La marca de agua no sobresale.** Con `right: -6%` desbordaba 4 px a 834 px y dependía del
  recorte para taparlo. Depender del recorte para eso es frágil.

## Pendiente

- El dominio `corvo.ginit.dev` con su vhost, su certificado y el 301 desde `luxcore.ginit.dev`.
  **Ojo:** hoy ese subdominio existe por un comodín DNS y sirve AgroYachay con su certificado.
