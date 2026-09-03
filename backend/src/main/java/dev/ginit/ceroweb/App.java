package dev.ginit.ceroweb;

import cero.core.Cero;
import cero.core.Cors;
import cero.http.Server;
import cero.http.StaticFiles;

/**
 * El sitio de Cero, servido por Cero.
 *
 * <p>La API va bajo {@code /api} y devuelve JSON; todo lo demás lo resuelve el frontend
 * compilado, que vive en los recursos. Un solo jar sirve las dos cosas: no hace falta nginx
 * delante para juntarlas ni dos despliegues que puedan desincronizarse.
 *
 * <p>En desarrollo el frontend corre aparte, en el 5173 de Vite, así que se abre CORS para ese
 * origen y solo para ese.
 */
public final class App {

    private static final int PUERTO_POR_DEFECTO = 8080;

    private App() {
    }

    public static void main(String[] args) throws InterruptedException {
        int puerto = args.length > 0 ? Integer.parseInt(args[0]) : PUERTO_POR_DEFECTO;

        Server servidor = Cero.app()
                .port(puerto)
                .loadConfig()
                .use(Cors.allowing("http://localhost:5173", "http://127.0.0.1:5173"))
                .controllers(ModulosController.class, DescargaController.class,
                             InstaladorController.class)
                // spa(): una aplicación que enruta en el cliente no tiene un archivo por ruta.
                // Sin esto, entrar directo en /descargas daría 404.
                .fallback(StaticFiles.fromClasspath("front").spa()
                        .cacheControl("public, max-age=31536000, immutable"))
                .start();

        servidor.await();
    }
}
