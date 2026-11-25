# Alineación IBA ↔ metodologías ICA / resoluciones MADR

## Distinción institucional

| Actor | Rol |
|---|---|
| **MADR** (Ministerio de Agricultura y Desarrollo Rural) | Expide las Resoluciones **0136** y **0253** de 2020 que adoptan los manuales de condiciones de bienestar animal. |
| **ICA** | Autoridad sanitaria: metodologías de evaluación (**MEBA** / **EBA**), vigilancia y verificación en predio (p. ej. ASI). |

El prototipo **operacionaliza indicadores** inspirados en esos instrumentos. **No certifica** cumplimiento oficial ni sustituye una visita ICA.

## Semáforo operativo (prototipo)

| Nivel | Antes (genérico) | Ahora (alineado a bandas Alto / Medio / Bajo) |
|---|---|---|
| Cumple (`COMPLIANT`) | IBA ≥ 80 | IBA ≥ **75** (Alto ICA) |
| Atención (`ATTENTION`) | IBA ≥ 60 | IBA ≥ **50** (Medio ICA) |
| No cumple (`NON_COMPLIANT`) | IBA &lt; 60 | IBA &lt; **50** (Bajo ICA) |

## Pesos IBA por especie (nutrición / entorno / salud / conducta / mental)

| Especie | Norma MADR | Código | Pesos |
|---|---|---|---|
| Bovino | Res. 0253/2020 | `CATTLE` | 15 / 35 / 25 / 15 / 10 |
| Caprino | Res. 0136/2020 | `GOAT` | 20 / 20 / 35 / 15 / 10 |
| Porcino | Res. 0136/2020 | `SWINE` | 10 / 25 / 40 / 15 / 10 |

La especie porcina forma parte del **alcance documentado** del prototipo (no es un accidente del diccionario de datos).

## Matriz de trazabilidad

Archivo: `docs/Matriz_Indicadores_ICA_vs_Software_Bienestar_ICA.xlsx`

Relaciona: especie, resolución, dominio, variable de entrada, regla de cálculo, umbral, hallazgo y resultado operativo.

## Código

`src/app/core/welfare-scoring.ts` → `IBA_WEIGHTS_BY_SPECIES`, `COMPLIANT_IBA_MIN`, `ATTENTION_IBA_MIN`.

## Offline

- Sin Supabase: IndexedDB local (semilla). **Sin** cola de sync a la nube.
- Con Supabase (producción): requiere conectividad.
