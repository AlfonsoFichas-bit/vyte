## Why

Vyte necesita convertirse en un reproductor de música **local** para Chromebooks:
hoy el proyecto es solo el andamiaje de Plasmo con un popup de ejemplo. Los usuarios
de ChromeOS no tienen una app de escritorio para gestionar y reproducir su propia
biblioteca musical sin subirla a la nube. Este cambio introduce esa capacidad como
extensión de Chrome, manteniendo todo el audio en el dispositivo y ofreciendo una
experiencia moderna con Fluent UI.

## What Changes

- Nueva **librería musical local** basada en File System Access API: el usuario elige
  su carpeta de música y la extensión la recuerda entre sesiones.
- **Extracción de metadatos** (título, artista, álbum, duración, carátula) desde los
  archivos de audio.
- **Motor de reproducción** con cola/playlist, play/pause, seek, siguiente/anterior.
- **Reproducción en segundo plano** mediante un *offscreen document* y el service
  worker, de modo que la música siga sonando al cerrar la ventana del reproductor.
- **Ventana tipo app** que se abre desde el ícono de la extensión (sin barra del
  navegador), con una **UI Fluent v9** en tema claro/oscuro.
- **Búsqueda y orden** de la biblioteca.
- **Playlists y favoritos** persistidos localmente.
- Integración con **Media Session** y atajos de teclado (teclas multimedia).
- Ajustes de la extensión: carpeta de música, tema y atajos.
- **BREAKING**: se retira `host_permissions: ["https://*/*"]` del manifest (no se
  necesita para reproducción local) y se reemplaza la dependencia
  `@fluentui/web-components` por `@fluentui/react-components`.
- La distribución se prepara para instalación local (`.crx`/unpacked) y publicación
  en la Chrome Web Store.

## Capabilities

### New Capabilities

- `local-music-library`: selección de carpeta, persistencia de permisos y handles, y
  escaneo/índice de los archivos de audio locales.
- `music-metadata`: lectura de tags y carátulas de los archivos de audio.
- `audio-playback`: motor de reproducción, cola/playlist y controles de reproducción.
- `background-playback`: reproducción continua al cerrar la ventana (offscreen +
  service worker), Media Session y atajos multimedia.
- `player-ui`: ventana tipo app, shell de Fluent v9, tema claro/oscuro y controles.
- `library-search-sort`: búsqueda por texto y ordenamiento de la biblioteca.
- `playlists-favorites`: listas de reproducción y pistas marcadas como favoritas.

### Modified Capabilities

<!-- Ninguna: openspec/specs/ está vacío, no hay capacidades previas con requisitos. -->

## Impact

- **Código**: `popup.tsx`, `tabs/player.tsx`, `tabs/offscreen.tsx`, `background.ts`,
  `background/messages/*`, `options.tsx`, y nuevo código en `src/` (`components`,
  `audio`, `library`, `metadata`, `storage`, `messaging`).
- **Dependencias**: se añaden `@fluentui/react-components`, `@fluentui/react-icons`,
  `@plasmohq/messaging`, `music-metadata`, `idb`, `zustand`; se elimina
  `@fluentui/web-components`.
- **Manifest**: se quita `host_permissions`; se añaden `storage`, `unlimitedStorage`,
  `offscreen` y `commands`.
- **Persistencia**: nuevo uso de IndexedDB para handles, índice de pistas y carátulas;
  `@plasmohq/storage` para preferencias.
- **Alcance fuera de esta propuesta**: edición de tags, formatos no nativos (ALAC/WMA),
  visualizador, ecualizador, letras e internacionalización.
