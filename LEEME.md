# El sitio de Cero

`cero.ginit.dev` — la web oficial del framework, **servida por el propio framework**.

Backend en Cero (Java 25), frontend en React con Vite, y los dos dentro del mismo jar. No hay
nginx delante para juntarlos ni dos despliegues que puedan desincronizarse.

Que el sitio corra sobre Cero no es una pose: es la primera aplicación que sufre cualquier
regresión del framework, antes que las de nadie más.

## Estructura

```
51.Soft_Cero-Web/
├── backend/                     # Cero — la API y quien sirve el front
│   ├── pom.xml                  # depende de dev.ginit.cero:cero-core
│   └── src/main/
│       ├── java/dev/ginit/ceroweb/
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
java -cp "target/classes:$(cat target/cp.txt)" dev.ginit.ceroweb.App 8181

# terminal 2 — el front, con recarga en caliente
cd frontend
npm install
npm run dev            # http://localhost:5173
```

**El 8181 y no el 8080, a propósito.** El 8080 es un puerto disputado —en esta máquina lo tenía
un contenedor de Docker atado a `127.0.0.1`— y el modo en que falla es de los malos: el proxy
recibe un **200 con HTML de otra aplicación**, `r.json()` revienta y la página de descargas dice
«no se pudo leer el catálogo» como si el fallo fuera suyo. En producción sigue siendo el 8080.

Para apuntar a otro sitio: `CERO_API=http://127.0.0.1:9000 npm run dev`.

El backend abre CORS **solo** para `localhost:5173` y `127.0.0.1:5173`.

## Producción: un solo jar

```bash
./construir            # front → framework → backend → un jar
java -jar cero-sitio.jar 8080
```

1,3 MB con todo dentro: el frontend compilado, la API, el framework y los seis jar que la página
ofrece descargar. Desplegar es copiar un archivo.

Lo empaqueta `cero-launcher`, la herramienta del propio framework — un plugin de terceros aquí
desmentiría el argumento del proyecto.

El orden dentro del guion importa y no es reversible: **primero el front, después el backend**.
Vite escribe dentro de los recursos del backend, así que al revés se empaqueta la compilación
anterior del front y nadie avisa.

Si el framework no está en `../45.Framework_Cero`:

```bash
CERO_FRAMEWORK=/ruta/al/framework ./construir
```

## Elegir módulos

La página de descargas resuelve en el servidor, no en el navegador.

Quien llega ahí no pregunta «qué módulos hay» sino «qué necesito y cuánto pesa». Así que
`/api/seleccion` recibe lo que marcaste, **añade lo que arrastra cada módulo**, suma el peso real
y devuelve el `pom.xml` ya sin lo redundante: si entra `cero-core`, declarar `cero-http` sobra
porque Maven lo trae solo.

```bash
curl -s -X POST localhost:8080/api/seleccion \
     -H 'Content-Type: application/json' \
     -d '{"modulos":["cero-view"]}'
# resueltos: cero-http + cero-core + cero-view · 273 KB · 110 clases
```

Un módulo mal escrito devuelve **422 diciendo cuál**, en vez de desaparecer del resultado en
silencio y hacerte perder el rato buscando por qué falta.

El grafo de dependencias vive en `ModulosController`, en un solo sitio. Al añadir un módulo al
framework hay que registrarlo ahí.

## Descargar los jar

No solo el `pom.xml`: la página descarga los artefactos.

| Ruta | Qué da |
|---|---|
| `GET /api/jar?modulo=cero-core` | Un jar suelto |
| `GET /api/zip?modulos=cero-view,cero-data` | Un zip con la selección **ya resuelta** y un `LEEME.txt` |

Pedir `cero-view` trae dentro `cero-core` y `cero-http`, que es lo que necesita. El `LEEME.txt`
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
en Cero 0.5.0.

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

El **kit de marca de Richar**, sistema geométrico de planos plegados. Está entero en
`marca-kit/` con su catálogo; lo que se sirve vive en `frontend/public/marca/`.

**Todo en SVG.** Es el cambio importante frente a lo anterior: un vector escala sin perder
nada, aguanta a 16 px y no hay que recortar fondos ni mantener una versión por tema. Los dos
intentos previos —la cabeza facetada y el cuervo con alas— eran renders, y cada uno costó su
tarde de recortes, halos y erosiones.

| Archivo | Dónde |
|---|---|
| `logo-mark-notext.svg` | La barra |
| `logo-mark.svg` | La portada, con «Cv» dentro |
| `favicon.svg` | La pestaña — sin fondo y con el `viewBox` recortado al dibujo |
| `shape-*.svg` | Las formas sueltas de fondo |
| `enlace.jpg` | La tarjeta al compartir, generada renderizando el propio sitio |

### El color

La paleta es la del kit: navy `#1E3A8A`, cobalt `#1D4ED8`, blue `#2563EB`, sky `#38BDF8`,
cyan `#22D3EE`, purple `#7C3AED`, amber `#F59E0B`, ink `#0B1220`.

**El acento cambia de tono entre temas, y no por gusto.** `#2563EB` da 5,17× sobre blanco
—AA de sobra— pero solo **4,06× sobre negro**, que no llega para texto corrido. En oscuro
entra `#38BDF8`, que es del mismo kit y da 9,80×.

`sky` y `amber` no pasan AA sobre blanco (2,14× y 2,15×). No importa: son formas
decorativas, nunca texto. Queda escrito por si algún día alguien las usa para escribir.

El wordmark lleva «Co» en azul y «rvo» en tinta, como manda el kit. Va en dos `<span>` y no
con `::first-letter`, que solo alcanza a una letra.

### El favicon

**Sin cuadro de fondo:** el icono se posa sobre la pestaña, y esa pestaña cambia de color con
el tema del sistema. Un fondo fijo sería una caja oscura recortada sobre una barra clara.

Y con el **`viewBox` recortado al dibujo**. El arte mide 46×44 y empieza en (12,12) de un
lienzo de 64×64: declarándolo entero, el icono salía pequeño y descentrado, con casi un tercio
del espacio vacío. Recortado ocupa el **95 %** de la casilla en vez del 71 %.

Se cuadra a 48 con una unidad de aire porque la pestaña reserva una casilla cuadrada: con un
`viewBox` no cuadrado el navegador lo encaja dentro y vuelve a sobrar margen.

La caja hay que **medirla**, renderizando el SVG sobre un color que no aparezca en el dibujo y
recortando. A ojo no se ve, y el primer intento salió mal por dar el origen por hecho en (0,0):
el icono acabó ampliado y cortado por la mitad.

### El cuervo del relato

El render con alas vive en la sección «Por qué existe» de Acerca de, y solo ahí. Es el
apartado que cuenta de dónde sale el proyecto, no una página de referencia — en el resto del
sitio manda el sistema geométrico.

Dos archivos, uno por tema: la forma de ese render la definen los **brillos** y no una
silueta, así que no se puede tintar ni usar como máscara. En claro va la versión invertida y
en oscuro la original.

### Las formas de fondo

Las tres van en **un solo pseudoelemento**, con tres imágenes de fondo. No es capricho: un
elemento tiene `::before` y `::after` y nada más, y `::before` ya lo ocupa el halo de color.
Al escribirlas también en `::before` se pisaban las dos reglas —el halo gana su
`left: 50%; width: 100vw` y el tetraedro acababa en la esquina contraria—.

Van como imagen y no como máscara teñida porque traen su propio volumen y su propio color:
el ámbar y el violeta no salen de la paleta del texto.

El kit manda tres o cuatro por sección, rotadas, nunca un enjambre. Son tres, a distinta
altura y a distinto lado. En el móvil se ocultan —no hay huecos que rellenar, solo texto—
pero **el halo se queda**: es lo que le quita la sensación de folio en blanco.

## Pendiente

- El dominio `cero.ginit.dev` con su vhost, su certificado y el 301 desde `luxcore.ginit.dev`.
  **Ojo:** hoy ese subdominio existe por un comodín DNS y sirve AgroYachay con su certificado.

## Licencia

Apache 2.0 — ver [LICENSE](LICENSE) y [NOTICE](NOTICE), igual que
[el framework](https://github.com/Andre031222/Cero).
