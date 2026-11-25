# Parches de texto (caps. 8–16, Anexo 1 y TOC)

Pegar en el documento marco del trabajo de grado. No son anexos: sustituyen el párrafo o el renglón indicado.  
Páginas según el PDF aprobado del proyecto de grado (80 págs.).

## Prioridad (impacto)

1. **p. 43** (cap. 10) y **p. 63** (cap. 13.1 / 13.3): pesos + umbrales  
2. **p. 58** (cap. 11) y **p. 74** (Anexo 1): checkpoint IBA ≥ 80 → ≥ 75  
3. **p. 5** (TOC) y **p. 15** (cap. 8): título del capítulo 8  

## Tabla de contenido y capítulo 8

| Ubicación | Buscar | Reemplazar |
|---|---|---|
| TOC ≈ **p. 5** | `8. METODOLOGÍA DE DESARROLLO` | `8. Diseño de la investigación` |
| Cap. 8 ≈ **p. 15** | `8. METODOLOGÍA DE DESARROLLO` | `8. Diseño de la investigación` |

## Capítulos 9–11

| Ubicación | Buscar | Reemplazar |
|---|---|---|
| Cap. 10 dominio ≈ **p. 43** | `ponderación 25 % nutrición, 20 % entorno, 25 % salud, 15 % conducta, 15 % estado mental` (25/20/25/15/15) | Pesos por especie: bovino **15/35/25/15/10**, caprino **20/20/35/15/10**, porcino **10/25/40/15/10** (nutrición/entorno/salud/conducta/estado mental) |
| Cap. 10 ≈ **p. 43** | `umbrales IBA 80/60` | Semáforo **75/50** (cumple ≥75, atención ≥50) |
| Cap. 11 simulación ≈ **p. 58** | `fecha de IBA ≥ 80` | `fecha de IBA ≥ 75` |
| Cap. 8.3 PWA ≈ **p. 17** | `Service Workers` / Angular `ngsw` | **Conservar** si describe el service worker de Angular en producción (no es texto obsoleto) |

## Capítulo 12

Sustituir el capítulo completo por `docs/Capitulos_12_a_16_Pruebas_resultados_APA.docx` (incluye 12.7.1 / 12.7.2 y remite a Figuras 15a–15p del informe). En **12.3** queda explícito: datos de semilla / prueba y **no hubo usuarios finales** de campo.

## Capítulo 13

| Ubicación | Buscar | Reemplazar |
|---|---|---|
| 13.1 ≈ **p. 63** | `El IBA pondera 25 % … umbrales en 80 y 60` | Pesos por especie (arriba) + umbrales **75** (cumple) y **50** (atención) |
| 13.1 ≈ **p. 63** | Cifras viejas de semilla (`IBA medio 69.8`, `CAP-014`, etc.) | Alinear al inventario vigente (IBA medio 81,4; chapas VACA/CABRA/CERDO) |
| 13.3 ≈ **p. 63** | `fecha en que el IBA alcanza 80 o más` | `fecha en que el IBA alcanza 75 o más` |
| 13.3 | Corrida «Sequía 90 días» (Ilustración 30): **93,5 kg** e **IBA 78,3** | Debe coincidir con la Figura 13 del informe (no usar 125,3 kg / 68,2 de otra corrida) |

## Capítulos 14–16

El fascículo regenerado (`Capitulos_12_a_16_…`) ya usa 75/50, tres especies y niega ML. Revisar solo si el PDF marco aún reintroduce `80/60` o `25/20/25/15/15`.

## Anexo 1

| Ubicación | Buscar | Reemplazar |
|---|---|---|
| `simulation_runs.estimated_compliance_date` ≈ **p. 74** | `Primera fecha con IBA ≥ 80` | `Primera fecha con IBA ≥ 75` |
| Cualquier otro renglón | `80/60` o pesos únicos `25/20/25/15/15` | `75/50` y pesos por especie |

## Fuera de este fascículo (caps. 1–7)

Siguen densos en el PDF marco: título/resumen/justificación/objetivos con “IA” o “bovinos y caprinos” sin porcino (≈ **pp. 1–14**). Corregir con `docs/Ajustes_trabajo_grado_observaciones_tutora.docx`, no con este parche.

## Ya limpio (no tocar)

- **Vitest**: no aparece en caps. 9–16 / Anexo 1 / TOC; las pruebas usan `node:test` / `tsx --test` y pytest.  
- **IA/ML en caps. 12–14**: el texto ya niega aprendizaje automático como capacidad del prototipo.  
- **Poster**: `docs/poster/poster-bienestar-ica.html` ya muestra ≥ 75.

## Notas de figura

No hace falta repetir en cada captura «Nota. Rol Productor. Elaboración propia…». En el informe basta el pie **Figura Nn. …**. En el capítulo APA se conserva una línea corta de elaboración propia donde el fascículo ya usa notas.
