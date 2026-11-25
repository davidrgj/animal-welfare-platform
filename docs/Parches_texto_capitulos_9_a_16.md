# Parches de texto (caps. 9–16, Anexo 1 y TOC)

Pegar en el documento marco del trabajo de grado. No son anexos: sustituyen el párrafo o el renglón indicado.

## Tabla de contenido

| Buscar | Reemplazar |
|---|---|
| `8. Metodología` (o el título antiguo del cap. 8) | `8. Diseño de la investigación` |
| `bovinos y caprinos` (en el título / TOC) | `bovinos, caprinos y porcinos` |

## Capítulo 9–11 (arquitectura / requisitos)

| Ubicación (PDF aprobado ≈ p. 43) | Buscar | Reemplazar |
|---|---|---|
| Dominio / `welfare-scoring.ts` | `ponderación 25 % nutrición, 20 % entorno, 25 % salud, 15 % conducta, 15 % estado mental; umbrales IBA 80/60` | `ponderaciones diferenciadas por especie (bovino 15/35/25/15/10; caprino 20/20/35/15/10; porcino 10/25/40/15/10 en nutrición/entorno/salud/conducta/estado mental); umbrales IBA 75/50` |
| Simulación / UI (≈ p. 58) | `fecha de IBA ≥ 80` | `fecha de IBA ≥ 75` |
| Alcance de especies | `bovinos y caprinos` (si aún excluye porcino) | `bovinos, caprinos y porcinos` |
| Afirmaciones de producto | “IA”, “inteligencia artificial”, “machine learning” como capacidad del prototipo | Retirar o aclarar que el prototipo usa **reglas e índices** (IBA/THI/SED), no ML |
| PWA | `Service Workers` genérico sin contexto | `service worker de Angular` (`@angular/service-worker` / `ngsw`) en build de producción |

## Capítulo 12

Sustituir el capítulo completo por `docs/Capitulos_12_a_16_Pruebas_resultados_APA.docx` (incluye 12.7.1 / 12.7.2 y Figuras 15a–15p del informe). En **12.3** ya queda explícito: datos de semilla / prueba y **no hubo usuarios finales** de campo.

## Capítulo 13

| Sección | Buscar | Reemplazar |
|---|---|---|
| 13.1 | `El IBA pondera 25 % … umbrales en 80 y 60` | `El IBA usa ponderaciones por especie (bovino 15/35/25/15/10; caprino 20/20/35/15/10; porcino 10/25/40/15/10) con umbrales 75 (cumple) y 50 (atención)` |
| 13.1 | cifras viejas de semilla (`IBA medio 69.8`, `CAP-014`, etc.) si el tablero actual muestra 81,4 | Alinear al inventario vigente (IBA medio 81,4; chapas VACA/CABRA/CERDO) |
| 13.3 | `fecha en que el IBA alcanza 80 o más` | `fecha en que el IBA alcanza 75 o más` |
| 13.3 | Mantener la corrida «Sequía 90 días» (Ilustración 30): **93,5 kg** e **IBA 78,3** | Debe coincidir con la Figura 13 del informe de pruebas (no usar 125,3 kg / 68,2 de otra corrida) |

## Capítulos 14–16

Revisar menciones residuales de `80/60`, `25/20/25/15/15`, IA como capacidad del software y “solo bovinos y caprinos”. El fascículo regenerado (`Capitulos_12_a_16_…docx`) ya usa 75/50, tres especies y niega ML.

## Anexo 1

Si el anexo de esquema o semilla aún cita umbrales 80/60 o pesos únicos 25/20/25/15/15, actualizar a 75/50 y pesos por especie.

## Notas de figura

No hace falta repetir en cada captura «Nota. Rol Productor. Elaboración propia…». En el informe de pruebas basta el pie **Figura Nn. …** (formato del documento original). En el capítulo APA se conserva una sola línea corta «Elaboración propia a partir del despliegue en Vercel (2026).» donde el fascículo ya usa notas.
