## ADDED Requirements

### Requirement: Control de reproducción
El sistema SHALL permitir reproducir, pausar y reanudar una pista, y SHALL permitir posicionar la reproducción (seek) dentro de la pista.

#### Scenario: Reproducir pista
- **WHEN** el usuario activa "reproducir" sobre una pista
- **THEN** el audio comienza a sonar y el tiempo de reproducción avanza

#### Scenario: Pausar y reanudar
- **WHEN** el usuario pausa una pista en reproducción y luego reanuda
- **THEN** el audio se detiene y continúa desde la misma posición

#### Scenario: Posicionar dentro de la pista
- **WHEN** el usuario mueve la barra de progreso a otro punto
- **THEN** la reproducción continúa desde esa nueva posición

### Requirement: Cola de reproducción
El sistema SHALL mantener una cola de reproducción y SHALL permitir avanzar a la siguiente pista y retroceder a la anterior.

#### Scenario: Siguiente pista
- **WHEN** el usuario pulsa "siguiente"
- **THEN** el sistema reproduce la siguiente pista de la cola

#### Scenario: Fin de pista con autoavance
- **WHEN** una pista termina y hay una siguiente en la cola
- **THEN** el sistema reproduce automáticamente la siguiente pista

#### Scenario: Fin de la cola
- **WHEN** termina la última pista de la cola
- **THEN** la reproducción se detiene

### Requirement: Control de volumen
El sistema SHALL permitir ajustar el volumen de reproducción.

#### Scenario: Cambiar el volumen
- **WHEN** el usuario mueve el control de volumen
- **THEN** el volumen del audio se ajusta de inmediato
