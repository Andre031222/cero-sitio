/**
 * La versión de Cero que anuncia el front, en un solo sitio.
 *
 * Estaba escrita a mano en cuatro archivos y al subir de 0.5.0 a 0.6.0 se quedaron atrás.
 * Su pareja en el backend es `Version.java`: son dos lenguajes, no hay fuente común, y al
 * subir de versión hay que tocar las dos. La lista completa está en LEEME.md.
 */
export const VERSION = '0.8.0'

/** La última en Maven Central. Va aparte porque Central es inmutable y siempre va por detrás
 *  de la versión que sirve el instalador: entregar coordenadas que no resuelven rompe builds. */
export const VERSION_CENTRAL = '0.8.0'
