/**
 * Bilingüe: el castellano en la raíz y el inglés bajo /en.
 *
 * Los nombres de ruta NO se traducen (`/en/guia`, no `/en/guide`). Así cada página y su pareja
 * se corresponden con una sustitución, sin tabla de equivalencias que se desincronice — que es
 * justo el error que se paga cuando el sitio crece.
 */

export const IDIOMAS = ['es', 'en']

/** El idioma que toca según la ruta. */
export function idiomaDe(pathname) {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es'
}

/** La misma página en el otro idioma. */
export function parejaDe(pathname) {
  if (idiomaDe(pathname) === 'en') {
    const sinPrefijo = pathname.slice(3)
    return sinPrefijo === '' ? '/' : sinPrefijo
  }
  return pathname === '/' ? '/en' : `/en${pathname}`
}

/** Los textos de la propia plantilla: menú, pie y etiquetas. */
export const TEXTOS = {
  es: {
    lang: 'es',
    menu: [['', 'Inicio'], ['/empezar', 'Empezar'], ['/guia', 'Guía'],
           ['/modulos', 'Módulos'], ['/referencia', 'Referencia'], ['/descargas', 'Descargas']],
    otro: 'English',
    otroTitulo: 'Read this page in English',
    sede: 'Universidad Nacional del Altiplano · Puno, Perú',
    licencia: 'Corvo 0.4.0 · Licencia MIT',
    servido: 'Servido por Corvo, sin contenedor',
    noEncontrada: ['No encontrada', 'Esa página no existe. Prueba desde', 'el inicio'],
    portada: {
      nuevo: 'Nuevo', ante: 'Framework web para Java',
      titular: ['Sin', 'contenedor.'],
      promesa: ['Un servidor HTTP propio, un hilo virtual por conexión y ', 'cero dependencias',
                '. ', ' y está corriendo — sin Tomcat, sin ', ', sin despliegue.'],
      empezar: 'Empezar', codigo: 'Código',
      windows: ['En Windows, ', '. Requiere Maven y un JDK 21. Después: '],
      cifras: [['308','KB','Desplegado'],['106','ms','Arranque'],['0','deps','En ejecución'],['1258','','Pruebas']],
      nota: 'Esta página la sirve el propio Corvo: la API en Java y el front en React, dentro del mismo jar. Si el framework falla, falla aquí antes que en las aplicaciones de nadie.',
    },
    descargas: {
      titulo: 'Descargas',
      entrada: ['Toma solo lo que uses. Marca lo que necesitas y te decimos qué arrastra, cuánto pesa y qué declarar en tu ', '.'],
      necesita: 'necesita', incluido: 'viene incluido por lo que elegiste',
      enTotal: 'en total', clases: 'clases', modulos: 'módulos',
      seAnaden: ['Se añaden solos: ', '. No hay que declararlos: Maven los trae con lo que sí declaras.'],
      copiar: 'copiar', copiado: 'copiado',
      marcaAlgo: 'Marca al menos un módulo para ver el resultado.',
      falloCatalogo: 'No se pudo leer el catálogo', falloResolver: 'No se pudo resolver',
    },
  },
  en: {
    lang: 'en',
    menu: [['', 'Home'], ['/empezar', 'Get started'], ['/guia', 'Guide'],
           ['/modulos', 'Modules'], ['/referencia', 'Reference'], ['/descargas', 'Downloads']],
    otro: 'Español',
    otroTitulo: 'Leer esta página en español',
    sede: 'Universidad Nacional del Altiplano · Puno, Peru',
    licencia: 'Corvo 0.4.0 · MIT licence',
    servido: 'Served by Corvo, with no container',
    noEncontrada: ['Not found', 'That page does not exist. Try from', 'the home page'],
    portada: {
      nuevo: 'New', ante: 'Web framework for Java',
      titular: ['No', 'container.'],
      promesa: ['Its own HTTP server, one virtual thread per connection and ', 'zero dependencies',
                '. ', ' and it is running — no Tomcat, no ', ', no deployment.'],
      empezar: 'Get started', codigo: 'Source',
      windows: ['On Windows, ', '. Requires Maven and a JDK 21. Then: '],
      cifras: [['308','KB','Deployed'],['106','ms','Boot'],['0','deps','At runtime'],['1258','','Tests']],
      nota: 'This page is served by Corvo itself: the API in Java and the front end in React, inside the same jar. If the framework breaks, it breaks here before it breaks anyone else\u2019s application.',
    },
    descargas: {
      titulo: 'Downloads',
      entrada: ['Take only what you use. Tick what you need and we tell you what it pulls in, how much it weighs and what to declare in your ', '.'],
      necesita: 'needs', incluido: 'comes in with what you picked',
      enTotal: 'in total', clases: 'classes', modulos: 'modules',
      seAnaden: ['Pulled in for you: ', '. No need to declare them: Maven brings them with what you do declare.'],
      copiar: 'copy', copiado: 'copied',
      marcaAlgo: 'Tick at least one module to see the result.',
      falloCatalogo: 'Could not read the catalogue', falloResolver: 'Could not resolve',
    },
  },
}

/** El prefijo con el que armar los enlaces del idioma actual. */
export const raizDe = (idioma) => (idioma === 'en' ? '/en' : '')
