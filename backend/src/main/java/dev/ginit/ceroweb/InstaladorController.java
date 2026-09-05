package dev.ginit.ceroweb;

import cero.core.Get;
import cero.core.Result;
import cero.core.Route;
import cero.http.HttpException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Lo que hace falta para que {@code curl -fsSL https://cero.ginit.dev/instalar | sh} funcione.
 *
 * <p>Son cinco rutas y las cinco tienen que existir a la vez, porque el guion las encadena:
 * pregunta la versión, baja el paquete de esa versión, baja su huella, la compara y compila.
 * Si falta una, falla el conjunto — y falla en la máquina de quien lo instala, no aquí.
 *
 * <p>El prefijo va explícito como {@code "/"}. Un {@code @Route} sin valor NO significa raíz:
 * el framework deriva el prefijo del nombre de la clase, así que estas rutas acabarían en
 * {@code /instalador/version} y el instalador seguiría roto.
 *
 * <p>Van en un controlador y no como estáticos porque el respaldo del sitio es {@code spa()}:
 * cualquier ruta desconocida devuelve el {@code index.html}. Eso convierte un 404 honesto en un
 * 200 con HTML, y el guion acaba pasándole a {@code sh} una página web entera — que es
 * exactamente el error que apareció: {@code syntax error near unexpected token `newline'}.
 */
@Route("/")
public class InstaladorController {

    static final String VERSION = Version.ACTUAL;
    private static final String PAQUETE = Version.PAQUETE;

    /** La versión que el guion pregunta antes de nada. Sin salto de línea de más. */
    @Get("/version")
    public Object version() {
        return Result.text(VERSION).header("Cache-Control", "no-cache");
    }

    @Get("/instalar")
    public Object instalarSh() {
        return guion("/instalador/instalar.sh", "text/x-shellscript; charset=utf-8");
    }

    @Get("/instalar.ps1")
    public Object instalarPs1() {
        return guion("/instalador/instalar.ps1", "text/plain; charset=utf-8");
    }

    @Get(Version.RUTA_PAQUETE)
    public Object paquete() {
        return Result.download(leerBytes("/instalador/" + PAQUETE), PAQUETE, "application/gzip");
    }

    @Get(Version.RUTA_PAQUETE + ".sha256")
    public Object huella() {
        return Result.text(new String(leerBytes("/instalador/" + PAQUETE + ".sha256"),
                StandardCharsets.UTF_8));
    }

    /**
     * Los guiones se sirven como texto, nunca como descarga.
     *
     * <p>Un {@code Content-Disposition: attachment} aquí haría que el navegador los guardara en
     * vez de enseñarlos, y quien quiere leer un guion antes de pasárselo a {@code sh} —que es lo
     * que debería hacer todo el mundo— se encontraría con un archivo bajado en vez de con el
     * texto.
     */
    private static Object guion(String recurso, String tipo) {
        return Result.text(new String(leerBytes(recurso), StandardCharsets.UTF_8))
                .header("Content-Type", tipo)
                .header("Cache-Control", "no-cache");
    }

    private static byte[] leerBytes(String recurso) {
        try (InputStream entrada = InstaladorController.class.getResourceAsStream(recurso)) {
            if (entrada == null) {
                throw new HttpException(503, "el instalador no está empaquetado: " + recurso);
            }
            return entrada.readAllBytes();
        } catch (IOException cause) {
            throw new HttpException(500, "no se pudo leer " + recurso, cause);
        }
    }
}
