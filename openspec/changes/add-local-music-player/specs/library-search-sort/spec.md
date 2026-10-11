## ADDED Requirements

### Requirement: Búsqueda en la biblioteca
El sistema SHALL permitir filtrar la biblioteca por texto, coincidiendo con el título, el artista o el álbum.

#### Scenario: Coincidencia por artista
- **WHEN** el usuario escribe parte del nombre de un artista
- **THEN** la lista muestra solo las pistas cuyo artista coincide

#### Scenario: Sin coincidencias
- **WHEN** el texto buscado no coincide con ninguna pista
- **THEN** el sistema muestra un estado vacío indicando que no hay resultados

### Requirement: Ordenamiento de la biblioteca
El sistema SHALL permitir ordenar la biblioteca por título, artista o álbum, de forma ascendente y descendente.

#### Scenario: Ordenar por álbum ascendente
- **WHEN** el usuario selecciona ordenar por álbum de forma ascendente
- **THEN** las pistas se muestran ordenadas por álbum
