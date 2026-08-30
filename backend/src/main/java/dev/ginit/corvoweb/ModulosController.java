package dev.ginit.corvoweb;

import corvo.core.Body;
import corvo.core.Get;
import corvo.core.Post;
import corvo.core.Result;
import corvo.core.Route;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Elegir módulos y saber qué te llevas.
 *
 * <p>La pregunta que trae a alguien a la página de descargas no es «qué módulos hay» sino «qué
 * necesito para lo que quiero hacer, y cuánto pesa». Así que el servidor resuelve las
 * dependencias transitivas, suma el tamaño real y devuelve el trozo de {@code pom.xml} listo
 * para pegar: pedir {@code corvo-view} arrastra {@code corvo-core}, que arrastra
 * {@code corvo-http}, y eso hay que decirlo antes y no después.
 */
@Route("/api")
public class ModulosController {

    /** Un módulo del framework, con lo que hace falta para decidir si lo quieres. */
    public record Modulo(String nombre, String necesita, int clases, int kb, String hace) {
    }

    /** Lo que el navegador manda al elegir. */
    public record Seleccion(List<String> modulos) {
    }

    private static final Map<String, Modulo> CATALOGO = new LinkedHashMap<>();

    static {
        registrar(new Modulo("corvo-http", null, 39, 94,
                "Servidor HTTP/1.1 con un hilo virtual por conexión. TLS recargable, sesiones "
                        + "enchufables, multipart, gzip, estáticos con rangos y WebSocket."));
        registrar(new Modulo("corvo-core", "corvo-http", 66, 160,
                "Rutas, inyección, JSON, validación declarativa, seguridad, métricas, caché, "
                        + "eventos, tareas y OpenAPI."));
        registrar(new Modulo("corvo-view", "corvo-core", 9, 38,
                "Plantillas compiladas con herencia, bucles e inclusión. El escapado HTML es el "
                        + "comportamiento por defecto, no una opción que se olvida."));
        registrar(new Modulo("corvo-data", "corvo-core", 16, 48,
                "JDBC directo sin ORM: pool, transacciones, repositorios y sesiones en tabla."));
        registrar(new Modulo("corvo-adapter-servlet", "corvo-core", 4, 13,
                "Desplegar la misma aplicación dentro de Tomcat 10.1+, para migrar sin salto."));
        registrar(new Modulo("corvo-launcher", null, 1, 9,
                "Empaqueta aplicación y framework en un jar ejecutable con java -jar."));
    }

    private static void registrar(Modulo m) {
        CATALOGO.put(m.nombre(), m);
    }

    @Get("/modulos")
    public Object catalogo() {
        return CATALOGO.values();
    }

    /**
     * Resuelve una selección: añade lo que arrastra cada módulo, suma el peso y arma el
     * {@code pom.xml}. Si piden algo que no existe, se dice cuál en vez de ignorarlo en
     * silencio — un módulo mal escrito que desaparece del resultado es un rato perdido.
     */
    @Post("/seleccion")
    public Object resolver(@Body Seleccion peticion) {
        List<String> pedidos = peticion == null || peticion.modulos() == null
                ? List.of() : peticion.modulos();

        List<String> desconocidos = pedidos.stream().filter(n -> !CATALOGO.containsKey(n)).toList();
        if (!desconocidos.isEmpty()) {
            return Result.json(Map.of(
                    "error", "módulo desconocido",
                    "modulos", desconocidos,
                    "disponibles", CATALOGO.keySet())).status(422);
        }

        Set<String> resueltos = new LinkedHashSet<>();
        for (String nombre : pedidos) {
            arrastrar(nombre, resueltos);
        }

        int kb = resueltos.stream().mapToInt(n -> CATALOGO.get(n).kb()).sum();
        int clases = resueltos.stream().mapToInt(n -> CATALOGO.get(n).clases()).sum();

        Map<String, Object> salida = new LinkedHashMap<>();
        salida.put("pedidos", pedidos);
        salida.put("resueltos", resueltos);
        salida.put("arrastrados", resueltos.stream().filter(n -> !pedidos.contains(n)).toList());
        salida.put("kb", kb);
        salida.put("clases", clases);
        salida.put("pom", pom(resueltos));
        return salida;
    }

    /** ¿Existe ese módulo? Lo usa DescargaController antes de tocar el disco. */
    static boolean existe(String nombre) {
        return CATALOGO.containsKey(nombre);
    }

    /** Cuántos módulos hay en total; sirve para saber si una selección es «todo». */
    static int cuantos() {
        return CATALOGO.size();
    }

    /** El pom de una lista ya resuelta, para meterlo en el LEEME del zip. */
    static String pomDe(java.util.Collection<String> modulos) {
        return pom(new LinkedHashSet<>(modulos));
    }

    /** Mete el módulo y, antes, aquello de lo que depende. */
    static void arrastrar(String nombre, Set<String> dentro) {
        Modulo m = CATALOGO.get(nombre);
        if (m == null || dentro.contains(nombre)) {
            return;
        }
        if (m.necesita() != null) {
            arrastrar(m.necesita(), dentro);
        }
        dentro.add(nombre);
    }

    /**
     * El trozo de pom, ya sin lo redundante: si entra {@code corvo-core}, declarar
     * {@code corvo-http} sobra porque viene solo. Se declara lo que el usuario pidió.
     */
    private static String pom(Set<String> resueltos) {
        List<String> declarables = new ArrayList<>();
        for (String nombre : resueltos) {
            boolean loArrastraOtro = resueltos.stream()
                    .anyMatch(otro -> nombre.equals(CATALOGO.get(otro).necesita()));
            if (!loArrastraOtro) {
                declarables.add(nombre);
            }
        }
        StringBuilder sb = new StringBuilder();
        for (String nombre : declarables) {
            sb.append("<dependency>\n")
              .append("    <groupId>dev.ginit.corvo</groupId>\n")
              .append("    <artifactId>").append(nombre).append("</artifactId>\n")
              .append("    <version>0.4.0</version>\n")
              .append("</dependency>\n");
        }
        return sb.toString().trim();
    }
}
