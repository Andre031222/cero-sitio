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

Dos procesos: el backend en el 8080 y Vite en el 5173, que hace de proxy de `/api`.

```bash
# terminal 1 — la API
cd backend
mvn -q dependency:build-classpath -Dmdep.outputFile=target/cp.txt
mvn -q -DskipTests package
java -cp "target/classes:$(cat target/cp.txt)" dev.ginit.corvoweb.App 8080

# terminal 2 — el front, con recarga en caliente
cd frontend
npm install
npm run dev            # http://localhost:5173
```

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

Un cuervo facetado, en `frontend/public/marca/`. Del mismo original salen tres cosas:

| Archivo | Dónde | Cómo |
|---|---|---|
| `cuervo-color.webp` | La portada | El dibujo con sus grises, 76 KB. No se tinta: los tonos facetados se sostienen igual sobre blanco que sobre negro |
| `cuervo-marca.png` | La barra | La silueta sacada del canal alfa, para poder tintarla con `var(--acento)` |
| `favicon.svg` | La pestaña | La misma silueta, tintada, dentro de una caja de 64 |
| `enlace.jpg` | La tarjeta al compartir | 1200×630, generada renderizando el sitio con sus propias tipografías |

Las etiquetas `og:` van en `index.html` y no en React: los rastreadores de Slack, WhatsApp o
Twitter no ejecutan JavaScript. Una etiqueta puesta al montar un componente no la ve nadie.

### El color

`--acento` es **bermellón** — `#c0341d` en claro, `#ff6a4d` en oscuro. Antes era magenta
(`#c2136a` / `#ff3d9a`).

Los dos pasan AA de sobra (5,8× y 5,6× sobre blanco), así que la decisión no era de contraste sino
de qué dice el color. El magenta es un acento de producto, y choca con un grabado en blanco y
negro y una tipografía con serifas. El bermellón es tinta y lacre: acompaña al ave en vez de
competir con ella, y no cae en el azul o el morado de todos los sitios de herramientas.

Está definido tres veces —`:root`, `prefers-color-scheme` y `[data-tema]`— para que el conmutador
gane en las dos direcciones. Cambiarlo son esas tres líneas de `estilo.css`, más recolorear el
favicon, que lleva el color quemado en su paleta.

### El cuervo de la portada

Se inclina siguiendo al puntero sobre una caja con `perspective`, y la sombra se desplaza al revés
que la figura. El ojo lee eso como relieve aunque el grabado siga siendo plano, y cuesta un
`transform` en la GPU en vez de una librería 3D que pesaría más que el framework entero.

Tres cosas lo mantienen honrado: el `transform` se escribe dentro de un `requestAnimationFrame`
—hacerlo en el evento fuerza un reflujo por píxel movido—; el oyente ni se registra donde no hay
puntero fino; y con `prefers-reduced-motion: reduce` no hay entrada, ni flotación, ni seguimiento.

Por debajo de 62 rem no hay hueco al lado del titular. Antes desaparecía; ahora pasa a ser **marca
de agua** detrás del texto, porque la marca del sitio no debería existir solo en pantallas
grandes. La portada lleva `overflow-x: clip` —`clip` y no `hidden`, que convertiría la sección en
un contenedor de desplazamiento y rompería el `sticky` de la barra— porque el ave sobresale a
propósito y esos píxeles ensanchaban el documento entero en el teléfono.

**El original venía en JPEG con el damero de transparencia pintado en los píxeles**, no con canal
alfa. Recortarlo no fue un color-key: el damero alterna gris claro y blanco, que son justo los
tonos de las facetas claras del ave. Lo que funciona es **relleno por inundación desde las cuatro
esquinas**, porque el fondo toca el borde y las facetas claras del interior no. Quedó una zona
cerrada **entre las patas** que hubo que inundar aparte.

## Pendiente

- El dominio `corvo.ginit.dev` con su vhost, su certificado y el 301 desde `luxcore.ginit.dev`.
  **Ojo:** hoy ese subdominio existe por un comodín DNS y sirve AgroYachay con su certificado.
