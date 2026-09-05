package dev.ginit.ceroweb;

import cero.core.Get;
import cero.core.Query;
import cero.core.Result;
import cero.core.Route;
import cero.http.HttpException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Descargar los jar: uno suelto, o la selección entera en un zip.
 *
 * <p>Los artefactos viajan dentro del jar del sitio, en {@code /artefactos}, puestos ahí al
 * empaquetar. Leerlos del repositorio local de Maven habría atado el sitio a la máquina donde se
 * compiló, y en el servidor las descargas darían 503 sin avisar a nadie.
 */
@Route("/api")
public class DescargaController {

    static final String VERSION = Version.ACTUAL;

    /**
     * El jar de un módulo.
     *
     * <p>El nombre se valida contra el catálogo antes de construir la ruta. No es paranoia: si se
     * concatenara lo que llega en la URL, un {@code ../..} leería cualquier recurso del jar.
     */
    @Get("/jar")
    public Object jar(@Query("modulo") String modulo) {
        return Result.download(leer(exigir(modulo)), nombreJar(modulo), "application/java-archive");
    }

    /** La selección entera en un zip, con las dependencias ya resueltas dentro. */
    @Get("/zip")
    public Object zip(@Query("modulos") String lista) {
        if (lista == null || lista.isBlank()) {
            throw new HttpException(400, "hace falta ?modulos=cero-core,cero-data");
        }

        Set<String> resueltos = new LinkedHashSet<>();
        List<String> desconocidos = new ArrayList<>();
        for (String pedido : lista.split(",")) {
            String nombre = pedido.trim();
            if (nombre.isEmpty()) {
                continue;
            }
            if (!ModulosController.existe(nombre)) {
                desconocidos.add(nombre);
                continue;
            }
            ModulosController.arrastrar(nombre, resueltos);
        }
        if (!desconocidos.isEmpty()) {
            throw new HttpException(422, "módulo desconocido: " + String.join(", ", desconocidos));
        }
        if (resueltos.isEmpty()) {
            throw new HttpException(400, "no se pidió ningún módulo");
        }

        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(salida)) {
            for (String modulo : resueltos) {
                zip.putNextEntry(new ZipEntry(nombreJar(modulo)));
                zip.write(leer(modulo));
                zip.closeEntry();
            }
            // Un LEEME dentro: quien abra el zip dentro de un mes no se acuerda de qué eligió
            // ni de qué declarar, y lo que hay son seis jar sin contexto.
            zip.putNextEntry(new ZipEntry("LEEME.txt"));
            zip.write(leeme(resueltos).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            zip.closeEntry();
        } catch (IOException cause) {
            throw new HttpException(500, "no se pudo armar el zip", cause);
        }

        return Result.download(salida.toByteArray(), nombreZip(resueltos), "application/zip");
    }

    private static String exigir(String modulo) {
        if (modulo == null || !ModulosController.existe(modulo)) {
            throw new HttpException(422, "módulo desconocido: " + modulo);
        }
        return modulo;
    }

    private static byte[] leer(String modulo) {
        String recurso = "/artefactos/" + nombreJar(modulo);
        try (InputStream entrada = DescargaController.class.getResourceAsStream(recurso)) {
            if (entrada == null) {
                throw new HttpException(503, "el artefacto no está empaquetado: " + modulo);
            }
            return entrada.readAllBytes();
        } catch (IOException cause) {
            throw new HttpException(500, "no se pudo leer el artefacto: " + modulo, cause);
        }
    }

    private static String nombreJar(String modulo) {
        return modulo + "-" + VERSION + ".jar";
    }

    /**
     * Un nombre que diga qué hay dentro. Seis zip llamados {@code cero.zip} en la carpeta de
     * descargas son seis zip indistinguibles.
     */
    private static String nombreZip(Set<String> resueltos) {
        if (resueltos.size() == ModulosController.cuantos()) {
            return "cero-" + VERSION + "-completo.zip";
        }
        return "cero-" + VERSION + "-" + resueltos.size() + "-modulos.zip";
    }

    private static String leeme(Set<String> modulos) {
        StringBuilder sb = new StringBuilder();
        sb.append("Cero ").append(VERSION).append("\n");
        sb.append("https://cero.ginit.dev\n\n");
        sb.append("Este zip trae:\n");
        for (String m : modulos) {
            sb.append("  - ").append(nombreJar(m)).append('\n');
        }
        sb.append("\nLas dependencias entre módulos ya están resueltas: si pediste cero-view,\n");
        sb.append("dentro van también cero-core y cero-http, que es lo que necesita.\n");
        sb.append("\nPara usarlos con Maven, instálalos en tu repositorio local y decláralos:\n\n");
        for (String m : modulos) {
            sb.append("  mvn install:install-file -Dfile=").append(nombreJar(m))
              .append(" -DgroupId=dev.ginit.cero -DartifactId=").append(m)
              .append(" -Dversion=").append(VERSION).append(" -Dpackaging=jar\n");
        }
        sb.append('\n').append(ModulosController.pomDe(modulos)).append('\n');
        sb.append("\nO, si prefieres compilarlo tú desde el código:\n");
        sb.append("  git clone https://github.com/ginit-dev/cero && cd cero && ./cero install\n");
        return sb.toString();
    }
}
