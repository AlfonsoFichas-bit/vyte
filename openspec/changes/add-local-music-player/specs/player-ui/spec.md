## ADDED Requirements

### Requirement: Ventana tipo app
El sistema SHALL abrir el reproductor en una ventana independiente sin barra del navegador cuando el usuario active el ícono de la extensión.

#### Scenario: Apertura desde el ícono
- **WHEN** el usuario pulsa el ícono de la extensión
- **THEN** se abre una ventana tipo app con la interfaz del reproductor

#### Scenario: La ventana ya está abierta
- **WHEN** el usuario activa el ícono con la ventana ya abierta
- **THEN** el sistema enfoca la ventana existente en lugar de abrir otra

### Requirement: Tema claro y oscuro
El sistema SHALL mostrar la interfaz con Fluent UI v9 y SHALL adaptar el tema (claro/oscuro) a la preferencia del sistema.

#### Scenario: Preferencia de tema oscuro
- **WHEN** el sistema operativo está en modo oscuro
- **THEN** la interfaz se muestra en tema oscuro

### Requirement: Vista de biblioteca y barra de reproducción
El sistema SHALL presentar la lista de pistas de la biblioteca y una barra de reproducción con los controles y el progreso de la pista actual.

#### Scenario: Estado en reproducción
- **WHEN** hay una pista sonando
- **THEN** la barra de reproducción muestra la pista actual, su carátula y el progreso actualizado

### Requirement: Ajustes de la extensión
El sistema SHALL ofrecer una página de ajustes donde configurar la carpeta de música, el tema y los atajos.

#### Scenario: Cambiar la carpeta de música
- **WHEN** el usuario elige otra carpeta en los ajustes
- **THEN** el sistema indexa la nueva carpeta y actualiza la librería
