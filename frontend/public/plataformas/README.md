# Plataformas de instalación

Logos vectoriales para indicar las descargas y comandos disponibles por sistema operativo.

| Sistema | Archivo público | Referencia desde React |
| --- | --- | --- |
| Windows | `windows.svg` | `/plataformas/windows.svg` |
| macOS | `macos.svg` | `/plataformas/macos.svg` |
| Linux | `linux.svg` | `/plataformas/linux.svg` |

Ejemplo:

```jsx
<img src="/plataformas/windows.svg" alt="Windows" />
<img src="/plataformas/macos.svg" alt="macOS" />
<img src="/plataformas/linux.svg" alt="Linux" />
```

`windows.svg` usa `currentColor`; por eso puede adoptar el color cian del diseño con `color: var(--acento)`. Los otros dos SVG son monocromáticos y se pueden colorear mediante CSS si se cargan como contenido SVG, o usando `filter` si se usan como `<img>`.

Los archivos de Apple y Linux se obtuvieron de Simple Icons (CC0); el de Windows, de Bootstrap Icons (MIT). Los nombres y emblemas pertenecen a sus respectivos titulares; se incluyen solo para identificar la plataforma compatible.
