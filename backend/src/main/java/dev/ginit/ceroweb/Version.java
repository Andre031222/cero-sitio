package dev.ginit.ceroweb;

/**
 * La versión de Cero que este sitio anuncia, en un solo sitio.
 *
 * <p>Estaba escrita a mano en tres controladores, y al subir de 0.5.0 a 0.6.0 se quedaron los
 * tres atrás — incluidas las rutas de descarga, que llevan la versión dentro del camino. El
 * resultado era un instalador que pedía un archivo que ya no existía con ese nombre.
 *
 * <p>Es una constante y no un valor leído de un archivo a propósito: las rutas la necesitan
 * dentro de una anotación, y ahí solo caben constantes de compilación. Lo que se gana es que
 * subir de versión sea cambiar una línea en vez de acordarse de seis.
 */
final class Version {

    static final String ACTUAL = "0.6.0";

    /** El paquete que baja el instalador. */
    static final String PAQUETE = "cero-" + ACTUAL + ".tar.gz";

    /** La ruta desde la que se sirve, con la versión dentro. */
    static final String RUTA_PAQUETE = "/estaticos/" + PAQUETE;

    private Version() {
    }
}
