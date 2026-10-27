# language: es
Característica: Simulación de eventos discretos
  Como productor
  Quiero proyectar peso e IBA bajo sequía o mejora de instalaciones
  Para anticipar el cumplimiento ICA

  Escenario: La simulación genera un punto por día
    Dado un animal con horizonte de 30 días
    Cuando corro la simulación
    Entonces debo obtener 30 instantáneas
    Y el resultado debe ser determinista para la misma semilla

  Escenario: Restricción alimentaria empeora el peso final
    Dado el mismo animal y horizonte
    Cuando comparo "IMPROVED_HOUSING" contra "FEED_RESTRICTION"
    Entonces el peso final de la mejora debe ser mayor
