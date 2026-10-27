# language: es
Característica: Evaluación de las cinco libertades
  Como evaluador ICA
  Quiero capturar nutrición, entorno, salud, conducta y manejo
  Para obtener el índice de bienestar animal y el semáforo de cumplimiento

  Escenario: Animal saludable queda en umbral de cumplimiento
    Dado un bovino con condición corporal 3, hidratación 3, cama excelente y manejo calmo
    Cuando se calcula el índice de bienestar
    Entonces el IBA debe ser mayor o igual a 80
    Y el nivel de cumplimiento debe ser "COMPLIANT"

  Escenario: Estrés calórico porcino en emergencia
    Dado un porcino con THI 85
    Cuando se clasifica el estrés calórico
    Entonces el nivel debe ser "EMERGENCY"
