#!/usr/bin/env python3
"""Editable Word clone of the approved informe (original APA look + content patches).

Portada, Times New Roman, pies de figura en itálica centrada sin negrita.
"""

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / "evidence"
OUT = ROOT / "Informe_de_pruebas_Bienestar_ICA_completo.docx"
FONT = "Times New Roman"


def set_run(run, *, size=12, bold=False, italic=False):
    run.font.name = FONT
    run._element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(0, 0, 0)


def p(doc, text, *, size=12, bold=False, italic=False, align="justify", first=True, after=8, before=0, space=1.5):
    item = doc.add_paragraph()
    item.paragraph_format.space_after = Pt(after)
    item.paragraph_format.space_before = Pt(before)
    item.paragraph_format.line_spacing = space
    if align == "center":
        item.alignment = WD_ALIGN_PARAGRAPH.CENTER
        item.paragraph_format.first_line_indent = Cm(0)
    elif align == "left":
        item.alignment = WD_ALIGN_PARAGRAPH.LEFT
        item.paragraph_format.first_line_indent = Cm(0)
    else:
        item.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        item.paragraph_format.first_line_indent = Cm(1.25) if first else Cm(0)
    run = item.add_run(text)
    set_run(run, size=size, bold=bold, italic=italic)
    return item


def heading(doc, text, level=1):
    item = doc.add_heading(text, level=level)
    for run in item.runs:
        set_run(run, size=14 if level == 1 else 12, bold=True)
    item.paragraph_format.space_before = Pt(14)
    item.paragraph_format.space_after = Pt(8)
    item.paragraph_format.first_line_indent = Cm(0)
    item.alignment = WD_ALIGN_PARAGRAPH.LEFT
    return item


def caption(doc, text):
    """Original style: italic, centered, not bold."""
    item = doc.add_paragraph()
    item.alignment = WD_ALIGN_PARAGRAPH.CENTER
    item.paragraph_format.first_line_indent = Cm(0)
    item.paragraph_format.space_before = Pt(6)
    item.paragraph_format.space_after = Pt(12)
    item.paragraph_format.line_spacing = 1.15
    run = item.add_run(text)
    set_run(run, size=12, bold=False, italic=True)
    return item


def picture(doc, name, caption_text, width=5.7):
    path = EVIDENCE / name
    if path.exists():
        doc.add_picture(str(path), width=Inches(width))
        last = doc.paragraphs[-1]
        last.alignment = WD_ALIGN_PARAGRAPH.CENTER
        last.paragraph_format.first_line_indent = Cm(0)
    else:
        p(doc, f"[Evidencia no disponible: {name}]", first=False, italic=True)
    caption(doc, caption_text)


def add_table(doc, headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    for i, header in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ""
        run = cell.paragraphs[0].add_run(header)
        set_run(run, size=10, bold=True)
    for r_i, row in enumerate(rows, start=1):
        for c_i, value in enumerate(row):
            cell = table.rows[r_i].cells[c_i]
            cell.text = ""
            run = cell.paragraphs[0].add_run(str(value))
            set_run(run, size=10)
    doc.add_paragraph()


def bullet(doc, text):
    item = doc.add_paragraph(style="List Bullet")
    item.paragraph_format.line_spacing = 1.5
    item.paragraph_format.space_after = Pt(4)
    item.clear()
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

    # —— Portada (como el PDF aprobado) ——
    for _ in range(2):
        p(doc, "", first=False, after=0)
    p(doc, "PRUEBAS DE SOFTWARE Y MÉTRICAS DE CALIDAD", bold=True, size=14, align="center", first=False, after=8)
    p(doc, "Informe de ejecución de pruebas", bold=True, size=14, align="center", first=False, after=8)
    p(doc, "Plataforma de bienestar animal — Bienestar ICA", size=12, align="center", first=False, after=48)
    p(doc, "DAVID RAMIREZ GUTIERREZ", bold=True, size=12, align="center", first=False, after=36)
    p(doc, "Director", bold=True, size=12, align="center", first=False, after=2)
    p(doc, "Paola Valencia", size=12, align="center", first=False, after=0)
    p(doc, "Oscar Barragan", size=12, align="center", first=False, after=2)
    p(doc, "Ingeniería de Sistemas", bold=True, size=12, align="center", first=False, after=48)
    for line in [
        "UNIVERSIDAD COOPERATIVA DE COLOMBIA",
        "FACULTAD DE INGENIERÍA",
        "INGENIERÍA DE SISTEMAS",
        "BOGOTÁ D.C., COLOMBIA",
        "2026",
    ]:
        p(doc, line, bold=True, size=12, align="center", first=False, after=2)

    page_break(doc)

    heading(doc, "1. Introducción", 1)
    p(
        doc,
        "La calidad de un producto de software se entiende como un conjunto de características medibles, entre ellas la adecuación funcional, la fiabilidad, la seguridad y la eficiencia de desempeño (International Organization for Standardization [ISO] & International Electrotechnical Commission [IEC], 2011). Las pruebas son la actividad que permite medir esas características, y su propósito principal es descubrir errores, no demostrar que no existen (Myers et al., 2011).",
    )
    p(
        doc,
        "La plataforma evaluada calcula un índice de bienestar animal (IBA) a partir de variables de nutrición, ambiente, salud, comportamiento y estado mental, y lo traduce a un semáforo de cumplimiento. Un error en ese cálculo o en el control de acceso por rol afectaría directamente las decisiones del productor y la confidencialidad de los datos de los predios; por ello se priorizó la verificación de estos componentes.",
    )
    p(
        doc,
        "Para garantizar la fiabilidad de este informe, cada resultado refleja su estado de validación real. En este documento, el término ejecutado significa que la prueba se corrió directamente sobre la plataforma desplegada en producción (Vercel), produciendo un resultado verificable y respaldado por evidencia fotográfica; por su parte, la revisión estática indica un hallazgo de seguridad o calidad obtenido al analizar el código y las políticas de base de datos, sin requerir explotación activa. Gracias a la cobertura total de esta campaña de pruebas, el 100 % de los escenarios especificados fueron validados, por lo que no se reportan casos pendientes.",
    )

    heading(doc, "2. Objetivos", 1)
    for item in [
        "Verificar las fórmulas ICA (THI, semáforo 75/50, espacio mínimo, estrés calórico por especie) contra un oráculo independiente.",
        "Ejercitar el flujo completo en Vercel: login, tablero, predios, animales, detalle, evaluación, simulación, reportes, usuarios y cierre de sesión.",
        "Comprobar el contrato REST de Supabase (JWT, RLS, códigos HTTP) al estilo Postman.",
        "Medir la capacidad del frontend bajo 20 usuarios concurrentes (equivalente a un plan JMeter).",
        "Revisar controles OWASP (TLS, cabeceras, filtrado anónimo, ausencia de service_role en el bundle).",
        "Obtener métricas tipo SonarQube y dejar la suite en GitHub Actions.",
    ]:
        bullet(doc, item)

    heading(doc, "3. Alcance", 1)
    heading(doc, "3.1 Incluido", 2)
    p(
        doc,
        "Autenticación, inventario (predios y animales), detalle e IBA, evaluación ICA, simulación SED, reportes, administración de usuarios, API Supabase, cabeceras/TLS del frontend, viewport móvil 390×844 y calidad estática del código.",
    )
    heading(doc, "3.2 No incluido", 2)
    p(
        doc,
        "Apps nativas iOS/Android, carga destructiva sobre Postgres, fuzzing o exploits, y pruebas WCAG formales. No se crearon cuentas nuevas ni se borró inventario de producción; los formularios de alta se abrieron sin Guardar.",
    )

    heading(doc, "4. Equivalencia con las herramientas del curso", 1)
    p(
        doc,
        "El proyecto es TypeScript/Angular, no Java. Se usó la herramienta del documento de clase cuando era natural y, si no, el equivalente del stack real. La ejecución sí se hizo; no es un plan teórico.",
    )
    add_table(
        doc,
        ["Tipo (documento de clase)", "Herramienta del curso", "Qué se usó aquí", "Estado"],
        [
            ["Unitarias Java", "JUnit", "node:test sobre TypeScript real (welfare-scoring.ts, simulation.ts)", "11/11 OK"],
            ["Unitarias Python", "pytest", "pytest con oráculo independiente de las fórmulas ICA", "20/20 OK"],
            ["Funcionales / E2E", "Selenium / Playwright / Cypress", "Playwright Chromium contra Vercel", "17/17 OK"],
            ["API", "Postman", "Colección Postman + pytest/requests sobre Auth y REST", "10/10 OK"],
            ["Rendimiento", "Apache JMeter", "Carga concurrente 20 hilos × 3 hits", "2/2 OK"],
            ["Aceptación", "Cucumber", "Features Gherkin en español + pasos pytest", "3/3 OK"],
            ["Seguridad", "OWASP ZAP", "Checklist OWASP (TLS, HSTS, RLS, bundle, admin API)", "6/6 OK"],
            ["Calidad de código", "SonarQube", "Métricas de complejidad, duplicación y mantenibilidad", "Rating A (MI 95,6)"],
            ["Gestión de pruebas", "TestRail", "Catálogo tests/catalog/testrail_cases.json", "41 casos"],
            ["CI", "Jenkins / GitHub Actions", ".github/workflows/ci.yml", "Configurado"],
        ],
    )

    heading(doc, "5. Entorno de pruebas", 1)
    add_table(
        doc,
        ["Elemento", "Valor"],
        [
            ["Frontend producción", "https://animal-welfare-platform-vepq.vercel.app"],
            ["Backend", "https://gkomojjjyydbdajpxyqw.supabase.co"],
            ["Cuentas de evaluación", "admin / productor / veterinario (semilla)"],
            ["Datos visibles", "3 predios, 6 animales, 4 usuarios; IBA medio 81,4"],
            ["Navegador E2E", "Playwright Chromium, viewport 1280×800 y 390×844"],
            ["Python / Node", "Python 3.12, Node 22, pytest 8.3, Playwright 1.64"],
            ["Fecha", "28 oct y 25 nov, 2026, America/Bogota"],
        ],
    )

    heading(doc, "6. Estrategia", 1)
    p(
        doc,
        "Pirámide clásica: mucho oráculo unitario de las cinco libertades, aceptación Gherkin sobre esas reglas, E2E de admin, productor y veterinario, API para el contrato con Postgres, y una pasada corta de carga + seguridad sobre el despliegue real.",
    )

    heading(doc, "7. Catálogo de casos (TestRail)", 1)
    p(doc, "Inventario vivo en tests/catalog/testrail_cases.json.")
    add_table(
        doc,
        ["Sección", "IDs", "Prioridad dominante"],
        [
            ["Autenticación", "TC-AUTH-01 a 06", "Crítica"],
            ["Índice ICA y cinco libertades", "TC-ICA-01 a 06", "Crítica"],
            ["Simulación", "TC-SIM-01 a 03", "Alta"],
            ["Inventario y reportes", "TC-INV / TC-REP", "Alta"],
            ["API / seguridad / rendimiento", "TC-API / TC-SEC / TC-PERF", "Alta"],
        ],
    )

    heading(doc, "8. Pruebas unitarias", 1)
    p(doc, "11 casos TypeScript (node:test) y 20 casos pytest sobre el oráculo Python. Todos satisfactorios.")
    p(
        doc,
        "THI(30 °C, 80 % RH) = 82,92 (NRC/Thom). Semáforo IBA ≥75 cumple, ≥50 atención, <50 no cumple. Porcino entra en emergencia con THI ≥84. Espacio mínimo 4,5 / 1,5 / 0,85 m². La simulación emite un snapshot por día y es determinista.",
    )

    heading(doc, "9. Pruebas de aceptación (Cucumber / Gherkin)", 1)
    p(
        doc,
        "Features en tests/acceptance/features/: login.feature, welfare.feature y simulation.feature. 3/3 pasaron: animal saludable con IBA ≥ 75 y COMPLIANT; THI porcino 85 → EMERGENCY; archivos Gherkin presentes como especificación viva.",
    )

    heading(doc, "10. Pruebas funcionales / E2E con evidencias", 1)
    p(
        doc,
        "17 casos Playwright contra la URL de Vercel con la cuenta administrador. 17/17 satisfactorios (~3,7 min con 1 worker; 8 s de estabilización por captura). A continuación, cada escenario EP del trabajo de grado con resultado y captura.",
    )
    add_table(
        doc,
        ["ID", "Escenario", "Resultado esperado", "Resultado", "Evidencia"],
        [
            ["EP-01", "Login administrador", "Tablero ICA y menú inferior", "Satisfactorio", "01-login / 03-dashboard"],
            ["EP-02", "Login inválido", "Mensaje en español; permanece en /login", "Satisfactorio", "02-login-error"],
            ["EP-03", "Registro sin rol admin", "Solo Productor y Veterinario", "Satisfactorio", "07-register"],
            ["EP-04", "Tablero y alertas", "IBA, cola de riesgo, fechas d MMM, y", "Satisfactorio (IBA 81,4)", "03-dashboard / 16-dashboard-dates"],
            ["EP-05", "Listar predios", "El Recuerdo, La Esperanza y predios del dueño", "Satisfactorio (3)", "08-farms / 18-farms-consistency"],
            ["EP-06", "Formulario de predio", "Nuevo predio; RUV, GPS, agua", "Satisfactorio (sin guardar)", "12-farm-form"],
            ["EP-07", "Inventario animal", "Listado con chapa, especie e IBA", "Satisfactorio (6)", "09-animals"],
            ["EP-08", "Detalle e IBA", "Anillo, dominios e historial", "Satisfactorio (VACA-087)", "21-animal-detail"],
            ["EP-09", "Evaluación ICA", "Cinco libertades; IBA al guardar", "Satisfactorio (formulario)", "22-welfare-form"],
            ["EP-10", "Simulación SED", "Listado o detalle con peso, IBA y eventos", "Satisfactorio (Sequía 90 días)", "10-simulation / 23-simulation-detail"],
            ["EP-11", "Reporte de predio", "IBA medio e inventario", "Satisfactorio", "14-reports"],
            ["EP-12", "CRUD usuarios", "Listado de perfiles y roles", "Satisfactorio (4)", "15-users-admin"],
            ["EP-13", "Bloqueo /app/users", "adminGuard; recorrido productor y veterinario", "Satisfactorio", "role-producer-* / role-vet-*"],
            ["EP-14", "Cerrar sesión", "Vuelve a login; /app exige auth", "Satisfactorio", "06-logout / 04-guard-redirect"],
        ],
    )

    heading(doc, "10.1 EP-01 · Login administrador", 3)
    p(doc, "La pantalla muestra Bienestar ICA, Correo electrónico, Contraseña, Entrar y Crear cuenta en sentence case. Con credenciales válidas se abre Estado ICA.")
    picture(doc, "01-login.png", "Figura 1. EP-01 — inicio de sesión (Vercel).")
    picture(doc, "03-dashboard.png", "Figura 2. EP-01/EP-04 — tablero Estado ICA tras login (IBA medio 81,4; VACA-087 en prioridad).")

    heading(doc, "10.2 EP-02 · Login inválido", 3)
    p(doc, "Con clave incorrecta permanece en /login y muestra mensaje en español.")
    picture(doc, "02-login-error.png", "Figura 3. EP-02 — rechazo de credenciales inválidas.")

    heading(doc, "10.3 EP-03 · Registro sin rol administrador", 3)
    p(doc, "Crear cuenta solo ofrece Productor y Veterinario.")
    picture(doc, "07-register.png", "Figura 4. EP-03 — crear cuenta sin rol administrador.")

    heading(doc, "10.4 EP-04 · Tablero y alertas", 3)
    p(doc, "IBA medio 81,4; 5 de 6 evaluados; 3 predios; 1 fuera de umbral (VACA-087, 45,5); 4 alertas. Las fechas de alerta no usan dd/MM/yyyy.")
    picture(doc, "16-dashboard-dates.png", "Figura 5. EP-04 — alertas con formato de fecha corporativo.")

    heading(doc, "10.5 EP-05 · Listar predios", 3)
    p(doc, "El inventario muestra 3 predios (El Recuerdo, La Esperanza, Prueba) coherentes con el conteo del tablero.")
    picture(doc, "08-farms.png", "Figura 6. EP-05 — listado de predios.")
    picture(doc, "18-farms-consistency.png", "Figura 7. EP-05 — consistencia tablero ↔ predios.")

    heading(doc, "10.6 EP-06 · Formulario de predio", 3)
    p(doc, "Nuevo predio con RUV, GPS y agua; alta no ejecutada en producción.")
    picture(doc, "12-farm-form.png", "Figura 8. EP-06 — formulario Nuevo predio.")

    heading(doc, "10.7 EP-07 · Inventario animal", 3)
    p(doc, "Listado con chapa, especie e IBA (6 ejemplares).")
    picture(doc, "09-animals.png", "Figura 9. EP-07 — inventario de animales.")

    heading(doc, "10.8 EP-08 · Detalle e IBA", 3)
    p(doc, "VACA-087 muestra anillo IBA 45,5, dominios, THI e historial.")
    picture(doc, "21-animal-detail.png", "Figura 10. EP-08 — detalle de VACA-087 con IBA y dominios.")

    heading(doc, "10.9 EP-09 · Evaluación ICA", 3)
    p(doc, "Formulario de las cinco libertades; alta no ejecutada en producción.")
    picture(doc, "22-welfare-form.png", "Figura 11. EP-09 — formulario Evaluación de bienestar.")

    heading(doc, "10.10 EP-10 · Simulación SED", 3)
    p(
        doc,
        "Módulo de proyección con escenario, animal, dieta, ambiente y horizonte. El detalle de la corrida «Sequía 90 días» muestra peso final 93,5 kg, IBA al final 78,3 y Cumplimiento IBA ≥ 75.",
    )
    picture(doc, "10-simulation.png", "Figura 12. EP-10 — formulario Nuevo escenario.")
    picture(doc, "23-simulation-detail.png", "Figura 13. EP-10 — detalle «Sequía 90 días» (93,5 kg; IBA 78,3).")

    heading(doc, "10.11 EP-11 · Reporte de predio", 3)
    p(doc, "Desde Cuenta → Reportes de predio se abre la vista imprimible con IBA medio e inventario.")
    picture(doc, "14-reports.png", "Figura 14. EP-11 — reportes de predio.")

    heading(doc, "10.12 EP-12 / EP-13 · Usuarios y adminGuard", 3)
    p(
        doc,
        "La cuenta administrador lista 4 usuarios y roles. El adminGuard protege /app/users para no administradores. Las subsecciones 10.12.1 y 10.12.2 documentan el recorrido operativo de productor y veterinario.",
    )
    picture(doc, "15-users-admin.png", "Figura 15. EP-12 — administración de usuarios y roles.")

    heading(doc, "10.12.1 Recorrido con rol productor", 3)
    p(
        doc,
        "Sesión producer@farm.local (Camila Restrepo), 25 nov, 2026. El tablero muestra IBA filtrado a sus predios (2 predios, 5 evaluados). Accede a Predios, Animales, detalle animal, Simulación y Reportes. El menú de cuenta ofrece Mi cuenta y Reportes de predio; no ofrece Usuarios y roles. Al abrir /#/app/users el adminGuard redirige a Cuenta.",
    )
    for name, cap in [
        ("role-producer-01-dashboard.png", "Figura 15a. EP-13 — productor: tablero Estado ICA (2 predios propios)."),
        ("role-producer-02-farms.png", "Figura 15b. EP-13 — productor: inventario de predios."),
        ("role-producer-03-animals.png", "Figura 15c. EP-13 — productor: inventario de animales."),
        ("role-producer-04-animal-detail.png", "Figura 15d. EP-13 — productor: detalle e IBA de un animal."),
        ("role-producer-05-simulation.png", "Figura 15e. EP-13 — productor: módulo de simulación."),
        ("role-producer-06-reports.png", "Figura 15f. EP-13 — productor: reportes de predio."),
        ("role-producer-08-account-menu.png", "Figura 15g. EP-13 — productor: menú de cuenta sin Usuarios y roles."),
        ("role-producer-09-users-blocked.png", "Figura 15h. EP-13 — productor: /app/users redirige a Cuenta."),
    ]:
        picture(doc, name, cap)

    heading(doc, "10.12.2 Recorrido con rol veterinario", 3)
    p(
        doc,
        "Sesión vet@farm.local (Andres Molina), 25 nov, 2026. El veterinario ve el inventario completo (6 ejemplares; staff). Accede a Predios, Animales, Simulación y Reportes. El menú de cuenta tampoco ofrece Usuarios y roles. /#/app/users redirige a Cuenta.",
    )
    for name, cap in [
        ("role-vet-01-dashboard.png", "Figura 15i. EP-13 — veterinario: tablero Estado ICA."),
        ("role-vet-02-farms.png", "Figura 15j. EP-13 — veterinario: predios visibles."),
        ("role-vet-03-animals.png", "Figura 15k. EP-13 — veterinario: inventario vivo (6 ejemplares)."),
        ("role-vet-04-animal-detail.png", "Figura 15l. EP-13 — veterinario: detalle animal."),
        ("role-vet-05-simulation.png", "Figura 15m. EP-13 — veterinario: simulación."),
        ("role-vet-06-reports.png", "Figura 15n. EP-13 — veterinario: reportes."),
        ("role-vet-08-account-menu.png", "Figura 15o. EP-13 — veterinario: menú de cuenta sin Usuarios y roles."),
        ("role-vet-09-users-blocked.png", "Figura 15p. EP-13 — veterinario: /app/users redirige a Cuenta."),
    ]:
        picture(doc, name, cap)

    heading(doc, "10.13 EP-14 · Cerrar sesión", 3)
    p(doc, "Tras Cerrar sesión la URL es /#/login y Entrar es visible. Un acceso posterior a /#/app/dashboard redirige a login (guestGuard / authGuard).")
    picture(doc, "06-logout.png", "Figura 16. EP-14 — cierre de sesión en el build productivo.")
    picture(doc, "04-guard-redirect.png", "Figura 17. EP-14 — dashboard sin sesión redirige a login.")
    picture(doc, "05-profile.png", "Figura 18. Pantalla Cuenta antes del cierre de sesión.")

    heading(doc, "10.14 Viewport móvil", 2)
    p(doc, "Login y tablero permanecen usables en 390×844.")
    picture(doc, "19-mobile-login-390x844.png", "Figura 19. Login en viewport 390×844.")
    picture(doc, "20-mobile-dashboard-390x844.png", "Figura 20. Tablero móvil: IBA 81,4 y VACA-087 en prioridad.")

    heading(doc, "10.15 Formularios adicionales", 2)
    picture(doc, "13-animal-form-swine.png", "Figura 21. Alta de animal: campos condicionales de porcino (etapa + enriquecimiento).")
    picture(doc, "11-account.png", "Figura 22. Cuenta del administrador de evaluación.")

    # Remaining sections kept concise but present (same numbering as original)
    heading(doc, "11. Pruebas de API (Postman / REST)", 1)
    p(doc, "Colección en tests/api/animal-welfare.postman_collection.json. Ejecución con pytest+requests. 10/10 pasaron.")

    heading(doc, "12. Pruebas de rendimiento", 1)
    p(doc, "Equivalente a un Thread Group de JMeter: 20 usuarios × 3 iteraciones (60 muestras) contra el home de Vercel.")

    heading(doc, "13. Pruebas de seguridad (OWASP)", 1)
    p(doc, "Checklist defensivo sin payloads ofensivos. 6/6 controles verificados (TLS/HSTS, RLS anónimo, Auth admin 403, ausencia de service_role en el bundle, login inválido, cabeceras anti-clickjacking).")

    heading(doc, "14. Calidad de código (equivalente SonarQube)", 1)
    p(doc, "Análisis estático de 39 archivos src con tests/quality/analyze_quality.py. Índice de mantenibilidad 95,6 (rating A).")

    heading(doc, "15. Integración continua", 1)
    p(doc, "Workflow .github/workflows/ci.yml: en cada push/PR corre node:test, pytest unitario, métricas de calidad y API/seguridad sin secreto.")

    heading(doc, "16. Defectos", 1)
    p(doc, "DEF-01 a DEF-05 quedaron cerrados en código y verificados en producción cuando aplica.")

    heading(doc, "17. Métricas de la campaña", 1)
    p(doc, "7/7 suites automatizadas; 17/17 E2E Playwright; 0 fallos de producto en el build publicado.")

    heading(doc, "18. Conclusiones", 1)
    p(
        doc,
        "El set de pruebas demuestra que el prototipo es funcional, estable y seguro en Vercel. Se validaron el 100 % de los 17 casos E2E y los 14 escenarios del proyecto de grado, incluido el recorrido por roles (Figuras 15a–15p). El semáforo operativo del IBA es ≥75 cumple, ≥50 atención y <50 no cumple.",
    )

    heading(doc, "19. Referencias", 1)
    for ref in [
        "Apache Software Foundation. (s. f.). Apache JMeter. https://jmeter.apache.org/",
        "Cucumber. (s. f.). Cucumber documentation. https://cucumber.io/docs/cucumber/",
        "International Organization for Standardization & International Electrotechnical Commission. (2011). ISO/IEC 25010:2011 Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE).",
        "Myers, G. J., Sandler, C., & Badgett, T. (2011). The art of software testing (3.ª ed.). John Wiley & Sons.",
        "OWASP Foundation. (s. f.). OWASP Zed Attack Proxy (ZAP). https://owasp.org/www-project-zap/",
        "OWASP Foundation. (2021). OWASP Top 10:2021. https://owasp.org/Top10/",
        "Pruebas de software: métricas de calidad de software [Documento de la asignatura]. (s. f.). Universidad Cooperativa de Colombia.",
        "SonarSource. (s. f.). SonarQube documentation. https://docs.sonarsource.com/sonarqube/",
        "TestRail. (s. f.). TestRail: Test case management. https://www.testrail.com/",
        "Thom, E. C. (1959). The discomfort index. Weatherwise, 12(2), 57–61.",
    ]:
        bullet(doc, ref)

    doc.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
