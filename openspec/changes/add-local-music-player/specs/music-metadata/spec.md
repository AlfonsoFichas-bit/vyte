## ADDED Requirements

### Requirement: Extracción de metadatos
El sistema SHALL extraer de cada archivo de audio el título, artista, álbum y duración a partir de sus tags.

#### Scenario: Archivo con tags completos
- **WHEN** el escaneo procesa un archivo con tags de título, artista y álbum
- **THEN** la pista muestra esos valores en la librería

#### Scenario: Archivo sin tags
- **WHEN** el escaneo procesa un archivo sin tags
- **THEN** el sistema usa el nombre del archivo (sin extensión) como título y marca artista y álbum como desconocidos

### Requirement: Extracción de carátula
El sistema SHALL extraer la carátula incrustada cuando exista y SHALL almacenarla asociada a la pista.

#### Scenario: Carátula incrustada presente
- **WHEN** un archivo contiene una imagen incrustada
- **THEN** el sistema la guarda y la muestra en la lista y en la vista de reproducción

#### Scenario: Archivo sin carátula
- **WHEN** un archivo no contiene imagen incrustada
- **THEN** el sistema muestra un marcador de posición genérico

### Requirement: Caché de metadatos
El sistema SHALL cachear los metadatos y carátulas extraídos para no reprocesar los mismos archivos en cada arranque.

#### Scenario: Reutilización de la caché
- **WHEN** el usuario reabre el reproductor y los archivos no han cambiado
- **THEN** el sistema usa los metadatos en caché y no vuelve a parsear los archivos
