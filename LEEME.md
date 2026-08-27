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
cd frontend && npm run build      # escribe en backend/src/main/resources/front
cd ../backend && mvn -DskipTests package
java -cp "target/classes:$(cat target/cp.txt)" dev.ginit.corvoweb.App 8080
```

El orden importa: **primero el front, después el backend**. Al revés se empaqueta la compilación
anterior del front y nadie avisa.

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

## El contenido

Las páginas de Empezar, Guía, Módulos y Referencia son **HTML**, no JSX, y están en
`frontend/src/contenido/`. Son 5 800 palabras con tablas, bloques de código y avisos, escritas y
revisadas una vez: pasarlas a JSX sería copiarlas a mano con la posibilidad de erratas y sin
ganar nada. Se incrustan en el bundle con `?raw`, así que una página no espera a una segunda
petición para pintarse.

`Contenido.jsx` las rinde con `dangerouslySetInnerHTML`, y eso pide justificación: el HTML es
**nuestro**, vive en el repositorio y se compila dentro del bundle. No viene de un usuario ni de
la red, que es donde está el riesgo real de esa API.

La carpeta `en/` tiene la traducción lista. Falta montar las rutas `/en/…`, el conmutador y el
`hreflang` — la decisión de si el sitio nace bilingüe sigue abierta.

## Pendiente

- **El logo.** `Marco.jsx` tiene el hueco marcado con la clase `.logo`; ahora mismo es un
  rectángulo del color de acento. En cuanto llegue el archivo, entra ahí.
- Más páginas: guía, módulos, referencia.
- El dominio `corvo.ginit.dev` con su vhost, su certificado y el 301 desde `luxcore.ginit.dev`.
  **Ojo:** hoy ese subdominio existe por un comodín DNS y sirve AgroYachay con su certificado.
