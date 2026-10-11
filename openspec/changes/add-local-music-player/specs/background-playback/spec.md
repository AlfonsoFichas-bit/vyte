## ADDED Requirements

### Requirement: Reproducción continua con la ventana cerrada
El sistema SHALL reproducir el audio en un offscreen document de modo que la música continúe al cerrarse la ventana del reproductor.

#### Scenario: Cerrar la ventana durante la reproducción
- **WHEN** se cierra la ventana del reproductor mientras hay una pista sonando
- **THEN** el audio sigue reproduciéndose

### Requirement: Sincronización del estado de reproducción
El sistema SHALL mantener el estado de reproducción (pista actual, posición y estado play/pause) en el offscreen document y SHALL reflejarlo en la UI al reabrir la ventana.

#### Scenario: Reabrir la ventana
- **WHEN** el usuario reabre la ventana mientras hay reproducción activa
- **THEN** la UI muestra la pista actual y su posición y permite controlarla

### Requirement: Integración con Media Session
El sistema SHALL exponer los controles de reproducción mediante la Media Session API para que funcionen los controles multimedia del sistema operativo y de ChromeOS.

#### Scenario: Control multimedia del sistema
- **WHEN** el usuario usa los controles multimedia del sistema operativo
- **THEN** la reproducción responde (reproducir, pausar, siguiente o anterior) y se actualizan los metadatos mostrados

### Requirement: Atajos de teclado
El sistema SHALL registrar comandos para reproducir/pausar, siguiente y anterior a través de `chrome.commands`.

#### Scenario: Atajo de reproducción
- **WHEN** el usuario pulsa la tecla multimedia de reproducir/pausar
- **THEN** el sistema alterna entre reproducir y pausar
