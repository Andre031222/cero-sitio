# Las fuentes

Las dos son de terceros y se redistribuyen bajo **SIL Open Font License 1.1**, que exige que
la licencia viaje con el archivo. Por eso el `.OFL.txt` está al lado de cada `.woff2` y se
sirve como el resto: `/fuentes/jetbrains-mono-latin.OFL.txt`.

| Fuente | Uso | Origen | Licencia |
|---|---|---|---|
| JetBrains Mono | `--mono`: código, terminal, rótulos | [JetBrains/JetBrainsMono](https://github.com/JetBrains/JetBrainsMono) | [OFL 1.1](jetbrains-mono-latin.OFL.txt) |
| Source Serif 4 | Texto corrido de la documentación | [adobe-fonts/source-serif](https://github.com/adobe-fonts/source-serif) | [OFL 1.1](source-serif-4-latin.OFL.txt) |

Los `.woff2` son subconjuntos de latín, no las fuentes completas: 28 KB cada uno en vez de
varios cientos. La OFL permite modificarlas y redistribuirlas; lo que no permite es venderlas
por separado ni usar los nombres reservados —«Source» lo es— para una versión modificada.

Que Cero declare **cero dependencias** se refiere a los jar de Java en ejecución. Esto es la
página web, que es otra cosa y sí usa código y tipografías de terceros.
