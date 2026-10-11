# Plan: Vyte — Reproductor de música local para Chromebook

> Documento de planificación. Recoge las decisiones tomadas y la hoja de ruta para
> construir el reproductor de música local de **Vyte**, distribuido como extensión
> de Chrome (Plasmo) y pensado para Chromebooks.

---

## 1. Visión general

Vyte es una extensión de Chrome que funciona como **reproductor de música local**:
lee archivos de audio del dispositivo del usuario (sin subirlos a ningún servidor),
los cataloga en una librería y los reproduce con una interfaz moderna.

Objetivos principales:

- **Local y privado**: la música no sale del equipo; solo se leen los archivos.
- **Aspecto de app**: se abre en una **ventana independiente** (sin barra del
  navegador), no como una pestaña cualquiera.
- **Instalable como extensión**: distribución local (`.crx` / unpacked) y
  publicación en la Chrome Web Store.
- **Diseño moderno**: Fluent UI v9 (React) siguiendo el Fluent Design System.

### Stack elegido

| Capa | Tecnología | Notas |
| --- | --- | --- |
| Framework de extensión | **Plasmo** (`plasmo@0.90.5`) | MV3, páginas, service worker, mensajería |
| UI | **React 18** | Ya presente |
| Componentes | **`@fluentui/react-components`** (Fluent v9) | Reemplaza a `@fluentui/web-components` |
| Iconos | `@fluentui/react-icons` | |
| Estado | `zustand` | Estado compartido entre UI y control |
| Formato/Lint | **Biome** (`@biomejs/biome`) | Sustituye a Prettier (ya migrado) |
| Mensajería | `@plasmohq/messaging` | Comunicación UI ↔ SW ↔ offscreen |
| Metadatos | `music-metadata` | Build de navegador (tags + carátulas) |
| Persistencia | **IndexedDB** (`idb`) | Handles, índice de pistas, carátulas |
| Ajustes | `@plasmohq/storage` | Preferencias simples (tema, atajos) |

---

## 2. Decisiones fijadas

1. **Librería de UI**: `@fluentui/react-components` (Fluent v9, hecho para React).
   Se **elimina** `@fluentui/web-components` (custom elements) por su fricción con
   React 18 (wrappers, mapeo de props/eventos).
2. **Apertura del reproductor**: **ventana tipo app** mediante
   `chrome.windows.create({ type: "popup" })` disparada desde el ícono de la
   extensión. El popup no sirve para reproducir porque se cierra al perder foco.
3. **Reproducción continua**: **offscreen document + service worker**. La música
   sigue sonando al cerrar la ventana.
4. **Distribución**: primero **local** (unpacked / `.crx`), luego **Chrome Web Store**.
5. **Formatos soportados**: `mp3, aac, m4a, ogg, opus, flac, wav` (los que Chrome
   reproduce de forma nativa).
6. **Solo reproducción**: se leen los tags, **no** se editan los archivos.
7. **Extras prioritarios**: **búsqueda y orden**, **playlists y favoritos**.

---

## 3. Alcance

### Incluye

- Reproductor de música local, solo lectura.
- Formatos: `mp3, aac, m4a, ogg, opus, flac, wav`.
- UI Fluent v9 en ventana tipo app.
- Audio continuo (offscreen + service worker) con Media Session y teclas multimedia.
- Librería persistente (File System Access API + IndexedDB).
- Índice con metadatos y carátulas.
- Búsqueda, orden, playlists y favoritos.

### Fuera de alcance (por ahora)

- Edición de tags (escritura en archivos).
- Decodificación de formatos no nativos (ALAC, WMA, etc.).
- Visualizador, ecualizador, letras, i18n.
- Sincronización en la nube o streaming remoto.

---

## 4. Arquitectura

Reparto de responsabilidades entre los tres contextos de la extensión:

- **Service worker** (`background.ts`)
  - Abre/cierra la ventana del reproductor.
  - Registra los atajos (`chrome.commands`: play/pause/next/prev).
  - Crea y gestiona el **offscreen document**.
  - **No** reproduce audio.
- **Offscreen document** (`tabs/offscreen.tsx`)
  - Es el **host único de audio**.
  - Lee los `FileSystemHandle` desde IndexedDB (mismo origen
    `chrome-extension://<id>`).
  - Monta `<audio>` / Web Audio API y la **Media Session API**.
  - Mantiene el estado real de reproducción (el SW puede dormir en MV3).
- **UI** (`tabs/player.tsx`)
  - Solo **envía comandos** (play, pause, seek, next…) y **recibe estado**.
  - **No** reproduce audio directamente.

### Flujo de datos

```
                 comando                      comando
   UI (player) ───────────▶  SW (background) ───────────▶  Offscreen (audio)
        ▲                          │                              │
        └────────── estado ◀───────┴──────────── estado ◀─────────┘
```

### Punto de riesgo a validar

El permiso de **File System Access** es por origen, así que el offscreen (mismo
origen que la ventana) **debería** poder leer los handles ya autorizados.
- **Si funciona**: el offscreen lee la librería directamente.
- **Plan B**: la ventana UI pre-autoriza (gesto del usuario) y el offscreen lee solo
  tras la concesión.

> Validar esto temprano: es lo más arriesgado del diseño (fase 5).

---

## 5. Acceso a archivos locales

Una extensión no puede leer el disco libremente. La estrategia es:

1. **File System Access API** — `showDirectoryPicker()` para que el usuario elija su
   carpeta de música una sola vez.
2. **Persistir los handles en IndexedDB** — los `FileSystemHandle` **no** se pueden
   guardar en `chrome.storage`; IndexedDB es el único sitio válido.
3. **Reautorización** — tras reiniciar Chrome puede pedirse reautorizar
   (`queryPermission` / `requestPermission`). Hay que manejar el re-prompt con
   elegancia, no como un error.
4. **Streaming bajo demanda** — no se copia el audio; se lee el archivo cuando toca
   (importante para librerías grandes).
5. **Índice y carátulas** — los metadatos y las carátulas (como `Blob`) se guardan en
   IndexedDB.

> `chrome.fileSystem` **no** aplica: era de Chrome Apps, ya obsoleto.

---

## 6. Estructura de archivos (propuesta)

```
vyte/
├── popup.tsx                 # Botón "Abrir reproductor" (o mini-control)
├── tabs/
│   ├── player.tsx            # UI principal (ventana tipo app)
│   └── offscreen.tsx         # Host de audio (offscreen document)
├── background.ts             # SW: ventana, comandos, offscreen
├── background/messages/      # Handlers de mensajería (play, pause, seek, library…)
├── options.tsx               # Carpeta de música, tema, atajos
├── src/
│   ├── components/           # PlayerBar, Library, Playlist, Queue
│   ├── audio/                # Motor (Web Audio API), cola
│   ├── library/              # File picker, persistencia, escaneo
│   ├── metadata/             # Tags + carátulas (music-metadata)
│   ├── storage/              # IndexedDB (handles/tracks/art) + settings
│   └── messaging/            # Tipos compartidos
├── biome.json
├── tsconfig.json
└── docs/
    └── plan-reproductor-musica.md
```

> Plasmo mapea el alias `~` a la raíz del proyecto: se importa como `~src/audio/...`.

---

## 7. Manifest y permisos

Configuración en el campo `manifest` de `package.json`:

```json
"manifest": {
  "permissions": ["storage", "unlimitedStorage", "offscreen"],
  "commands": {
    "play-pause": { "suggested_key": { "default": "MediaPlayPause" } },
    "next-track": { "suggested_key": { "default": "MediaNextTrack" } },
    "prev-track": { "suggested_key": { "default": "MediaPrevTrack" } }
  }
}
```

Acciones:

- **Quitar** `host_permissions: ["https://*/*"]`: no se necesita para un reproductor
  local y empeora la revisión de la Chrome Web Store (salvo que se quieran carátulas
  remotas, que no es el caso).
- **Añadir** `offscreen` para el host de audio.
- **Añadir** `unlimitedStorage` para índices y carátulas grandes.

---

## 8. Fases de construcción

| # | Fase | Entregable | Criterio de "hecho" |
| :-: | --- | --- | --- |
| 1 | **Base** | Quitar permisos innecesarios; Fluent v9 + `FluentProvider` con tema claro/oscuro; ventana tipo app | El ícono abre la ventana con el shell Fluent |
| 2 | **Librería** | `showDirectoryPicker` + handles en IndexedDB + escaneo + lista | Eliges una carpeta y ves tu música tras reiniciar Chrome |
| 3 | **Metadatos** | Tags + carátulas con `music-metadata` | La lista muestra artista/álbum/portada |
| 4 | **Reproducción** | Motor de audio, cola/playlist, seek, Media Session | Suena y responden las teclas multimedia |
| 5 | **Continuidad** | Offscreen + SW + comandos + estado compartido | Cierras la ventana, sigue sonando; reabres y continúa |
| 6 | **Extras + packaging** | Búsqueda/orden, playlists/favoritos; build/package y `.crx` local | Funciona el flujo completo y se empaqueta |

### Dependencias entre fases

```
1 ──▶ 2 ──▶ 3 ──▶ 4 ──▶ 5
                  └──▶ 6  (se puede intercalar tras la 4)
```

Las fases **1 a 4** son secuenciales. La **5** depende de la 4. La **6** puede
intercalarse tras la 4.

---

## 9. Riesgos y consideraciones

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| Reautorización de la carpeta tras reiniciar Chrome | Medio | Manejar el re-prompt con UI clara; re-validar permisos al arrancar |
| Permiso FS desde el offscreen | Alto | Validar pronto (fase 5); plan B: pre-autorizar desde la UI |
| Formatos no nativos (ALAC, WMA) | Bajo | Fuera de alcance; avisar al usuario si el archivo no reproduce |
| El service worker duerme (MV3) | Medio | El estado real vive en el offscreen, no en el SW |
| ChromeOS: fijar el ícono en el shelf es manual | Bajo | Documentar el paso; no hay lanzador de app nativo |
| Escaneo lento en librerías grandes | Medio | Parseo por lotes / `requestIdleCallback`; cachear metadatos |
| Instalación en Chromebooks gestionadas | Medio | `.crx` suele requerir política enterprise para forzar instalación |

### Sobre "se abre como app" en ChromeOS

- Una extensión **no** crea un ítem propio en el lanzador como una app nativa.
- Lo realista es **fijar el ícono en la bandeja/shelf** y que abra una **ventana
  independiente** (`type: "popup"`), lo que da la sensación de app.
- Distribución local en equipos gestionados suele requerir **política enterprise**.

---

## 10. Estado actual del repositorio

- Proyecto Plasmo inicializado y **compilando** (`bun run build`).
- **Biome** configurado en lugar de Prettier:
  - `biome.json` con formato equivalente al anterior `.prettierrc.mjs`.
  - Organización de imports con `assist.actions.source.organizeImports`.
  - Scripts: `check`, `check:write`, `format`, `format:check`, `lint`, `ci`.
- `.prettierrc.mjs` y `package-lock.json` eliminados; gestor de paquetes: **bun**.
- Fluent actualmente instalado: `@fluentui/web-components` (a sustituir en la fase 1).

---

## 11. Primer commit de implementación (fase 1)

Al salir de modo Plan, el primer paso será:

1. Sustituir `@fluentui/web-components` por `@fluentui/react-components`.
2. Añadir `@fluentui/react-icons` y `@plasmohq/messaging`.
3. Quitar `host_permissions` y preparar `permissions`/`commands` en `package.json`.
4. Crear el shell de la ventana (`tabs/player.tsx`) con `FluentProvider` (tema
   claro/oscuro).
5. Crear `background.ts` que abre la ventana tipo app desde el ícono.
