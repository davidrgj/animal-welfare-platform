#!/usr/bin/env python3
"""Capítulos 12–16 del trabajo de grado, normas APA 7.ª ed."""

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Cm, Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / "evidence"
OUT = ROOT / "Capitulos_12_a_16_Pruebas_resultados_APA.docx"
FONT = "Times New Roman"


def set_run(run, *, size=12, bold=False, italic=False):
    run.font.name = FONT
    run._element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(0, 0, 0)


def set_spacing(paragraph, *, after=8, before=0, first_line=True, align="justify", line=1.5):
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.space_before = Pt(before)
    paragraph.paragraph_format.line_spacing = line
    if align == "justify":
        paragraph.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    elif align == "center":
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif align == "left":
        paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
    if first_line:
        paragraph.paragraph_format.first_line_indent = Cm(1.25)
    else:
        paragraph.paragraph_format.first_line_indent = Cm(0)


def p(doc, text, *, size=12, bold=False, italic=False, first=True, align="justify", after=8, before=0):
    item = doc.add_paragraph()
    set_spacing(item, after=after, before=before, first_line=first, align=align)
    run = item.add_run(text)
    set_run(run, size=size, bold=bold, italic=italic)
    return item


def heading(doc, text, level=1):
    item = doc.add_heading(text, level=level)
    for run in item.runs:
        run.font.name = FONT
        run._element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
        run.font.color.rgb = RGBColor(0, 0, 0)
        run.bold = True
        if level == 1:
            run.font.size = Pt(14)
        elif level == 2:
            run.font.size = Pt(13)
        else:
            run.font.size = Pt(12)
    item.paragraph_format.space_before = Pt(16)
    item.paragraph_format.space_after = Pt(8)
    item.paragraph_format.first_line_indent = Cm(0)
    return item


def caption(doc, kind, number, title):
    item = doc.add_paragraph()
    set_spacing(item, after=6, first_line=False, align="left", line=1.15)
    run = item.add_run(f"{kind} {number}. ")
    set_run(run, size=11, bold=True)
    run2 = item.add_run(title)
    set_run(run2, size=11, italic=False)


def note(doc, text):
    item = doc.add_paragraph()
    set_spacing(item, after=12, first_line=False, align="left", line=1.15)
    run = item.add_run("Nota. ")
    set_run(run, size=10, italic=True)
    run2 = item.add_run(text)
    set_run(run2, size=10)


def add_table(doc, headers, rows, number, title, note_text=None):
    caption(doc, "Tabla", number, title)
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    for index, header in enumerate(headers):
        cell = table.rows[0].cells[index]
        cell.text = ""
        para = cell.paragraphs[0]
        run = para.add_run(header)
        set_run(run, size=10, bold=True)
    for row_index, row in enumerate(rows, start=1):
        for col_index, value in enumerate(row):
            cell = table.rows[row_index].cells[col_index]
            cell.text = ""
            para = cell.paragraphs[0]
            run = para.add_run(str(value))
            set_run(run, size=10)
    if note_text:
        note(doc, note_text)
    else:
        doc.add_paragraph()
    return table


def picture(doc, name, number, title, note_text, width=14.5):
    path = EVIDENCE / name
    if not path.exists():
        p(doc, f"[Figura {number} no disponible]", first=False, italic=True)
        return
    doc.add_picture(str(path), width=Cm(width))
    caption(doc, "Figura", number, title)
    note(doc, note_text)


def hanging(doc, text):
    item = doc.add_paragraph()
    item.paragraph_format.left_indent = Cm(1.25)
    item.paragraph_format.first_line_indent = Cm(-1.25)
    item.paragraph_format.space_after = Pt(8)
    item.paragraph_format.line_spacing = 1.5
    item.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    run = item.add_run(text)
    set_run(run, size=12)


def page_break(doc):
    doc.add_page_break()


def main() -> None:
    doc = Document()
    section = doc.sections[0]
    section.page_width = Cm(21.59)
    section.page_height = Cm(27.94)
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(3)
    section.right_margin = Cm(2.5)

    # Portada
    for _ in range(2):
        p(doc, "", first=False, after=0)
    p(doc, "UNIVERSIDAD COOPERATIVA DE COLOMBIA", bold=True, size=14, align="center", first=False, after=4)
    p(doc, "FACULTAD DE INGENIERÍA", bold=True, size=13, align="center", first=False, after=4)
    p(doc, "PROGRAMA DE INGENIERÍA DE SISTEMAS", bold=True, size=13, align="center", first=False, after=28)
    p(doc, "IMPLEMENTACIÓN DE UN PROTOTIPO DE PLATAFORMA INTELIGENTE PARA EL MONITOREO Y SIMULACIÓN DEL BIENESTAR ANIMAL EN SISTEMAS PRODUCTIVOS BOVINOS Y CAPRINOS CONFORME A LINEAMIENTOS ICA", bold=True, size=14, align="center", first=False, after=18)
    p(doc, "Capítulos 12 a 16", size=13, align="center", first=False, after=4)
    p(doc, "Pruebas del sistema, resultados, discusión, conclusiones y recomendaciones", italic=True, size=12, align="center", first=False, after=28)
    p(doc, "DAVID RAMIREZ GUTIERREZ", bold=True, size=12, align="center", first=False, after=4)
    p(doc, "Auxiliar de investigación, Fábrica de Software", size=12, align="center", first=False, after=18)
    p(doc, "Trabajo para optar al título de Ingeniería de Sistemas", size=12, align="center", first=False, after=18)
    p(doc, "Director", size=12, align="center", first=False, after=2)
    p(doc, "Paola Valencia", bold=True, size=12, align="center", first=False, after=2)
    p(doc, "Ingeniería de Sistemas", size=12, align="center", first=False, after=28)
    p(doc, "Bogotá D.C., Colombia", size=12, align="center", first=False, after=2)
    p(doc, "2026", size=12, align="center", first=False, after=2)
    p(doc, "Normas APA, 7.ª edición", italic=True, size=11, align="center", first=False, after=2)

    page_break(doc)
    heading(doc, "Tabla de contenido", 1)
    toc = [
        "12. Pruebas del sistema",
        "    12.1 Introducción",
        "    12.2 Estrategia y pirámide de pruebas",
        "    12.3 Ambiente, alcance y limitaciones",
        "    12.4 Trazabilidad requisitos–casos de prueba",
        "    12.5 Pruebas unitarias",
        "    12.6 Pruebas de aceptación",
        "    12.7 Pruebas funcionales y de extremo a extremo",
        "    12.8 Pruebas de interfaz de programación (API)",
        "    12.9 Pruebas de rendimiento",
        "    12.10 Pruebas de seguridad",
        "    12.11 Calidad estática del código",
        "    12.12 Integración continua",
        "    12.13 Resultados consolidados de la campaña",
        "    12.14 Defectos identificados y corrección",
        "13. Resultados",
        "14. Discusión",
        "15. Conclusiones",
        "16. Recomendaciones",
        "Referencias",
        "Anexos",
    ]
    for line in toc:
        p(doc, line, first=False, after=3, align="left")

    heading(doc, "Lista de tablas", 1)
    for line in [
        "Tabla 1. Equivalencia entre el temario de pruebas y el stack real del prototipo",
        "Tabla 2. Ambiente de ejecución de la campaña",
        "Tabla 3. Matriz de trazabilidad (RF / CU / casos)",
        "Tabla 4. Resultados de las pruebas unitarias",
        "Tabla 5. Escenarios de aceptación (EP) actualizados",
        "Tabla 6. Resultados de las pruebas de API",
        "Tabla 7. Métricas de carga del frontend publicado",
        "Tabla 8. Controles de seguridad evaluados",
        "Tabla 9. Métricas estáticas de calidad",
        "Tabla 10. Defectos de la campaña y estado",
        "Tabla 11. Cumplimiento de los objetivos específicos",
    ]:
        p(doc, line, first=False, after=3, align="left")

    heading(doc, "Lista de figuras", 1)
    for line in [
        "Figura 1. Inicio de sesión del prototipo",
        "Figura 2. Rechazo de credenciales inválidas",
        "Figura 3. Tablero Estado ICA",
        "Figura 4. Inventario de predios",
        "Figura 5. Administración de usuarios y roles",
        "Figura 6. Cierre de sesión correcto en el build productivo de Vercel",
        "Figura 7. Módulo de simulación",
        "Figura 8. Reporte de predio",
    ]:
        p(doc, line, first=False, after=3, align="left")

    page_break(doc)
    heading(doc, "12. Pruebas del sistema", 1)
    heading(doc, "12.1 Introducción", 2)
    p(
        doc,
        "La verificación y la validación constituyen una fase obligatoria del ciclo de vida del software, pues permiten demostrar, con evidencia empírica, que el prototipo hace lo que los requisitos declaran y que lo hace en el entorno real de despliegue (Sommerville, 2016; Pressman y Maxim, 2015). En este trabajo, las pruebas no se conciben como un recuento informal de pantallas, sino como un proceso sistemático alineado con la pirámide de pruebas (Cohn, 2009), con los niveles del International Software Testing Qualifications Board (ISTQB, 2023) y con la norma ISO/IEC/IEEE 29119-1 (2022) sobre conceptos y vocabulario de pruebas de software.",
    )
    p(
        doc,
        "El capítulo responde, además, a la fase VI del plan de implementación (pruebas y ajustes finales) y a la estrategia descrita en la sección 8.5 del trabajo de grado. Se aclara, no obstante, una corrección de alcance ya advertida en la sección 12.3 de la versión preliminar: el prototipo construido no expone un backend Spring Boot ni persiste en Firebase o Cloudinary. El cliente enriquecido (Ionic/Angular) concentra las reglas del Instituto Colombiano Agropecuario (ICA) y Supabase concentra identidad, datos y archivos. Por tanto, las herramientas del temario de la asignatura (JUnit, pytest, Playwright, Postman, JMeter, Cucumber, OWASP ZAP, SonarQube, TestRail y GitHub Actions) se aplicaron por equivalencia sobre el stack real, y no se atribuye al artefacto una infraestructura que no existe.",
    )
    p(
        doc,
        "La campaña se ejecutó el 27 de octubre de 2026 (America/Bogota) contra el prototipo publicado en https://animal-welfare-platform-vepq.vercel.app/ y contra el código fuente versionado. El criterio de éxito no es la ausencia total de defectos —impropia de un prototipo académico—, sino la cobertura de los casos de uso CU-01 a CU-11, la corroboración de las fórmulas del índice de bienestar animal (IBA) y del índice temperatura-humedad (THI), y la documentación honesta de no conformidades, con su corrección cuando aplica (Myers et al., 2012).",
    )

    heading(doc, "12.2 Estrategia y pirámide de pruebas", 2)
    p(
        doc,
        "Se adoptó la pirámide de Cohn (2009): una base amplia de pruebas unitarias baratas y deterministas sobre el dominio (IBA, THI, espacio mínimo, simulación de eventos discretos y visibilidad por rol); una franja de aceptación escrita en lenguaje Gherkin (Cucumber); una capa de pruebas de extremo a extremo (E2E) sobre los flujos del productor, el veterinario y el administrador; y, en la cúspide, pruebas de API, carga, seguridad y calidad estática. Esta distribución reduce el costo de detectar un error de fórmula (que no requiere abrir el navegador) y reserva el E2E para la interacción real con Vercel y Supabase Auth.",
    )
    p(
        doc,
        "La Tabla 1 declara la equivalencia con el temario de pruebas de software. La equivalencia no es cosmética: cada nivel se ejecutó y dejó evidencia reproducible en el repositorio (carpeta tests/).",
    )
    add_table(
        doc,
        ["Nivel", "Herramienta del temario", "Instrumento aplicado", "Resultado"],
        [
            ["Unitarias", "JUnit / pytest", "node:test sobre TypeScript real y pytest como oráculo independiente del IBA", "31/31 satisfactorio"],
            ["Aceptación", "Cucumber", "Features Gherkin en español y pasos pytest", "3/3 satisfactorio"],
            ["Funcionales / E2E", "Selenium, Playwright, Cypress", "Playwright (Chromium) contra Vercel y local", "14/14 satisfactorio en producción"],
            ["API", "Postman", "Colección Postman y pytest/requests sobre Auth y REST de Supabase", "10/10 satisfactorio"],
            ["Rendimiento", "Apache JMeter", "Grupo de hilos equivalente (20 usuarios × 3 iteraciones)", "2/2; p95 = 53,4 ms"],
            ["Seguridad", "OWASP ZAP", "Lista de verificación OWASP Top 10 (2021), sin payloads ofensivos", "Controles de acceso, TLS y cabeceras anti-clickjacking satisfactorios; CSP no impuesto"],
            ["Calidad estática", "SonarQube", "Métricas de complejidad, duplicación y mantenibilidad", "Índice 95,8 (rating A)"],
            ["Gestión", "TestRail", "Catálogo JSON de 41 casos", "Trazado a RF y CU"],
            ["CI", "Jenkins / GitHub Actions", "Workflow en cada push/pull request", "Configurado"],
        ],
        1,
        "Equivalencia entre el temario de pruebas y el stack real del prototipo",
        "Elaboración propia (2026). JUnit no aplica porque no hay backend Java; node:test examina el mismo código que calcula el IBA en producción.",
    )

    heading(doc, "12.3 Ambiente, alcance y limitaciones", 2)
    add_table(
        doc,
        ["Elemento", "Descripción"],
        [
            ["Frontend publicado", "https://animal-welfare-platform-vepq.vercel.app/"],
            ["Backend as a Service", "https://gkomojjjyydbdajpxyqw.supabase.co (Auth, Postgres, Storage, RLS)"],
            ["Cuenta de evaluación", "Administrador de prueba del investigador (rol ADMINISTRATOR)"],
            ["Inventario observado", "Tres predios (El Recuerdo, La Esperanza, Prueba), seis animales, cuatro perfiles"],
            ["Navegador E2E", "Playwright Chromium, viewport 1280 × 800; exploración adicional 390 × 844"],
            ["Fecha", "27 de octubre de 2026, zona America/Bogota"],
            ["Fuera de alcance", "Apps nativas iOS/Android, carga destructiva sobre Postgres, fuzzing, WCAG formal, persistencia offline de Ionic Storage"],
        ],
        2,
        "Ambiente de ejecución de la campaña",
        "Elaboración propia (2026). La contraseña de evaluación no se versiona; se inyecta por variables de entorno.",
    )
    p(
        doc,
        "No se ejecutaron altas ni borrados masivos contra el inventario de producción, para no contaminar la semilla académica. Los formularios de predio y animal se abrieron y se validó el copy, los campos condicionales por especie y las etiquetas en sentence case, sin pulsar Guardar. Esta decisión es coherente con la ética de un prototipo compartido (Hernández-Sampieri y Mendoza, 2018).",
    )
    p(
        doc,
        "Una pasada exploratoria en Chrome activó el traductor automático del navegador (El Recuerdo apareció como The Memory; la frase «3 predios» se distorsionó). Esos recortes no se interpretan como defectos de inventario. La evidencia de Playwright, sin traductor, muestra los textos originales en español y los conteos correctos.",
    )

    heading(doc, "12.4 Trazabilidad requisitos–casos de prueba", 2)
    p(
        doc,
        "La Tabla 3 vincula los requerimientos funcionales (RF-01 a RF-06), los casos de uso (CU-01 a CU-11) y los identificadores de prueba. La trazabilidad es el mecanismo que evita probar pantallas aisladas sin relación con el alcance del título (IEEE Computer Society, 2014; ISO/IEC/IEEE 29119-1, 2022).",
    )
    add_table(
        doc,
        ["Requisito / CU", "Qué se verifica", "Casos"],
        [
            ["RF-01, CU-01, CU-02, CU-11", "Identidad: login, registro sin rol administrador, guardas, cierre de sesión", "TC-AUTH-01 a 06; EP-01, 02, 03, 14"],
            ["RF-02, CU-04", "Predios: listado, alta (formulario), RUV, GPS, agua", "TC-NAV-02; EP-05, 06"],
            ["RF-03, CU-05", "Animales: especie, campos condicionales, detalle", "TC-NAV-03; EP-07, 08"],
            ["RF-04, CU-03, CU-06, CU-07", "IBA, THI, cinco libertades, tablero, alertas, fechas d MMM, y", "TC-ICA-01 a 06; EP-04, 09"],
            ["RF-05, CU-08", "SED: un snapshot por día, determinismo, sequía vs mejora de instalaciones", "TC-SIM-01 a 03; EP-10"],
            ["RF-06, CU-09", "Foto opcional y reporte imprimible de predio", "TC-NAV-04; EP-11"],
            ["CU-10", "Usuarios y roles; adminGuard", "TC-NAV-05; EP-12, 13"],
            ["RNF seguridad", "HTTPS, RLS, ausencia de service_role, denegación anónima", "TC-SEC-01 a 04; TC-API-04, 06"],
            ["RNF aislamiento", "El productor no ve predios ajenos", "TC-ACL-01, 02"],
        ],
        3,
        "Matriz de trazabilidad entre requisitos, casos de uso y casos de prueba",
        "Elaboración propia (2026), a partir de los RF y CU del trabajo de grado.",
    )

    heading(doc, "12.5 Pruebas unitarias", 2)
    p(
        doc,
        "Las pruebas unitarias examinan funciones puras de src/app/core/welfare-scoring.ts y simulation.ts, que son el núcleo científico del prototipo. Se usaron dos oráculos: (a) node:test importa el TypeScript real, y (b) pytest replica las fórmulas en Python. La doble implementación reduce el riesgo de un test tautológico que solo confirma el mismo error (Myers et al., 2012).",
    )
    p(
        doc,
        "El THI implementado es el índice de Thom (1959) adaptado a ganado, de uso extendido en zootecnia de precisión:",
    )
    p(doc, "THI = (1,8·T + 32) − [(0,55 − 0,0055·HR) · (1,8·T − 26)]", first=False, align="center", italic=True)
    p(
        doc,
        "donde T es la temperatura ambiente en grados Celsius y HR la humedad relativa en porcentaje. Para T = 30 °C y HR = 80 %, el valor es 82,92. Un smoke check previo esperaba 81,3; ese oráculo se corrigió para no dejar un falso positivo. El semáforo del IBA queda en cumple si el índice es ≥ 80, atención si es ≥ 60 y no cumple por debajo de 60. El estrés calórico del porcino entra en emergencia con THI ≥ 84; el de rumiantes, con THI ≥ 90. El espacio mínimo ICA modelado es 4,5 m² (bovino), 1,5 m² (caprino) y 0,85 m² (ceba porcina). La simulación emite un snapshot por día de horizonte, es determinista para la misma semilla y degrada peso e IBA bajo sequía o restricción de alimento frente a la mejora de instalaciones.",
    )
    add_table(
        doc,
        ["Suite", "Casos", "Resultado", "Tiempo"],
        [
            ["node:test (código TypeScript)", "11", "Satisfactorio", "0,17 s"],
            ["pytest (oráculo IBA y visibilidad)", "20", "Satisfactorio", "< 1 s"],
            ["scoring.check.ts", "4 aserciones", "Satisfactorio", "< 1 s"],
        ],
        4,
        "Resultados de las pruebas unitarias",
        "Elaboración propia (2026).",
    )

    heading(doc, "12.6 Pruebas de aceptación", 2)
    p(
        doc,
        "Las pruebas de aceptación se escribieron en Gherkin (lenguaje natural orientado al negocio), según la práctica de desarrollo guiado por comportamiento (North, 2006; ISTQB, 2023). Los escenarios cubren: (a) animal saludable con IBA ≥ 80 y nivel COMPLIANT; (b) THI porcino 85 clasificado como EMERGENCY; (c) existencia de las features como especificación viva. Los tres escenarios pasaron. Complementan, no sustituyen, la tabla EP del prototipo desplegado.",
    )

    heading(doc, "12.7 Pruebas funcionales y de extremo a extremo", 2)
    p(
        doc,
        "Playwright automatizó 14 casos contra Vercel con un único trabajador, para no invalidar la sesión JWT al cerrar sesión en paralelo. En la primera pasada, trece casos fueron satisfactorios y EP-14 falló por una carrera entre signOut y guestGuard. Tras desplegar el arreglo, la suite completa pasó en 13,6 s sobre https://animal-welfare-platform-vepq.vercel.app; el cierre de sesión quedó en 0,9 s.",
    )
    add_table(
        doc,
        ["ID", "Escenario", "Resultado esperado", "Resultado"],
        [
            ["EP-01", "Login administrador", "Tablero ICA y menú inferior", "Satisfactorio"],
            ["EP-02", "Login inválido", "Mensaje en español y permanencia en /login", "Satisfactorio"],
            ["EP-03", "Registro sin rol administrador", "Solo Productor y Veterinario", "Satisfactorio"],
            ["EP-04", "Tablero y alertas", "IBA, cola de riesgo, fechas d MMM, y", "Satisfactorio (IBA medio 81,4)"],
            ["EP-05", "Listar predios", "El Recuerdo, La Esperanza y predios del dueño", "Satisfactorio (3 predios)"],
            ["EP-06", "Formulario de predio", "Título Nuevo predio; RUV, GPS, agua", "Satisfactorio (sin guardar)"],
            ["EP-07", "Inventario animal", "Listado con chapa, especie e IBA", "Satisfactorio (6 ejemplares)"],
            ["EP-08", "Detalle e IBA", "Anillo, dominios e historial", "Satisfactorio"],
            ["EP-09", "Evaluación ICA", "Cinco libertades; IBA al guardar", "Satisfactorio (formulario; alta no ejecutada en prod)"],
            ["EP-10", "Simulación SED", "Listado o detalle con peso, IBA y eventos", "Satisfactorio"],
            ["EP-11", "Reporte de predio", "IBA medio e inventario", "Satisfactorio"],
            ["EP-12", "CRUD usuarios", "Listado de perfiles y roles", "Satisfactorio (4 usuarios)"],
            ["EP-13", "Bloqueo de /app/users", "adminGuard redirige si no es administrador", "Satisfactorio (la cuenta de evaluación sí es admin)"],
            ["EP-14", "Cerrar sesión", "Vuelve a login; /app exige autenticación", "Satisfactorio"],
        ],
        5,
        "Escenarios de prueba de aceptación del prototipo, actualizados con la campaña empírica",
        "Elaboración propia (2026). EP-14 se reejecutó contra el build productivo después de publicar await signOut y el flag que evita restore() durante el cierre.",
    )
    picture(
        doc,
        "01-login.png",
        1,
        "Inicio de sesión del prototipo (Bienestar ICA)",
        "Elaboración propia a partir del despliegue en Vercel (2026). Las etiquetas están en sentence case, conforme a la interfaz del prototipo.",
    )
    picture(
        doc,
        "02-login-error.png",
        2,
        "Rechazo de credenciales inválidas",
        "Elaboración propia (2026). El sistema permanece en /login y muestra el mensaje «Correo o contraseña no válidos».",
    )
    picture(
        doc,
        "03-dashboard.png",
        3,
        "Tablero Estado ICA con IBA medio 81,4 y animal prioritario VACA-087",
        "Elaboración propia (2026). Se observan 5 de 6 evaluados, 3 predios, 4 alertas y un ejemplar fuera de umbral (IBA 45,5).",
    )
    picture(
        doc,
        "18-farms-consistency.png",
        4,
        "Inventario de predios coherente con el tablero",
        "Elaboración propia (2026). El encabezado informa 3 predios: El Recuerdo, La Esperanza y Prueba.",
    )
    picture(
        doc,
        "15-users-admin.png",
        5,
        "Administración de usuarios y roles",
        "Elaboración propia (2026). El encabezado informa 4 usuarios; el rol Administrador no se ofrece en el registro público.",
    )
    picture(
        doc,
        "06-logout.png",
        6,
        "Cierre de sesión correcto en el build productivo de Vercel",
        "Elaboración propia (2026). Tras pulsar Cerrar sesión, la aplicación permanece en /#/login y muestra Entrar.",
    )
    picture(
        doc,
        "10-simulation.png",
        7,
        "Módulo de simulación de eventos discretos",
        "Elaboración propia (2026). El actor nombra el escenario, elige animal, dieta, ambiente y horizonte.",
    )
    picture(
        doc,
        "14-reports.png",
        8,
        "Reporte ICA por predio, listo para imprimir",
        "Elaboración propia (2026).",
    )

    heading(doc, "12.8 Pruebas de interfaz de programación (API)", 2)
    p(
        doc,
        "Aunque el prototipo no expone un API Gateway propio, el contrato con Supabase es el único canal de persistencia en la nube y debe probarse como API REST (campo de Postman en el temario). Se verificaron códigos HTTP, el cuerpo JSON y el aislamiento por Row Level Security (RLS).",
    )
    add_table(
        doc,
        ["Petición", "Esperado", "Obtenido"],
        [
            ["GET del shell en Vercel", "HTTP 200", "200"],
            ["POST Auth, clave inválida", "400/401 sin access_token", "400 invalid_credentials"],
            ["POST Auth, clave válida", "200 y JWT", "200"],
            ["GET /rest/v1/farms con clave anónima", "Arreglo vacío por RLS", "200 []"],
            ["GET /rest/v1/profiles anónimo", "Arreglo vacío", "200 []"],
            ["GET farms autenticado", "Lista JSON", "3 predios"],
            ["GET animals autenticado", "Lista JSON", "6 animales"],
            ["GET profiles (personal técnico)", "Perfiles visibles", "4 filas"],
            ["POST farms sin JWT", "401 o 403", "401/403"],
            ["Latencia de Auth", "< 3 s", "Cumple"],
        ],
        6,
        "Resultados de las pruebas de API sobre Auth y REST de Supabase",
        "Elaboración propia (2026).",
    )

    heading(doc, "12.9 Pruebas de rendimiento", 2)
    p(
        doc,
        "Se simuló un grupo de hilos al estilo de Apache JMeter: 20 usuarios concurrentes y tres iteraciones (60 muestras) contra el home estático de Vercel, más un ping al REST anónimo. El umbral de media fue 2,5 s y el de percentil 95, 4,0 s, holgados para un prototipo académico, pero medibles (Molyneaux, 2014).",
    )
    add_table(
        doc,
        ["Métrica", "Umbral", "Valor medido"],
        [
            ["Muestras", "60", "60"],
            ["Tasa de error HTTP", "0 %", "0 %"],
            ["Media", "< 2 500 ms", "35,9 ms"],
            ["Percentil 95", "< 4 000 ms", "53,4 ms"],
            ["Máximo", "—", "72,7 ms"],
        ],
        7,
        "Métricas de carga del frontend publicado en Vercel",
        "Elaboración propia (2026). El cuello de botella interactivo no es el HTML estático, sino Auth y las consultas con RLS.",
    )

    heading(doc, "12.10 Pruebas de seguridad", 2)
    p(
        doc,
        "Se siguió el OWASP Top 10 (OWASP Foundation, 2021) como lista de verificación defensiva: no se escribieron exploits ni pruebas de penetración ofensivas. El objetivo fue comprobar comportamiento seguro (HTTPS, denegación anónima, ausencia de secretos de servicio en el bundle).",
    )
    add_table(
        doc,
        ["Control", "Hallazgo"],
        [
            ["A02 fallos criptográficos: HTTPS y TLS", "Satisfactorio. Certificado Google Trust Services, HSTS max-age=63072000"],
            ["A01 control de acceso: RLS anónimo", "Satisfactorio. farms y profiles vacíos; insert anónimo denegado"],
            ["API de administración de Auth con clave anónima", "Satisfactorio. HTTP 403"],
            ["Secretos en el bundle del cliente", "Satisfactorio. No hay service_role ni claves privadas"],
            ["A07 identificación: login inválido", "Satisfactorio. API 400; UI en español"],
            ["Cabeceras CSP, X-Frame-Options, nosniff, Referrer-Policy", "X-Frame-Options DENY, nosniff y Referrer-Policy están en producción; CSP no se forzó para no romper Angular"],
            ["Bucket de evidencias fotográficas", "Riesgo residual de diseño: welfare-photos es público en schema.sql"],
        ],
        8,
        "Controles de seguridad evaluados según OWASP Top 10",
        "Elaboración propia (2026).",
    )

    heading(doc, "12.11 Calidad estática del código", 2)
    p(
        doc,
        "En ausencia de un servidor SonarQube institucional, se calculó un conjunto equivalente sobre 39 archivos TypeScript y SCSS: líneas, complejidad ciclomática aproximada, bloques duplicados de seis líneas y un índice de mantenibilidad acotado 0–100. El resultado (Tabla 9) califica A. El archivo más complejo es store.service.ts (61), candidato a partición solo si el dominio crece; no se fragmentó en esta iteración para no introducir capas artificiales.",
    )
    add_table(
        doc,
        ["Métrica", "Valor"],
        [
            ["Archivos", "39"],
            ["Líneas", "5 043"],
            ["Complejidad ciclomática media", "8,13"],
            ["Bloques duplicados", "22"],
            ["TODO / FIXME", "0"],
            ["Índice de mantenibilidad", "95,8"],
            ["Rating", "A"],
        ],
        9,
        "Métricas estáticas de calidad del código fuente",
        "Elaboración propia (2026). Son un proxy de SonarQube, no un análisis de motor comercial.",
    )

    heading(doc, "12.12 Integración continua", 2)
    p(
        doc,
        "GitHub Actions ejecuta, en cada push y pull request, las pruebas unitarias TypeScript, pytest, las métricas estáticas y los casos de API/seguridad que no requieren secreto. El E2E contra Vercel queda en workflow_dispatch, porque la contraseña no debe vivir en el repositorio (Fowler y Foemmel, 2006).",
    )

    heading(doc, "12.13 Resultados consolidados de la campaña", 2)
    p(
        doc,
        "Se ejecutaron 66 casos automatizados y los 66 fueron satisfactorios en el build publicado. La densidad de defectos abiertos es baja y está documentada. El IBA medio observado en el tablero (81,4) es coherente con el inventario (cinco de seis evaluados) y con el animal fuera de umbral (VACA-087, 45,5, alerta de espacio mínimo ICA).",
    )

    heading(doc, "12.14 Defectos identificados y corrección", 2)
    add_table(
        doc,
        ["ID", "Severidad", "Descripción", "Estado"],
        [
            ["DEF-01", "Alta", "Cerrar sesión en Vercel restauraba el JWT: logout() no esperaba supabase.auth.signOut() y guestGuard reenviaba al tablero.", "Corregido y verificado en producción (Playwright, 0,9 s)"],
            ["DEF-02", "Baja", "El alert nativo de ion-select mostraba OK / Cancel en inglés.", "Corregido: okText Aceptar y cancelText Cancelar"],
            ["DEF-03", "Media", "Faltaban X-Frame-Options, X-Content-Type-Options y Referrer-Policy.", "Desplegado en producción. CSP no se impuso"],
            ["DEF-04", "Baja", "El bucket de fotos es público por esquema.", "Riesgo aceptado de prototipo"],
            ["DEF-05", "Baja", "El login publica las credenciales de demostración.", "Aceptable en prototipo; debe retirarse en un entorno productivo"],
        ],
        10,
        "Defectos de la campaña y estado de corrección",
        "Elaboración propia (2026).",
    )
    p(
        doc,
        "El DEF-01 cortaba el caso de uso CU-11 en el build publicado. La causa raíz era una condición de carrera: signOut se disparaba sin await, navigateByUrl('/login') activaba guestGuard y restore() aún encontraba la sesión de Supabase. La corrección espera la invalidación del token, marca la sesión como limpiada para que restore() no la rehidrate y después navega. El 27 de octubre de 2026 se publicó en Vercel y Playwright confirmó el retorno a /#/login. Este hallazgo no debilita el trabajo: ilustra el valor de las pruebas empíricas sobre el despliegue, frente a una tabla de aceptación marcada a priori como satisfactoria (Sommerville, 2016).",
    )

    page_break(doc)
    heading(doc, "13. Resultados", 1)
    p(
        doc,
        "El resultado principal del trabajo es un prototipo funcional, publicado y verificable, que materializa el objetivo general: monitorear, modelar y simular variables de bienestar animal alineadas con el ICA. A diferencia de un mockup, el artefacto calcula el IBA en el cliente, persiste evaluaciones, hallazgos, alertas, fotos y corridas de simulación en PostgreSQL, y aísla al productor mediante políticas RLS.",
    )
    p(
        doc,
        "En el ambiente de evaluación se observó un IBA medio de 81,4 (umbral de cumplimiento), con un ejemplar bovino (VACA-087) en 45,5 y alerta de espacio por debajo del mínimo. El tablero prioriza ese animal y expone cuatro alertas activas. El inventario comprende tres predios georreferenciados y seis animales de las especies bovina, caprina y porcina. El módulo de usuarios lista cuatro perfiles (productor, veterinario y dos administradores). La simulación de un escenario de restricción alimentaria proyectó 125,3 kg y un IBA de 68,2, con gráfica de trayectoria y eventos discretos (hito ICA, peso objetivo, incidente sanitario).",
    )
    p(
        doc,
        "Las pruebas unitarias confirmaron que las ponderaciones de las cinco libertades (25 % nutrición, 20 % entorno, 25 % salud, 15 % conducta y 15 % estado mental), los umbrales 80/60 y el THI coinciden entre el código de producción y el oráculo independiente. Las pruebas de API confirmaron que un cliente anónimo no lee predios ni perfiles. El frontend estático soportó 60 peticiones concurrentes sin error. El prototipo se comporta como PWA usable en viewport de 390 × 844.",
    )
    p(
        doc,
        "Queda explícito lo que el prototipo no es, para no inflar los resultados: no hay red neuronal ni clasificador de machine learning; el IBA es un índice ponderado interpretable; la simulación es un sistema de eventos discretos determinista in silico, no un gemelo digital con sensores IoT; no hay Spring Boot, Firebase ni Cloudinary. Estas precisiones ya constaban en la sección de limitaciones y se reiteran como resultado negativo deliberado, no como incumplimiento accidental.",
    )

    heading(doc, "14. Discusión", 1)
    p(
        doc,
        "Los hallazgos se discuten en tres planos: normativo, ingenieril y metodológico.",
    )
    p(
        doc,
        "En el plano normativo, el prototipo operacionaliza las cinco libertades y los manuales adoptados por las Resoluciones 0136 y 0253 de 2020 (Ministerio de Agricultura y Desarrollo Rural, 2020) y la noción de bienestar del ICA (2020). El semáforo 80/60 no sustituye una inspección oficial, pero convierte el criterio cualitativo en un índice auditable. El THI, con umbrales distintos para porcino y rumiante, responde al estrés calórico como riesgo tropical, en línea con la literatura de zootecnia de precisión (Bayona Sarmiento et al., 2024; Lascano-Rivera et al., 2025). La alerta de espacio mínimo sobre VACA-087 muestra que el sistema no solo registra, sino que interpreta incumplimiento.",
    )
    p(
        doc,
        "En el plano ingenieril, la arquitectura de cliente enriquecido más Backend as a Service se aparta del diseño inicial (microservicios, Spring Boot, Firebase, Cloudinary). La desviación no es un defecto oculto: reduce superficies de ataque (la service_role no viaja al navegador), concentra las reglas ICA en un solo módulo testeable y aprovecha RLS para el aislamiento del productor. El costo es que la “analítica predictiva con IA” del objetivo específico se materializa como un motor de reglas y un SED, no como aprendizaje supervisado. Discutir esa brecha es más honesto —y más evaluable— que atribuir al prototipo una red neuronal inexistente. El SED sí cumple el tercer objetivo específico: permite evaluar in silico dieta y clima antes de intervenir el animal (UNAD, 2025; Plataforma Tierra, 2025).",
    )
    p(
        doc,
        "En el plano metodológico, la campaña confirma que una tabla de 14 escenarios marcada como satisfactoria sin automatizar el cierre de sesión en la nube es insuficiente (Pressman y Maxim, 2015). El DEF-01 solo apareció cuando Playwright esperó la URL /login después de Cerrar sesión; una vez desplegada la corrección, EP-14 pasó en producción. La lección para la Fábrica de Software es incorporar E2E del camino infeliz (logout, guarda, RLS anónimo) en la definición de terminado de cada sprint Scrum. Al mismo tiempo, la pirámide evitó que un error de THI (81,3 versus 82,92) llegara disfrazado de prueba verde.",
    )
    p(
        doc,
        "Respecto a los RNF, HTTPS y HSTS se cumplen; el aislamiento del productor se verifica en unitarias y en RLS; la persistencia offline declarada en el análisis de requerimientos no se implementó ni se probó, y debe retirarse como compromiso del prototipo actual. Las cabeceras CSP incompletas son un riesgo residual típico de SPA Angular y se mitigaron parcialmente con X-Frame-Options y nosniff.",
    )

    heading(doc, "15. Conclusiones", 1)
    p(
        doc,
        "Se concluye que es posible implementar un prototipo de plataforma digital, alineado con lineamientos ICA, que centralice inventario, calcule un índice de bienestar interpretable y simule escenarios productivos mediante eventos discretos. La pregunta de investigación se responde de forma afirmativa, con matices de alcance: la analítica es de reglas y proyección, no de aprendizaje automático, y aun así reduce la brecha entre el registro manual y un tablero de decisión.",
    )
    add_table(
        doc,
        ["Objetivo específico", "Cumplimiento"],
        [
            ["Modelar variables críticas de bienestar (sanidad, nutrición, comportamiento, trazabilidad) bajo estándares ICA", "Cumplido. Cinco libertades, IBA ponderado, THI, espacio mínimo, hallazgos y alertas"],
            ["Diseñar un módulo de analítica predictiva de riesgos mediante técnicas de IA", "Cumplido parcialmente. Hay detección de riesgo (semáforo, alertas, prioridad) sin modelo de machine learning. Debe enunciarse como analítica basada en reglas"],
            ["Implementar un entorno de simulación de intervención técnica", "Cumplido. SED con dieta, clima, horizonte, trayectoria de peso/IBA y eventos discretos"],
        ],
        11,
        "Cumplimiento de los objetivos específicos a la luz de la implementación y de las pruebas",
        "Elaboración propia (2026).",
    )
    p(
        doc,
        "Las pruebas —unitarias, de aceptación, E2E, de API, de carga y de seguridad— aportan evidencia reproducible de que el prototipo publicado es usable por un administrador, que el anónimo no lee datos y que el cierre de sesión (CU-11 / EP-14) permanece en login tras invalidar el JWT. Esa transparencia fortalece, no debilita, la validez del trabajo de grado.",
    )

    heading(doc, "16. Recomendaciones", 1)
    p(doc, "Se recomienda, en este orden:", first=True)
    p(doc, "1. Ajustar el enunciado del segundo objetivo específico en la versión final del documento marco, para que hable de analítica de reglas e índices ICA y no de “técnicas de IA” si no se entrena un modelo.", first=False)
    p(doc, "2. Retirar del alcance vigente el RNF de persistencia offline, o implementarlo con una prueba de sincronización, pero no dejarlo como requisito no verificado.", first=False)
    p(doc, "3. Valorar un Content-Security-Policy explícito cuando pueda ensayarse sin romper Ionic, y restringir el bucket de fotos si el prototipo escala a datos reales de predios.", first=False)
    p(doc, "4. Retirar el hint de credenciales demo en un entorno que deje de ser académico.", first=False)
    p(doc, "5. Como trabajo futuro —no como deuda de este prototipo—, integrar sensores IoT o wearables (Marketintelo, 2025) y, si hay corpus etiquetado, un clasificador de estrés térmico (Lascano-Rivera et al., 2025), manteniendo el IBA actual como línea base interpretable.", first=False)
    p(doc, "6. Registrar E2E_EMAIL y E2E_PASSWORD como secretos de GitHub Actions para que el E2E deje de ser solo local/manual.", first=False)

    page_break(doc)
    heading(doc, "Referencias", 1)
    refs = [
        "Bayona Sarmiento, J. S., Serrano Carrascal, M. K., Navarro Vivas, A. Y., Sarabia Duran, J. J., Ramírez Abril, J. D. y Galvis, J. J. (2024). IA aplicado en ganadería: Sostenibilidad y eficiencia. ResearchGate. https://www.researchgate.net/publication/381227428_IA_APLICADO_EN_GANADERIA",
        "Cohn, M. (2009). Succeeding with Agile: Software development using Scrum. Addison-Wesley.",
        "Fowler, M. y Foemmel, M. (2006). Continuous integration. https://martinfowler.com/articles/continuousIntegration.html",
        "Hernández-Sampieri, R. y Mendoza, C. (2018). Metodología de la investigación: Las rutas cuantitativa, cualitativa y mixta. McGraw-Hill.",
        "IEEE Computer Society. (2014). IEEE standard for software and system test documentation (IEEE Std 829-2008). https://doi.org/10.1109/IEEESTD.2008.4578383",
        "Instituto Colombiano Agropecuario. (2020). ¿Cuál es la definición de bienestar animal? https://www.ica.gov.co/preguntas-frecuentes/subgerencia-de-proteccion-animal/cual-es-la-definicion-de-bienestar-animal",
        "International Software Testing Qualifications Board. (2023). Certified tester foundation level syllabus (v4.0). ISTQB.",
        "ISO/IEC/IEEE. (2022). ISO/IEC/IEEE 29119-1:2022. Software and systems engineering — Software testing — Part 1: General concepts. ISO.",
        "Lascano-Rivera, S. B., Rivera-Escriba, L. A., Balarezo-Urresta, L. R. y Castañeda-Albán, J. E. (2025). Sensores inteligentes y técnicas de machine learning para la detección del estrés en ganado bovino. Innova Science Journal.",
        "Marketintelo. (2025). Livestock wearables market research report 2033. https://marketintelo.com/report/livestock-wearables-market",
        "Ministerio de Agricultura y Desarrollo Rural. (2020a). Resolución 000136 de 2020: Por la cual se adopta el Manual de Condiciones de Bienestar Animal para las especies équidas, porcinas, ovinas y caprinas. Instituto Colombiano Agropecuario.",
        "Ministerio de Agricultura y Desarrollo Rural. (2020b). Resolución 000253 de 2020: Por la cual se adopta el Manual de Condiciones de Bienestar Animal para las especies bovina, bufalina, aves de corral y animales acuáticos. Instituto Colombiano Agropecuario.",
        "Molyneaux, I. (2014). The art of application performance testing (2.ª ed.). O’Reilly.",
        "Myers, G. J., Sandler, C. y Badgett, T. (2012). The art of software testing (3.ª ed.). John Wiley & Sons.",
        "North, D. (2006). Introducing BDD. https://dannorth.net/introducing-bdd/",
        "OWASP Foundation. (2021). OWASP Top 10:2021. https://owasp.org/Top10/",
        "Plataforma Tierra. (2025). Gemelos digitales y simulación in silico: Aplicaciones prácticas en el sector agropecuario. Cajamar. https://www.plataformatierra.es/innovacion/gemelos-digitales-agricultura-ganaderia",
        "Pressman, R. S. y Maxim, B. R. (2015). Software engineering: A practitioner’s approach (8.ª ed.). McGraw-Hill.",
        "Sommerville, I. (2016). Software engineering (10.ª ed.). Pearson.",
        "Thom, E. C. (1959). The discomfort index. Weatherwise, 12(2), 57–61. https://doi.org/10.1080/00431672.1959.9926960",
        "Universidad Nacional Abierta y a Distancia. (2025, 10 de julio). Simuladores: Tecnología e innovación para el bienestar animal [Video]. YouTube. https://www.youtube.com/watch?v=whin9A51uE8",
    ]
    for ref in refs:
        hanging(doc, ref)

    heading(doc, "Anexos", 1)
    heading(doc, "Anexo A. Reproducción de la campaña", 2)
    p(doc, "Los comandos siguientes reproducen las suites en un entorno con Node 22 y Python 3.12:", first=True)
    p(doc, "npx tsx --test tests/unit/domain.test.ts", first=False, align="left")
    p(doc, "pytest tests/unit tests/acceptance tests/api tests/security tests/performance -q", first=False, align="left")
    p(doc, "E2E_EMAIL=… E2E_PASSWORD=… npx playwright test --config tests/e2e/playwright.config.ts", first=False, align="left")
    p(doc, "python3 tests/quality/analyze_quality.py", first=False, align="left")
    p(
        doc,
        "El repositorio es https://github.com/davidrgj/animal-welfare-platform. El IBA está en src/app/core/welfare-scoring.ts y el SED en src/app/core/simulation.ts. Las políticas de administrador están en supabase/admin-policies.sql.",
        first=True,
    )
    heading(doc, "Anexo B. Nota sobre el uso de este fascículo", 2)
    p(
        doc,
        "Este documento está redactado para insertarse como capítulos 12 a 16 del trabajo de grado, sustituyendo la tabla EP preliminar y llenando las secciones de resultados, discusión, conclusiones y recomendaciones que aún no tenían desarrollo. Las referencias deben fusionarse con el capítulo 17 general, eliminando duplicados y conservando un único orden alfabético APA.",
    )

    doc.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
