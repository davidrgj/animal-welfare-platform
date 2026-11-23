# Ajuste ICA — pesos y semáforo (tutoría)

Cambios aplicados tras la revisión de la matriz con la investigadora.

## Semáforo (antes → ahora)

| Nivel UI | Antes | Ahora (ICA) |
|---|---|---|
| Cumple (`COMPLIANT`) | IBA ≥ 80 | IBA ≥ **75** (Alto ICA) |
| Atención (`ATTENTION`) | IBA ≥ 60 | IBA ≥ **50** (Medio ICA) |
| No cumple (`NON_COMPLIANT`) | IBA &lt; 60 | IBA &lt; **50** (Bajo ICA) |

Excelente oficial (≥90% + RSPP/ASI) sigue fuera del MVP: el semáforo operativo marca “Cumple” desde Alto (≥75).

## Pesos IBA por especie

| Dominio | Bovino (MEBA 55/35/10) | Caprino (libertades 20/20/35/10/15) | Porcino (MEBA 50/35/15) |
|---|---|---|---|
| Nutrición | 15% | **20%** | 10% |
| Entorno | **35%** | **20%** | **25%** |
| Salud | 25% | **35%** | **40%** (*) |
| Conducta | 15% | **15%** | 15% |
| Mental | 10% | **10%** | 10% |

(*) En porcino, el 15% de gestión oficial se incorpora en Salud (proxy: vacunación / plan sanitario del formulario).

Código: `src/app/core/welfare-scoring.ts` → `IBA_WEIGHTS_BY_SPECIES`, `COMPLIANT_IBA_MIN`, `ATTENTION_IBA_MIN`.
