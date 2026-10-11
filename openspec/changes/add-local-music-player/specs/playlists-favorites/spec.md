## ADDED Requirements

### Requirement: Gestión de listas de reproducción
El sistema SHALL permitir crear, renombrar y eliminar listas de reproducción.

#### Scenario: Crear una lista de reproducción
- **WHEN** el usuario crea una lista de reproducción con un nombre
- **THEN** la lista aparece vacía y queda disponible para añadir pistas

#### Scenario: Eliminar una lista de reproducción
- **WHEN** el usuario elimina una lista de reproducción
- **THEN** la lista desaparece y no afecta a los archivos de audio originales

### Requirement: Añadir y quitar pistas de una lista
El sistema SHALL permitir añadir pistas de la biblioteca a una lista de reproducción y quitarlas de ella.

#### Scenario: Añadir una pista a una lista
- **WHEN** el usuario añade una pista de la biblioteca a una lista de reproducción
- **THEN** la pista aparece dentro de la lista

### Requirement: Favoritos
El sistema SHALL permitir marcar y desmarcar pistas como favoritas.

#### Scenario: Marcar una pista como favorita
- **WHEN** el usuario marca una pista como favorita
- **THEN** la pista queda marcada y aparece en la vista de favoritos

### Requirement: Persistencia de listas y favoritos
El sistema SHALL persistir las listas de reproducción y los favoritos localmente entre sesiones.

#### Scenario: Persistencia entre sesiones
- **WHEN** el usuario cierra y reabre el reproductor
- **THEN** sus listas de reproducción y favoritos siguen disponibles
