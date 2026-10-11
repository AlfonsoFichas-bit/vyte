## 1. Base y dependencias

- [x] 1.1 Quitar `@fluentui/web-components` y añadir `@fluentui/react-components` y `@fluentui/react-icons`
- [x] 1.2 Añadir `@plasmohq/messaging`, `music-metadata`, `idb` y `zustand`
- [x] 1.3 Quitar `host_permissions` y añadir `permissions` (`storage`, `unlimitedStorage`, `offscreen`) y `commands` en `package.json`
- [x] 1.4 Envolver la app en `FluentProvider` con tema claro/oscuro según el sistema
- [x] 1.5 Crear `tabs/player.tsx` como shell de la ventana (biblioteca + barra de reproducción)
- [x] 1.6 Crear `background.ts` que abra la ventana con `chrome.windows.create({ type: "popup" })` y enfoque la existente si ya está abierta
- [x] 1.7 Convertir `popup.tsx` en un botón "Abrir reproductor"
- [x] 1.8 Verificar la fase con `bun run build` y `bun run check`

## 2. Librería local

- [x] 2.1 Definir el esquema de IndexedDB (handles, tracks y carátulas) con `idb`
- [x] 2.2 Implementar `showDirectoryPicker` y guardar el `FileSystemDirectoryHandle`
- [x] 2.3 Revalidar permisos al arrancar (`queryPermission` / `requestPermission`)
- [x] 2.4 Implementar el escaneo recursivo filtrando las extensiones soportadas
- [x] 2.5 Persistir el índice de pistas y recargarlo sin reescanear
- [x] 2.6 Construir la UI de selección de carpeta y el estado de reautorización
- [x] 2.7 Probar: reelegir carpeta, reiniciar Chrome y permiso revocado

## 3. Metadatos

- [x] 3.1 Integrar `music-metadata` (build navegador) para leer los tags
- [x] 3.2 Usar el nombre del archivo como título cuando no haya tags
- [x] 3.3 Extraer la carátula y guardarla como Blob en IndexedDB
- [x] 3.4 Cachear los metadatos y evitar reparsear archivos sin cambios
- [x] 3.5 Mostrar carátula (o marcador de posición) en la lista y en la barra

## 4. Reproducción

- [x] 4.1 Implementar el motor de audio y el estado de la cola (`zustand`)
- [x] 4.2 Implementar play/pause/seek con barra de progreso
- [x] 4.3 Implementar siguiente/anterior y autoavance al terminar la pista
- [x] 4.4 Implementar el control de volumen
- [x] 4.5 Integrar Media Session (metadatos y action handlers)

## 5. Continuidad en segundo plano (offscreen)

- [x] 5.1 Crear `tabs/offscreen.tsx` como host de audio
- [x] 5.2 Crear y cerrar el offscreen document desde el SW (`chrome.offscreen.createDocument`)
- [x] 5.3 Definir handlers en `background/messages/*` para los comandos (play, pause, seek, next…)
- [x] 5.4 Mover el motor de audio al offscreen y sincronizar el estado con la UI
- [x] 5.5 Registrar `chrome.commands` (teclas multimedia) y enrutarlos al offscreen
- [x] 5.6 Validar la lectura de handles FS desde el offscreen; si falla, pre-autorizar desde la UI
- [x] 5.7 Probar: cerrar la ventana y confirmar que sigue sonando; reabrir y continuar

## 6. Búsqueda y ordenación

- [x] 6.1 Implementar el filtro por texto (título, artista y álbum)
- [x] 6.2 Mostrar un estado vacío cuando no haya resultados
- [x] 6.3 Implementar el orden por título/artista/álbum en ascendente y descendente

## 7. Listas de reproducción y favoritos

- [x] 7.1 Definir el modelo y la persistencia de las listas de reproducción
- [x] 7.2 Crear, renombrar y eliminar listas de reproducción
- [x] 7.3 Añadir y quitar pistas de una lista
- [x] 7.4 Marcar y desmarcar favoritos, con vista de favoritos
- [x] 7.5 Verificar la persistencia entre sesiones

## 8. Ajustes y empaquetado

- [x] 8.1 Crear la página de ajustes (`options.tsx`): carpeta, tema y atajos
- [x] 8.2 Reindexar la librería al cambiar de carpeta
- [x] 8.3 Verificar `bun run build` y `bun run package`
- [x] 8.4 Generar el `.crx`/unpacked para instalación local y documentar el proceso
- [x] 8.5 Preparar los metadatos para la publicación en la Chrome Web Store
