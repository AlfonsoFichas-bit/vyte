## Context

Vyte es una extensión de Chrome inicializada con Plasmo (`plasmo@0.90.5`, MV3) con
React 18 y TypeScript. Hoy solo contiene el andamiaje de ejemplo (`popup.tsx`) y ya
tiene Biome configurado en lugar de Prettier. El objetivo es convertirla en un
reproductor de música **local** para Chromebooks, con aspecto de app y sin subir la
música a la nube.

Restricciones relevantes del entorno:

- Una extensión **no** puede leer el sistema de archivos libremente; se necesita
  consentimiento explícito del usuario.
- En MV3 el **service worker se suspende**, por lo que no sirve como host de estado ni
  de audio.
- Un **popup** se cierra al perder foco; no es viable para reproducir.
- ChromeOS admite la File System Access API y muestra controles multimedia del sistema.

## Goals / Non-Goals

**Goals:**

- Reproducir audio local desde una carpeta elegida por el usuario, de forma recursiva.
- Recordar la carpeta y la biblioteca entre sesiones.
- Mantener la reproducción al cerrar la ventana del reproductor.
- Ofrecer una UI moderna (Fluent v9) en una ventana tipo app, con tema claro/oscuro.
- Soportar búsqueda, orden, listas de reproducción y favoritos.

**Non-Goals:**

- Edición de tags o escritura en los archivos del usuario.
- Decodificación de formatos no nativos (ALAC, WMA, etc.).
- Streaming remoto, cuentas de usuario o sincronización en la nube.
- Visualizador, ecualizador, letras e internacionalización en esta iteración.

## Decisions

### D1: File System Access API + IndexedDB para la librería

El usuario elige su carpeta con `showDirectoryPicker()`; se persiste el
`FileSystemDirectoryHandle` en **IndexedDB**.

- **Por qué**: es la única vía soportada en extensiones para acceder a carpetas
  locales con persistencia.
- **Alternativas descartadas**: `chrome.fileSystem` (era de Chrome Apps, obsoleto);
  `<input type="file" webkitdirectory>` (no persiste, obliga a reelegir cada vez);
  copiar los archivos a la extensión (desperdicia espacio y es lento).
- **Nota**: los handles **no** se pueden guardar en `chrome.storage`; por eso IndexedDB.

### D2: Offscreen document como host único de audio

El audio se reproduce en un **offscreen document** creado por el service worker; la
ventana UI solo envía comandos.

- **Por qué**: da reproducción continua al cerrar la ventana y un estado estable,
  independiente del ciclo de vida del service worker.
- **Alternativas descartadas**: reproducir en la ventana (se corta al cerrarla);
  reproducir en el service worker (MV3 no permite audio y se suspende).

### D3: Comunicación por mensajería con `@plasmohq/messaging`

La UI y el offscreen se comunican con el SW mediante handlers en
`background/messages/*`.

- **Por qué**: tipado y patrón recomendado por Plasmo.
- **Nota**: los `Blob` no cruzan mensajes (serialización JSON); el offscreen **lee del
  IndexedDB directamente** en lugar de recibir archivos por mensaje.

### D4: Ventana tipo app con `chrome.windows.create`

El ícono abre `chrome.windows.create({ type: "popup" })`; si la ventana ya existe, se
enfoca en lugar de duplicarla.

- **Por qué**: es lo más cercano a una app en ChromeOS (sin barra del navegador).
- **Alternativas descartadas**: pestaña normal (menos "app"); popup del action
  (se cierra al perder foco).

### D5: Fluent UI v9 (`@fluentui/react-components`)

Se usa la librería React de Fluent v9 con `FluentProvider` y tokens de diseño.

- **Por qué**: integración natural con React 18 y temas claro/oscuro.
- **Alternativa descartada**: `@fluentui/web-components` (custom elements) exige
  wrappers y mapeo manual de props/eventos en React 18.

### D6: Metadatos con `music-metadata` (build navegador)

Se extraen tags y carátulas y se cachean en IndexedDB.

- **Por qué**: soporta múltiples formatos (mp3/flac/ogg/m4a…), incluidas carátulas.
- **Alternativa descartada**: `jsmediatags` (menos mantenido y con menos formatos).

### D7: Persistencia y estado

- **IndexedDB** (`idb`) para handles, índice de pistas y carátulas.
- **`@plasmohq/storage`** para preferencias simples (tema, carpeta activa, atajos).
- **`zustand`** para el estado de la UI.

## Risks / Trade-offs

- **Requiere reautorizar la carpeta tras reiniciar Chrome** → manejar el re-prompt con
  UI clara y re-validar permisos al arrancar (`queryPermission` / `requestPermission`).
- **Permiso FS leído desde el offscreen (mismo origen)** → validar pronto con un
  prototipo; plan B: pre-autorizar desde la ventana UI antes de que el offscreen lea.
- **Service worker se suspende (MV3)** → el estado real vive en el offscreen; el SW solo
  enruta comandos y crea el offscreen bajo demanda.
- **Escaneo lento en librerías grandes** → indexar por lotes / `requestIdleCallback` y
  cachear metadatos para no reparsear.
- **Formatos no nativos (ALAC/WMA)** → fuera de alcance; avisar al usuario cuando un
  archivo no sea reproducible.
- **ChromeOS: el ícono debe fijarse manualmente en el shelf** → documentar el paso; no
  existe un lanzador de app nativo para extensiones.
- **Instalación en Chromebooks gestionadas** → un `.crx` puede requerir política
  enterprise; dejar claro el método de instalación por entorno.

## Migration Plan

1. **Fase 1 (Base)** — limpiar manifest (`host_permissions`), sustituir Fluent
   web-components por react-components, crear shell de ventana y `background.ts`.
2. **Fase 2 (Librería)** — picker + persistencia + escaneo + índice.
3. **Fase 3 (Metadatos)** — tags y carátulas con caché.
4. **Fase 4 (Reproducción)** — motor, cola, seek y Media Session.
5. **Fase 5 (Continuidad)** — offscreen + SW + comandos + sincronización de estado.
6. **Fase 6 (Extras + packaging)** — búsqueda/orden, playlists/favoritos, empaquetado.

**Rollback**: cada fase es incremental y autocontenida; revertir a la fase anterior no
deja datos corruptos porque toda la persistencia vive en IndexedDB y se puede
reconstruir reindexando la carpeta.

## Open Questions

- ¿El permiso FS del mismo origen basta para que el **offscreen** lea los handles sin
  gesto del usuario? (validar en fase 5).
- ¿Conviene indexar metadatos en un **Web Worker** dentro del offscreen para no
  bloquear el audio en librerías muy grandes?
- ¿Estratega de reindexado: manual (botón "volver a escanear") o automática al detectar
  cambios de la carpeta?
