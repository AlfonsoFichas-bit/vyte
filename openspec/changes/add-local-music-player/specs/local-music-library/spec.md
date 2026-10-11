## ADDED Requirements

### Requirement: Selección de carpeta de música
El sistema SHALL permitir al usuario seleccionar una carpeta local de música mediante la File System Access API (`showDirectoryPicker`), iniciada siempre por un gesto del usuario.

#### Scenario: El usuario elige una carpeta válida
- **WHEN** el usuario pulsa "Elegir carpeta" y selecciona un directorio en el selector del sistema
- **THEN** el sistema registra el `FileSystemDirectoryHandle` y comienza a indexar los archivos de audio de esa carpeta

#### Scenario: El usuario cancela el selector
- **WHEN** el usuario cierra el selector sin elegir carpeta
- **THEN** el sistema mantiene la librería anterior sin cambios y no muestra error

### Requirement: Persistencia del acceso a la carpeta
El sistema SHALL persistir los `FileSystemDirectoryHandle` en IndexedDB y SHALL reutilizarlos entre sesiones sin exigir que el usuario vuelva a elegir la carpeta.

#### Scenario: Reapertura con permiso vigente
- **WHEN** el usuario reabre el reproductor y el permiso de la carpeta sigue concedido
- **THEN** el sistema carga la librería automáticamente desde los handles persistidos

#### Scenario: Permiso revocado tras reinicio
- **WHEN** el usuario reabre el reproductor y el permiso de la carpeta ya no está concedido
- **THEN** el sistema solicita reautorizar la carpeta con un gesto del usuario antes de leer archivos

### Requirement: Formatos de audio soportados
El sistema SHALL indexar únicamente archivos con extensión `mp3`, `aac`, `m4a`, `ogg`, `opus`, `flac` o `wav`, recorriendo la carpeta seleccionada de forma recursiva.

#### Scenario: Archivo con formato soportado
- **WHEN** el escaneo encuentra un archivo `.flac`
- **THEN** el archivo se añade al índice de la librería

#### Scenario: Archivo con formato no soportado
- **WHEN** el escaneo encuentra un archivo `.wma`
- **THEN** el archivo se omite y no aparece en la librería

### Requirement: Índice de la librería
El sistema SHALL almacenar el índice de pistas (referencia al archivo, metadatos y carátula) en IndexedDB y SHALL permitir recargarlo sin volver a escanear el sistema de archivos.

#### Scenario: Carga desde índice
- **WHEN** el usuario abre el reproductor y ya existe un índice para la carpeta
- **THEN** el sistema muestra la librería desde IndexedDB sin recorrer de nuevo el sistema de archivos

### Requirement: Acceso de solo lectura
El sistema SHALL leer los archivos de audio en modo solo lectura y MUST NOT modificar ni escribir en los archivos del usuario.

#### Scenario: Reproducción sin modificaciones
- **WHEN** el usuario reproduce una canción
- **THEN** el archivo original permanece sin cambios y no se escribe ningún dato en la carpeta de música
