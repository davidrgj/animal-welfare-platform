#!/usr/bin/env python3
"""Ajustes al trabajo de grado (PDF) según observaciones de Paola Valencia Achuri (23 nov 2026).

Entrega texto listo para sustituir en el documento marco (págs. citadas) y anexos técnicos.
"""

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "Ajustes_trabajo_grado_observaciones_tutora.docx"


def set_run(run, *, bold=False, italic=False, size=12):
    run.bold = bold
    run.italic = italic
    run.font.name = "Times New Roman"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    run.font.size = Pt(size)


def p(doc, text, *, bold=False, italic=False, size=12, align="justify", first=True, after=8):
    para = doc.add_paragraph()
    para.paragraph_format.space_after = Pt(after)
    para.paragraph_format.space_before = Pt(0)
    para.paragraph_format.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
    para.paragraph_format.first_line_indent = Cm(1.25) if first else Cm(0)
    if align == "center":
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif align == "left":
        para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    else:
        para.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    set_run(para.add_run(text), bold=bold, italic=italic, size=size)
    return para


def heading(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        set_run(run, bold=True, size=14 if level == 1 else 12)
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(8)


def proposed(doc, label, text):
    p(doc, label, bold=True, first=False, after=4, align="left")
    p(doc, text, italic=True, first=False, after=10)


def add_table(doc, headers, rows, caption, note=""):
    p(doc, caption, bold=True, first=False, align="left", after=4)
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ""
        set_run(cell.paragraphs[0].add_run(h), bold=True, size=10)
    for r_i, row in enumerate(rows):
        for c_i, value in enumerate(row):
            cell = table.rows[r_i + 1].cells[c_i]
            cell.text = ""
            set_run(cell.paragraphs[0].add_run(str(value)), size=10)
    if note:
        p(doc, note, italic=True, size=10, first=False, after=10)


def build():
    doc = Document()
    section = doc.sections[0]
    section.page_width = Cm(21.59)
    section.page_height = Cm(27.94)
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(3)
    section.right_margin = Cm(2.5)

    p(doc, "UNIVERSIDAD COOPERATIVA DE COLOMBIA", bold=True, size=13, align="center", first=False, after=2)
    p(doc, "PROGRAMA DE INGENIERÍA DE SISTEMAS", bold=True, size=12, align="center", first=False, after=10)
    p(
        doc,
        "AJUSTES AL TRABAJO DE GRADO SEGÚN OBSERVACIONES DE LA DIRECTORA",
        bold=True,
        size=13,
        align="center",
        first=False,
        after=6,
    )
    p(doc, "Documento: Proyecto de grado (PDF, 80 págs.)", size=11, align="center", first=False, after=2)
    p(doc, "David Ramírez Gutiérrez", bold=True, size=12, align="center", first=False, after=2)
    p(doc, "Directora: Paola Andrea Valencia Achuri", size=12, align="center", first=False, after=2)
    p(doc, "23 nov, 2026 · Normas APA 7.ª ed.", italic=True, size=11, align="center", first=False, after=14)

    p(
        doc,
        "Respuesta a las observaciones del 23 de noviembre de 2026. Cada punto incluye: (a) aceptación "
        "de la observación; (b) texto propuesto listo para sustituir en el PDF; (c) ubicación "
        "aproximada por página. Los capítulos 12–16 regenerados (Capitulos_12_a_16_Pruebas_resultados_APA.docx) "
        "ya incorporan umbrales IBA ≥75 / ≥50, limitaciones de validación, alcance porcino, SED, offline y bibliografía reforzada.",
        first=True,
    )

    # ---------- 1 ----------
    heading(doc, "1. Inteligencia artificial frente al desarrollo realizado (págs. 6, 8–9, 62–65)", 1)
    p(
        doc,
        "Se acepta la observación. El prototipo no implementa aprendizaje automático. La analítica es "
        "de reglas ponderadas (IBA), umbrales bioclimáticos (THI) y simulación de eventos discretos. "
        "Se ajustan título, resumen, justificación, pregunta y objetivos al alcance real. La IA queda "
        "solo como trabajo futuro (recomendación 4 del PDF), no como resultado demostrado.",
    )

    proposed(
        doc,
        "Texto propuesto — 1. Título (pág. 6) y portada",
        "Implementación de un prototipo de plataforma digital para el monitoreo y la simulación del "
        "bienestar animal en sistemas productivos bovinos, caprinos y porcinos conforme a lineamientos "
        "adoptados mediante las Resoluciones 0136 y 0253 de 2020 del Ministerio de Agricultura y "
        "Desarrollo Rural, con operacionalización de indicadores bajo funciones del Instituto Colombiano Agropecuario (ICA).",
    )
    proposed(
        doc,
        "Texto propuesto — 4.2 Formulación del problema / pregunta (pág. 8)",
        "¿Cómo puede un prototipo de plataforma digital, basado en un índice de bienestar auditable "
        "(reglas ponderadas alineadas a lineamientos normativos) y en un motor de simulación de eventos "
        "discretos, apoyar el monitoreo y la toma de decisiones sobre el bienestar animal en sistemas "
        "productivos bovinos, caprinos y porcinos, en un entorno de demostración académica con datos de semilla?",
    )
    proposed(
        doc,
        "Texto propuesto — 5. Justificación (pág. 8; retirar “inteligencia artificial” como capacidad del prototipo)",
        "Un prototipo de plataforma digital con analítica basada en reglas e índices y con simulación "
        "de eventos discretos se justifica porque el monitoreo del bienestar animal en sistemas "
        "productivos bovinos, caprinos y porcinos necesita estandarizarse y hacerse verificable. "
        "La analítica predictiva mediante aprendizaje automático y los sensores IoT se reconocen como "
        "líneas de trabajo futuro, no como capacidades demostradas en este prototipo.",
    )
    proposed(
        doc,
        "Texto propuesto — 6.1 Objetivo general (pág. 9)",
        "Implementar un prototipo de plataforma digital para el monitoreo y la simulación del bienestar "
        "animal en sistemas productivos bovinos, caprinos y porcinos, mediante un índice ponderado "
        "interpretable, alertas normativas y un motor de simulación de eventos discretos, alineado a "
        "los manuales de bienestar animal adoptados por el Ministerio de Agricultura y Desarrollo Rural "
        "(Resoluciones 0136 y 0253 de 2020) y a las metodologías de evaluación del ICA, sin declarar "
        "capacidades de aprendizaje automático no implementadas.",
    )
    proposed(
        doc,
        "Texto propuesto — 6.2 Objetivos específicos (pág. 9)",
        "1. Modelar las variables críticas de bienestar animal (nutrición, entorno, salud, conducta y "
        "estado mental) bajo reglas y umbrales diferenciados por especie, trazables a las Resoluciones "
        "0136 y 0253 de 2020 y a las metodologías MEBA/EBA del ICA.\n"
        "2. Diseñar e implementar un módulo de analítica basada en reglas e índices (IBA, THI, hallazgos "
        "y semáforo operativo ≥75 / ≥50) que identifique riesgos sanitarios y productivos en el "
        "inventario de demostración, sin afirmar aprendizaje automático.\n"
        "3. Implementar un entorno de simulación de eventos discretos con el que se evalúen escenarios "
        "de intervención técnica (dieta, clima, manejo) antes de aplicarlos al animal, con variables "
        "de estado, eventos y transiciones documentadas.",
    )
    p(
        doc,
        "Ajuste en resumen (pág. 6) y palabras clave: sustituir “plataforma inteligente” / “Inteligencia Artificial” "
        "por “plataforma digital”, “analítica basada en reglas”, “simulación de eventos discretos”. "
        "En conclusiones (pág. 65–66), el objetivo 2 debe decir “cumplido como analítica de reglas”, no como IA.",
        first=True,
    )

    # ---------- 2 ----------
    heading(doc, "2. Unificación metodológica (págs. 14–18)", 1)
    p(
        doc,
        "Se acepta la inconsistencia: el §7.6 declara enfoque cuantitativo, descriptivo y transversal, "
        "mientras el §8.1 declara cualitativo-tecnológico. Además, el §7.8 menciona encuesta y observación "
        "directa sin resultados. Se unifica el diseño y se separa Scrum del método de investigación.",
    )
    proposed(
        doc,
        "Texto propuesto — sustituir 7.5, 7.6 y 7.8 (págs. 14–15)",
        "7.5 Tipo de investigación. Investigación aplicada y tecnológica (constructiva): busca resolver "
        "un problema práctico —la carencia de un sistema digital verificable para monitorear bienestar "
        "animal— mediante la construcción de un artefacto de software. Integra un componente "
        "descriptivo-propositivo al caracterizar variables normativas y proponer un modelo de índices "
        "y simulación (Hernández-Sampieri y Mendoza, 2018).\n\n"
        "7.6 Diseño metodológico unificado. El diseño es mixto secuencial con énfasis constructivo-tecnológico: "
        "(a) fase documental-normativa (revisión de Resoluciones MADR 0136 y 0253 de 2020 y metodologías "
        "ICA); (b) fase de ingeniería de software (desarrollo ágil Scrum del prototipo); (c) fase de "
        "verificación del artefacto mediante pruebas de software (unitarias, aceptación, E2E, API, "
        "seguridad) sobre el despliegue. La medición cuantitativa se limita a métricas del software "
        "(IBA, THI, cobertura de pruebas), no a una encuesta poblacional. No se declara un diseño "
        "cuantitativo-descriptivo-transversal de campo ni un enfoque cualitativo-tecnológico distinto "
        "en el capítulo 8: ambos capítulos usan esta misma formulación.\n\n"
        "7.8 Técnicas de recolección de información (ejecutadas). (1) Revisión documental normativa y "
        "científica. (2) Análisis de requerimientos y modelado UML. (3) Verificación empírica del "
        "prototipo mediante campañas de prueba automatizadas y evidencias de despliegue. "
        "No se aplicaron encuestas Likert ni observación directa en predios; esas técnicas se retiran "
        "del alcance ejecutado para no declarar evidencia inexistente.",
    )
    proposed(
        doc,
        "Texto propuesto — 8.1 Tipo de investigación (pág. 15–16; alinear con 7.5–7.6)",
        "La investigación es aplicada y tecnológica (constructiva). Scrum (sección 8.2) es el proceso "
        "de desarrollo del software (sprints, backlog, definición de terminado), no el diseño de "
        "investigación. El diseño de investigación responde a cómo se produce conocimiento sobre el "
        "artefacto (constructivo + verificativo); Scrum responde a cómo se construye el software.",
    )
    add_table(
        doc,
        ["Concepto", "Qué es en este trabajo", "Qué no es"],
        [
            ["Diseño de investigación", "Aplicada, constructiva-tecnológica, con verificación del artefacto", "Encuesta poblacional o etnografía de predios"],
            ["Proceso de desarrollo", "Scrum adaptado (auxiliar de investigación)", "El método científico en sí"],
            ["Evidencia empírica", "Código, pruebas, despliegue, matriz normativa, datos de semilla", "Resultados de encuestas no aplicadas"],
        ],
        "Tabla. Diferencia entre método de investigación y proceso ágil",
        "Elaboración propia (2026).",
    )

    # ---------- 3 ----------
    heading(doc, "3. Limitaciones: sin validación en sector productivo (págs. 62–66)", 1)
    p(
        doc,
        "Se acepta. Los resultados del PDF (cinco animales / dos predios de semilla; CERDO-218, VACA-087, etc.) "
        "no constituyen evaluación con productores en campo. Se amplía 12.3 y se matizan resultados y conclusiones.",
    )
    proposed(
        doc,
        "Texto propuesto — ampliar 12.3 Limitaciones del prototipo (pág. 62)",
        "Además de las precisiones de stack (sin Spring Boot, Firebase ni Cloudinary; IBA = índice "
        "ponderado; SED = modelo determinista in silico, no red neuronal), se declara la siguiente "
        "limitación estructural: el inventario evaluado corresponde a datos de demostración (semilla "
        "académica). No se documentó una evaluación sistemática con productores o veterinarios en "
        "condiciones reales de producción ni se realizaron pruebas con datos reales de casos "
        "específicos de predios productivos. En consecuencia, no se afirma que la plataforma haya "
        "mejorado el bienestar animal, reducido costos ni incrementado la eficiencia productiva en el "
        "sector. Esos beneficios se presentan únicamente como potenciales, pendientes de evidencia "
        "empírica futura. El alcance demostrado se limita a: (i) operacionalizar reglas e indicadores "
        "alineados a la norma en un prototipo verificable; (ii) calcular IBA/THI y emitir alertas sobre "
        "datos de semilla; (iii) simular escenarios in silico. La implementación de la norma en software "
        "no equivale a certificación oficial de cumplimiento ICA ni a impacto medido en campo.",
    )
    p(
        doc,
        "En 13 Resultados, 14 Discusión y 15 Conclusiones: sustituir afirmaciones de mejora productiva "
        "o de “cumplimiento asegurado del ICA” por “potencial de apoyo a la decisión” y “alineación a "
        "lineamientos en el prototipo”. La recomendación 7 del PDF (pruebas con productores) se mantiene "
        "como trabajo futuro explícito.",
        first=True,
    )

    # ---------- 4 ----------
    heading(doc, "4. Coherencia de especies: bovino, caprino y porcino (págs. 6, 63, 70–71)", 1)
    p(
        doc,
        "Se aclara el alcance: el prototipo contempla tres especies —bovina, caprina y porcina— con reglas "
        "diferenciadas. La especie porcina no es un accidente del diccionario: está cubierta por la "
        "Resolución 0136 de 2020 (équidas, porcinas, ovinas y caprinas) y por la metodología MEBA porcinos "
        "del ICA. CERDO-218 pertenece al alcance ampliado y documentado. Título, resumen, problema, "
        "objetivos, RF y resultados deben nombrar las tres especies de forma homogénea.",
    )
    add_table(
        doc,
        ["Especie", "Norma MADR", "Metodología ICA", "Código / pesos IBA (N/E/S/C/M)"],
        [
            ["Bovino", "Res. 0253 de 2020", "MEBA bovinos/búfalos", "CATTLE · 15/35/25/15/10"],
            ["Caprino", "Res. 0136 de 2020", "EBA ovinos y caprinos", "GOAT · 20/20/35/15/10"],
            ["Porcino", "Res. 0136 de 2020", "MEBA porcinos", "SWINE · 10/25/40/15/10"],
        ],
        "Tabla. Alcance por especie (coherencia título–datos–resultados)",
        "Elaboración propia (2026). Semáforo operativo: cumple ≥75, atención ≥50, no cumple <50.",
    )

    # ---------- 5 ----------
    heading(doc, "5. Trazabilidad normativa MADR / ICA y anexos técnicos", 1)
    p(
        doc,
        "Distinción institucional (sustituir el encabezado “Resoluciones específicas del ICA” en pág. 13). "
        "Las Resoluciones 0136 y 0253 de 2020 son actos del Ministerio de Agricultura y Desarrollo Rural "
        "(MADR) que adoptan los manuales de condiciones de bienestar animal. El ICA, como autoridad "
        "sanitaria, desarrolla metodologías de evaluación (MEBA/EBA), ejerce vigilancia y aplica "
        "instrumentos en predio (p. ej. ASI). El prototipo operacionaliza indicadores inspirados en esos "
        "instrumentos; no certifica cumplimiento oficial ni sustituye una visita ICA.",
    )
    p(
        doc,
        "Matriz de trazabilidad. Se anexa Matriz_Indicadores_ICA_vs_Software_Bienestar_ICA.xlsx "
        "(repositorio docs/), que relaciona especie, resolución, dominio, variable de entrada, regla de "
        "cálculo, umbral, hallazgo tipificado y resultado operativo. Cumplir una regla del prototipo ≠ "
        "obtener calificación oficial Excelente/Alto/Medio/Bajo del predio.",
        first=True,
    )

    heading(doc, "5.1 Motor de eventos discretos (formalización)", 2)
    add_table(
        doc,
        ["Elemento SED", "Definición en el prototipo"],
        [
            ["Variables de estado", "Peso (kg), IBA simulado, etapa productiva, día de horizonte, fechas estimadas de cumplimiento IBA y peso objetivo"],
            ["Eventos", "ICA_CHECKPOINT, STAGE_TRANSITION, WEIGHT_TARGET, HEALTH_INCIDENT, WELFARE_DROP"],
            ["Condiciones de transición", "Cambio de etapa por umbrales de peso; IBA ≥75 → checkpoint; IBA <50 → caída de bienestar; incidente sanitario acotado por semilla"],
            ["Reglas", "Ganancia diaria por especie/dieta × modificador de escenario; desplazamiento de IBA por escenario; determinismo con misma semilla (mulberry32)"],
            ["Secuencia", "Inicialización → bucle día 1…N (ganancia, eventos, snapshot) → cierre con peso/IBA finales"],
            ["Qué no es", "No es aprendizaje automático ni gemelo digital con IoT; es simulación de eventos discretos determinista, distinta de una proyección lineal única sin calendario de eventos"],
        ],
        "Tabla. Especificación del SED (anexo al cap. 11 / 12)",
        "Implementación: src/app/core/simulation.ts.",
    )

    heading(doc, "5.2 Funcionamiento sin conexión (offline)", 2)
    proposed(
        doc,
        "Texto propuesto — aclarar Dexie/IndexedDB (pág. 18) y RNF offline",
        "Cuando Supabase no está configurado (modo local), la aplicación opera únicamente con IndexedDB "
        "en el dispositivo (semilla local). No existe, en el prototipo actual, una cola de sincronización "
        "diferida hacia la nube. Cuando Supabase sí está configurado (modo nube / producción), las "
        "operaciones requieren conectividad: no hay modo offline con re-sincronización demostrada. "
        "Cualquier RNF que afirme “offline con sync posterior” se retira del alcance vigente o se "
        "declara trabajo futuro.",
    )

    heading(doc, "5.3 Seguridad: RLS entre productores y credenciales demo", 2)
    p(
        doc,
        "Además de las pruebas de navegación/ACL, el aislamiento se sustenta en políticas RLS "
        "(supabase/schema.sql y admin-policies.sql). Las pruebas de API verifican denegación anónima. "
        "Se documenta como control pendiente/recomendado un caso JWT: productor A no lee predios de "
        "productor B vía PostgREST. Las credenciales de demostración no se publican en la interfaz de "
        "login ni como contraseñas reutilizables de producción; se aíslan en variables de entorno / seed "
        "académico, separados de datos reales.",
    )

    heading(doc, "5.4 Bibliografía: priorizar literatura arbitrada", 2)
    p(doc, "Incorporar o privilegiar (el marco teórico no debe reposar solo en fuentes institucionales/comerciales):", first=True)
    for ref in [
        "Thom, E. C. (1959). The discomfort index. Weatherwise, 12(2), 57–61.",
        "Mellor, D. J. (2017). Operational details of the five domains model… Animals.",
        "Fraser, D. et al. Marcos de las cinco libertades / cinco dominios (OMSA/WOAH y revisiones arbitradas).",
        "Banks, J., Carson, J. S., Nelson, B. L. y Nicol, D. M. Discrete-Event System Simulation. Pearson.",
        "Sommerville, I. (2016). Software engineering (10.ª ed.). Pearson.",
        "Pressman, R. S. y Maxim, B. R. Software engineering: A practitioner’s approach.",
        "Hernández-Sampieri, R. y Mendoza, C. (2018). Metodología de la investigación.",
        "Myers, G. J. et al. The art of software testing.",
        "ISTQB (2023). Certified tester foundation level syllabus.",
        "ISO/IEC/IEEE 29119-1:2022. Software testing — Part 1.",
        "Lascano-Rivera et al. (2025) — estado del arte / trabajo futuro, no resultado propio.",
        "Resoluciones MADR 0136 y 0253 de 2020; metodologías MEBA/EBA ICA — marco normativo complementario.",
    ]:
        p(doc, "• " + ref, first=False, after=3)

    # ---------- Checklist ----------
    heading(doc, "6. Checklist de incorporación en el PDF", 1)
    add_table(
        doc,
        ["#", "Acción en el documento de grado", "Págs."],
        [
            ["1", "Sustituir título, resumen, justificación, pregunta y objetivos (sin IA no implementada; + porcinos)", "1, 6–9"],
            ["2", "Unificar 7.5–7.6–7.8 y 8.1; retirar encuesta/observación no ejecutadas; separar Scrum", "14–18"],
            ["3", "Ampliar 12.3: solo norma operacionalizada + semilla; beneficios = potenciales", "62–66"],
            ["4", "Homologar especies bovino/caprino/porcino en título, RF y resultados (CERDO-218)", "6, 63, 70–71"],
            ["5", "Anexar matriz Excel; aclarar MADR vs ICA; no confundir con certificación oficial", "13–14, 20–22, 43"],
            ["6", "Documentar SED (estado, eventos, reglas) y offline real", "Anexo / 11–12"],
            ["7", "Reportar aislamiento RLS / credenciales demo aisladas", "62 / seguridad"],
            ["8", "Fortalecer bibliografía científica arbitrada", "17 Referencias"],
            ["9", "Actualizar semáforo IBA ≥75 / ≥50 y pesos por especie (ya en código)", "código + nota ICA"],
        ],
        "Tabla. Plan de ajuste editorial",
        "Elaboración propia (2026).",
    )

    p(
        doc,
        "Declaración final. El autor asume el ajuste de alcance: el aporte del trabajo es un prototipo "
        "verificable de monitoreo y simulación alineado a lineamientos normativos, no un sistema de "
        "inteligencia artificial ni una evaluación de impacto productivo en campo.",
        first=True,
    )
    p(
        doc,
        "Archivos relacionados en el repositorio: docs/Ajustes_trabajo_grado_observaciones_tutora.docx (este), "
        "docs/Capitulos_12_a_16_Pruebas_resultados_APA.docx, docs/Matriz_Indicadores_ICA_vs_Software_Bienestar_ICA.xlsx, "
        "docs/ICA_alignment_note.md.",
        first=False,
        size=11,
    )

    doc.save(OUT)
    print("Wrote", OUT)


if __name__ == "__main__":
    build()
