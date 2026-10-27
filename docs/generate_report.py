#!/usr/bin/env python3
"""Generate the software-testing Word report."""

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / "evidence"
OUT = ROOT / "Informe_pruebas_software_Bienestar_ICA.docx"


def set_run(run, *, size=11, bold=False, color=None):
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    run.font.size = Pt(size)
    run.bold = bold
    if color:
        run.font.color.rgb = RGBColor(*color)


def heading(doc, text, level=1):
    para = doc.add_heading(text, level=level)
    for run in para.runs:
        run.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)
    return para


def para(doc, text, *, bold=False, size=11, center=False, space_after=8):
    item = doc.add_paragraph()
    if center:
        item.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = item.add_run(text)
    set_run(run, size=size, bold=bold)
    item.paragraph_format.space_after = Pt(space_after)
    return item


def add_table(doc, headers, rows):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    for index, header in enumerate(headers):
        cell = table.rows[0].cells[index]
        cell.text = header
        for run in cell.paragraphs[0].runs:
            set_run(run, size=10, bold=True)
    for row_index, row in enumerate(rows, start=1):
        for col_index, value in enumerate(row):
            cell = table.rows[row_index].cells[col_index]
            cell.text = str(value)
            for run in cell.paragraphs[0].runs:
                set_run(run, size=10)
    doc.add_paragraph()
    return table


def picture(doc, name, caption, width=6.2):
    path = EVIDENCE / name
    if not path.exists():
        para(doc, f"[Evidencia no disponible: {name}]", size=9)
        return
    doc.add_picture(str(path), width=Inches(width))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = cap.add_run(caption)
    set_run(run, size=9)
    run.italic = True
    cap.paragraph_format.space_after = Pt(14)


def main() -> None:
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Cm(2)
    section.bottom_margin = Cm(2)
    section.left_margin = Cm(2.2)
    section.right_margin = Cm(2.2)

    para(doc, "PRUEBAS DE SOFTWARE Y MÉTRICAS DE CALIDAD", bold=True, size=14, center=True, space_after=4)
    para(doc, "Informe de ejecución de pruebas", bold=True, size=22, center=True, space_after=6)
    para(doc, "Plataforma de bienestar animal — Bienestar ICA", size=14, center=True, space_after=18)
    para(doc, "Aplicación bajo prueba: https://animal-welfare-platform-vepq.vercel.app", center=True, space_after=2)
    para(doc, "Fecha de ejecución: 27 oct, 2026 (America/Bogota)", center=True, space_after=2)
    para(doc, "Autor: David Ramirez  ·  Cuenta de evaluación: rxgdavid@gmail.com (administrador)", center=True, space_after=24)
    para(
        doc,
        "Este informe cubre el plan, la ejecución y las métricas de las pruebas unitarias, de aceptación, funcionales/E2E, de API, de rendimiento, de seguridad, de calidad de código y de integración continua, alineadas con el documento de clase «Pruebas de Software / Métricas de Calidad de Software».",
        space_after=18,
    )

    heading(doc, "1. Introducción", 1)
    para(
        doc,
        "Bienestar ICA es una PWA (Ionic + Angular) para monitorear y simular el bienestar de bovinos, caprinos y porcinos según las cinco libertades y el semáforo ICA. El índice de bienestar (IBA), el THI y la simulación de eventos discretos corren en el cliente. La persistencia de producción está en Supabase (Postgres + Auth + Storage) y el frontend se publica en Vercel.",
    )
    para(
        doc,
        "El objetivo de esta campaña es demostrar, con evidencia reproducible, que el producto cumple las reglas de negocio del IBA, que las pantallas críticas funcionan con un usuario real en el entorno desplegado, y que la API, la seguridad y el rendimiento están dentro de umbrales aceptables para un prototipo en producción.",
    )

    heading(doc, "2. Objetivos", 1)
    bullets = [
        "Verificar las fórmulas ICA (THI, semáforo 80/60, espacio mínimo, estrés calórico por especie) contra un oráculo independiente.",
        "Ejercitar el flujo completo en la URL de Vercel: login, tablero, predios, animales, simulación, reportes, usuarios y cierre de sesión.",
        "Comprobar el contrato REST de Supabase (JWT, RLS, códigos HTTP) al estilo Postman.",
        "Medir la capacidad del frontend bajo 20 usuarios concurrentes (equivalente a un plan JMeter).",
        "Revisar controles OWASP (TLS, cabeceras, filtrado anónimo, ausencia de service_role en el bundle).",
        "Obtener métricas tipo SonarQube y dejar la suite en GitHub Actions.",
    ]
    for item in bullets:
        para(doc, "•  " + item, space_after=4)

    heading(doc, "3. Alcance", 1)
    heading(doc, "3.1 Incluido", 2)
    para(doc, "Módulos de autenticación, inventario (predios y animales), evaluación ICA, simulación, reportes, administración de usuarios, API Supabase, cabeceras/TLS del frontend y calidad estática del código TypeScript/SCSS.")
    heading(doc, "3.2 No incluido", 2)
    para(doc, "Pruebas nativas iOS/Android, carga destructiva sobre Postgres, fuzzing o exploits, y pruebas de accesibilidad WCAG formales. No se crearon cuentas nuevas ni se borró inventario de producción.")

    heading(doc, "4. Equivalencia con las herramientas del curso", 1)
    para(doc, "El proyecto es TypeScript/Angular, no Java. Se usó la herramienta del documento de clase cuando era natural y, si no, el equivalente del stack real. La ejecución sí se hizo; no es un plan teórico.")
    add_table(
        doc,
        ["Tipo (documento de clase)", "Herramienta del curso", "Qué se usó aquí", "Estado"],
        [
            ["Unitarias Java", "JUnit", "node:test sobre el código TypeScript real (welfare-scoring.ts, simulation.ts)", "11/11 OK"],
            ["Unitarias Python", "pytest", "pytest con oráculo independiente de las fórmulas ICA", "20/20 OK"],
            ["Funcionales / E2E", "Selenium / Playwright / Cypress", "Playwright (Chromium) contra Vercel y local", "13/14 prod; logout OK en local"],
            ["API", "Postman", "Colección Postman + pytest/requests sobre Auth y REST", "10/10 OK"],
            ["Rendimiento", "Apache JMeter", "Carga concurrente (20 hilos × 3 hits) equivalente a un Thread Group", "2/2 OK"],
            ["Aceptación", "Cucumber", "Features Gherkin en español + pasos pytest", "3/3 OK"],
            ["Seguridad", "OWASP ZAP", "Checklist OWASP (TLS, HSTS, RLS, bundle, admin API) sin payloads ofensivos", "6/6 OK + hallazgos"],
            ["Calidad de código", "SonarQube", "Métricas de complejidad, duplicación y mantenibilidad", "Rating A"],
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
            ["Usuario de evaluación", "rxgdavid@gmail.com (rol ADMINISTRATOR)"],
            ["Datos visibles", "3 predios (El Recuerdo, La Esperanza, Prueba), 6 animales, 4 usuarios"],
            ["Local", "http://localhost:4200 (ng serve) para verificar el arreglo de logout"],
            ["Navegador E2E", "Playwright Chromium 156, viewport 1280×800"],
            ["Python / Node", "Python 3.12, Node 22, pytest 8.3, Playwright 1.64"],
            ["Fecha", "27 oct, 2026, zona America/Bogota"],
        ],
    )

    heading(doc, "6. Estrategia", 1)
    para(doc, "Pirámide clásica: mucho oráculo unitario de las cinco libertades (barato y determinista), aceptación Gherkin sobre esas mismas reglas, E2E de los caminos que un productor o un administrador sí recorre, API para el contrato con Postgres, y una pasada corta de carga + seguridad sobre el despliegue real.")
    para(doc, "Las mutaciones (alta/baja de predios o animales) no se ejecutaron contra producción para no contaminar el inventario. Los formularios se abrieron y se validó el copy y los campos condicionales, sin Guardar.")

    heading(doc, "7. Catálogo de casos (TestRail)", 1)
    para(doc, "El inventario vivo está en tests/catalog/testrail_cases.json. Resumen:")
    add_table(
        doc,
        ["Sección", "IDs", "Prioridad dominante"],
        [
            ["Autenticación", "TC-AUTH-01 a 06", "Crítica"],
            ["Índice ICA y cinco libertades", "TC-ICA-01 a 06", "Crítica"],
            ["Simulación", "TC-SIM-01 a 03", "Alta"],
            ["Inventario y navegación", "TC-NAV-01 a 05", "Alta"],
            ["API REST Supabase", "TC-API-01 a 06", "Crítica"],
            ["Rendimiento", "TC-PERF-01 a 02", "Media"],
            ["Seguridad", "TC-SEC-01 a 04", "Crítica"],
            ["Visibilidad por rol", "TC-ACL-01 a 02", "Alta"],
        ],
    )

    heading(doc, "8. Pruebas unitarias (pytest y node:test)", 1)
    para(doc, "Se probaron las funciones puras de src/app/core/welfare-scoring.ts y simulation.ts con node:test (equivalente JUnit sobre el código real) y un oráculo Python en tests/unit/scoring_lib.py (pytest).")
    heading(doc, "8.1 Resultados", 2)
    add_table(
        doc,
        ["Suite", "Casos", "Resultado", "Tiempo"],
        [
            ["node:test tests/unit/domain.test.ts", "11", "Pass", "0.17 s"],
            ["pytest tests/unit (scoring + acceso)", "20", "Pass", "< 1 s"],
            ["src/app/core/scoring.check.ts", "4 asserts", "Pass", "< 1 s"],
        ],
    )
    heading(doc, "8.2 Hallazgos de oráculo", 2)
    para(doc, "El smoke check anterior esperaba THI(30 °C, 80 % RH) = 81.3. La fórmula NRC implementada produce 82.92. Se corrigió el oráculo (scoring.check.ts y los tests) para no dejar un falso verde. La fórmula en producción es:")
    para(doc, "THI = (1.8·T + 32) − [(0.55 − 0.0055·RH) · (1.8·T − 26)]", center=True)
    para(doc, "Otros resultados: semáforo IBA ≥80 cumple, ≥60 atención, <60 no cumple; porcino entra en emergencia con THI ≥84 (rumiante ≥90); espacio mínimo 4.5 / 1.5 / 0.85 m² (bovino / caprino / ceba); la simulación emite un snapshot por día y es determinista para la misma semilla; sequía y restricción de alimento bajan peso e IBA frente a mejora de instalaciones.")

    heading(doc, "9. Pruebas de aceptación (Cucumber / Gherkin)", 1)
    para(doc, "Features en español en tests/acceptance/features/: login.feature, welfare.feature y simulation.feature. Los pasos se ejecutan con pytest (test_bdd.py). 3/3 pasaron: animal saludable con IBA ≥ 80 y COMPLIANT; THI porcino 85 → EMERGENCY; archivos Gherkin presentes como especificación viva.")

    heading(doc, "10. Pruebas funcionales / E2E (Playwright)", 1)
    para(doc, "14 casos contra la URL de Vercel con la cuenta de administrador. 13 pasaron. El único fallo de producción es el cierre de sesión (DEF-01), reproducido dos veces y corregido en el código; verificado en local (1.4 s, pass).")
    add_table(
        doc,
        ["Caso", "Resultado en Vercel", "Notas"],
        [
            ["Login copy sentence case (Bienestar ICA, Correo electrónico, Entrar)", "Pass", ""],
            ["Password inválido muestra «Correo o contraseña no válidos»", "Pass", "Permanece en /login"],
            ["Login válido abre Estado ICA", "Pass", "IBA medio 81.4; VACA-087 en riesgo"],
            ["Guard de /app/dashboard sin sesión", "Pass", "Redirect a login"],
            ["Cerrar sesión", "Fail (prod) / Pass (local)", "DEF-01: race de signOut"],
            ["Registro oculta rol administrador", "Pass", "Productor y veterinario sí"],
            ["Guest guard con sesión activa", "Pass", "Login → dashboard"],
            ["Inventario predios vs tablero", "Pass", "3 predios: El Recuerdo, La Esperanza, Prueba"],
            ["Tab bar predios / animales / simulación / cuenta", "Pass", ""],
            ["Formulario nuevo predio", "Pass", "Título «Nuevo predio»"],
            ["Campos condicionales de porcino", "Pass", "Etapa + enriquecimiento"],
            ["Reportes desde cuenta", "Pass", ""],
            ["Usuarios (admin)", "Pass", "4 usuarios listados"],
            ["Formato de fecha en alertas", "Pass", "Sin dd/MM/yyyy"],
        ],
    )
    picture(doc, "01-login.png", "Figura 1. Pantalla de inicio de sesión (Vercel).")
    picture(doc, "02-login-error.png", "Figura 2. Rechazo de credenciales inválidas.")
    picture(doc, "03-dashboard.png", "Figura 3. Tablero Estado ICA: IBA 81.4, 1 animal fuera de umbral (VACA-087).")
    picture(doc, "18-farms-consistency.png", "Figura 4. Inventario de predios coherente con el tablero.")
    picture(doc, "15-users-admin.png", "Figura 5. Administración de usuarios (4 cuentas).")
    picture(doc, "06-logout.png", "Figura 6. Cierre de sesión correcto en el build local (tras el arreglo).")

    heading(doc, "11. Pruebas de API (Postman / REST)", 1)
    para(doc, "Colección en tests/api/animal-welfare.postman_collection.json. Ejecución con pytest+requests. 10/10 pasaron.")
    add_table(
        doc,
        ["Petición", "Esperado", "Obtenido"],
        [
            ["GET / (Vercel)", "200 + shell SPA", "200"],
            ["POST /auth/v1/token password inválido", "400/401 sin token", "400 invalid_credentials"],
            ["POST /auth/v1/token válido", "200 + JWT", "200, email rxgdavid@gmail.com"],
            ["GET /rest/v1/farms con anon key", "[] por RLS", "200 []"],
            ["GET /rest/v1/profiles con anon key", "[] por RLS", "200 []"],
            ["GET farms autenticado", "lista JSON", "3 predios"],
            ["GET animals autenticado", "lista JSON", "6 animales"],
            ["GET profiles autenticado (staff)", "perfiles", "4 filas, rol ADMINISTRATOR en la cuenta de evaluación"],
            ["POST farms sin JWT", "401/403", "401/403"],
            ["Latencia de auth", "< 3 s", "Cumple"],
        ],
    )

    heading(doc, "12. Pruebas de rendimiento (equivalente JMeter)", 1)
    para(doc, "Thread Group simulado: 20 usuarios, 3 iteraciones (60 muestras) contra el home estático de Vercel, más un ping al REST anónimo.")
    add_table(
        doc,
        ["Métrica", "Umbral", "Medido"],
        [
            ["Muestras", "60", "60"],
            ["Errores HTTP", "0 %", "0 %"],
            ["Media", "< 2 500 ms", "35.9 ms"],
            ["p95", "< 4 000 ms", "53.4 ms"],
            ["Máximo", "—", "72.7 ms"],
        ],
    )
    para(doc, "El frontend estático de Vercel responde muy por debajo del umbral. El cuello de botella real en uso interactivo es Auth + RLS, no el HTML. Auth se midió aparte y quedó bajo 3 s.")

    heading(doc, "13. Pruebas de seguridad (OWASP)", 1)
    para(doc, "No se escribieron exploits ni payloads ofensivos. Se verificó comportamiento seguro: TLS, HSTS, RLS, bloqueo del Admin API y ausencia de secretos de servicio en el bundle.")
    add_table(
        doc,
        ["Control OWASP", "Resultado", "Detalle"],
        [
            ["A02 Cryptographic failures — HTTPS/TLS", "Pass", "Certificado Google Trust Services WR1, vigente hasta 27 nov, 2026"],
            ["HSTS", "Pass", "max-age=63072000; includeSubDomains; preload"],
            ["A01 Broken access control — RLS anon", "Pass", "farms y profiles vacíos sin JWT; insert anon denegado"],
            ["Admin Auth API con anon key", "Pass", "HTTP 403"],
            ["Secretos en el bundle", "Pass", "No hay service_role ni claves privadas"],
            ["A07 Identification — login inválido", "Pass", "API 400; UI mensaje en español"],
            ["Cabeceras CSP / X-Frame-Options / nosniff", "Hallazgo", "DEF-03: CSP sigue ausente; X-Frame-Options, nosniff y Referrer-Policy quedan en vercel.json pendientes de deploy"],
            ["Storage de fotos público", "Riesgo residual", "DEF-04: bucket welfare-photos es public en schema.sql"],
        ],
    )

    heading(doc, "14. Calidad de código (equivalente SonarQube)", 1)
    para(doc, "Análisis estático de 39 archivos src (TypeScript + SCSS) con tests/quality/analyze_quality.py.")
    add_table(
        doc,
        ["Métrica", "Valor"],
        [
            ["Archivos", "39"],
            ["Líneas", "5 043"],
            ["Complejidad ciclomática media", "8.13"],
            ["Bloques duplicados (6 líneas)", "22"],
            ["TODO/FIXME", "0"],
            ["Índice de mantenibilidad", "95.8"],
            ["Rating", "A"],
            ["Archivo más complejo", "store.service.ts (61)"],
        ],
    )
    para(doc, "Recomendación: store.service.ts concentra CRUD y el armado del tablero; es el único candidato claro a partir si crece el dominio. No se partió en esta campaña (regla de no sobreingeniería).")

    heading(doc, "15. Integración continua (GitHub Actions)", 1)
    para(doc, "Workflow .github/workflows/ci.yml: en cada push/PR corre node:test, pytest unitario, métricas de calidad y los casos de API/seguridad que no necesitan secreto. El E2E contra Vercel queda en workflow_dispatch con E2E_EMAIL / E2E_PASSWORD como secrets, para no grabar la contraseña en el repositorio.")

    heading(doc, "16. Defectos", 1)
    add_table(
        doc,
        ["ID", "Severidad", "Resumen", "Estado"],
        [
            ["DEF-01", "Alta", "Cerrar sesión en producción vuelve al tablero: logout() no esperaba supabase.auth.signOut() y el guestGuard restauraba la sesión.", "Corregido en código; falta desplegar Vercel"],
            ["DEF-02", "Baja", "El alert nativo de ion-select muestra OK / Cancel en inglés.", "Abierto (copy de Ionic)"],
            ["DEF-03", "Media", "Faltaban X-Frame-Options, nosniff y Referrer-Policy. CSP no se forzó para no romper Angular.", "Headers añadidos en vercel.json; falta deploy"],
            ["DEF-04", "Baja", "El bucket de evidencias fotográficas es público por esquema.", "Riesgo aceptado de diseño"],
            ["DEF-05", "Baja", "La pantalla de login publica las credenciales demo (producer@farm.local).", "Abierto; útil en prototipo, no en producción dura"],
        ],
    )
    para(doc, "DEF-01 — evidencia: en Vercel, tras pulsar «Cerrar sesión», Playwright registró navegación a #/app/dashboard en lugar de #/login (timeout 25 s). Causa: signOut asíncrono sin await. Arreglo en AuthService.logout(): await supabase().auth.signOut() y después navigateByUrl('/login'). Rechequeo local: pass en 1.4 s (figura 6).")

    heading(doc, "17. Métricas de calidad de la campaña", 1)
    add_table(
        doc,
        ["Indicador", "Valor"],
        [
            ["Casos automatizados ejecutados (prod + unit + API + sec + perf + aceptación)", "66"],
            ["Pasados", "65 (el 66.º es DEF-01 en Vercel; pasa en local)"],
            ["Fallidos de producto en producción", "1 (logout)"],
            ["Densidad de defectos abiertos", "4 residuales + 1 corregido pendiente de deploy"],
            ["Cobertura funcional de pantallas", "Login, registro, tablero, predios, alta predio, animales, detalle, evaluación ICA, alta animal (porcino), reportes, usuarios, simulación y detalle, cuenta; login+tablero en 390×844"],
            ["Tasa de error de carga 60 hits", "0 %"],
            ["Rating estático", "A (MI 95.8)"],
            ["Tiempo de suite unitaria", "< 1 s"],
            ["Tiempo E2E producción (14 casos, 1 worker)", "1.1 min + reintento del logout"],
        ],
    )

    heading(doc, "18. Conclusiones y recomendaciones", 1)
    para(doc, "La plataforma es usable en producción para un administrador: el IBA, el inventario y las reglas de las cinco libertades coinciden entre el código, el oráculo Python y lo que se ve en Vercel (IBA medio 81.4, VACA-087 en 45.5 con alerta de espacio mínimo ICA). RLS de Supabase no filtra datos al anónimo. El frontend estático es rápido.")
    para(doc, "El defecto que sí corta un flujo de usuario es el cierre de sesión en el build publicado. Ya está corregido en esta rama; hay que desplegar Vercel para que TC-AUTH-04 quede verde en producción.")
    para(doc, "Recomendaciones, en orden: 1) publicar el arreglo de logout y los headers de vercel.json; 2) valorar un CSP explícito cuando se pueda probar sin romper Ionic; 3) traducir OK/Cancel del ion-select o usar interface action-sheet; 4) quitar el hint de credenciales demo si el entorno deja de ser prototipo; 5) registrar E2E_EMAIL y E2E_PASSWORD como secrets de GitHub para correr Playwright en CI.")
    para(doc, "No hace falta Grok Bot ni un entorno extra: la campaña se ejecutó contra la URL real y se revalidó el arreglo en local. La contraseña de evaluación no se versiona; se inyecta por E2E_EMAIL / E2E_PASSWORD.")

    heading(doc, "19. Cómo reproducir", 1)
    para(doc, "npm install && pip install -r tests/requirements.txt")
    para(doc, "npx tsx --test tests/unit/domain.test.ts && pytest tests/unit tests/acceptance tests/api tests/security tests/performance -q")
    para(doc, "E2E_EMAIL=… E2E_PASSWORD=… npx playwright test --config tests/e2e/playwright.config.ts")
    para(doc, "python3 tests/quality/analyze_quality.py")

    heading(doc, "Anexo. Evidencias fotográficas adicionales", 1)
    picture(doc, "04-guard-redirect.png", "Figura 7. Guard: dashboard sin sesión redirige a login.")
    picture(doc, "07-register.png", "Figura 8. Crear cuenta.")
    picture(doc, "12-farm-form.png", "Figura 9. Formulario de nuevo predio.")
    picture(doc, "10-simulation.png", "Figura 10. Simulación de escenarios.")
    picture(doc, "14-reports.png", "Figura 11. Reportes de predio.")
    picture(doc, "05-profile.png", "Figura 12. Cuenta del administrador de evaluación.")
    picture(doc, "10-welfare-evaluation-form.png", "Figura 13. Formulario de evaluación ICA (cinco libertades).")
    picture(doc, "12-simulation-detail.png", "Figura 14. Detalle de simulación: peso 125.3 kg, IBA proyectado 68.2 (sesión exploratoria; el navegador tenía traductor activo, el copy original es español).")
    picture(doc, "19-mobile-login-390x844.png", "Figura 15. Login en viewport 390×844.")
    picture(doc, "20-mobile-dashboard-390x844.png", "Figura 16. Tablero móvil: IBA 81.4, VACA-087 en riesgo, sentence case en español.")
    para(
        doc,
        "Nota sobre evidencias exploratorias: una pasada manual en Chrome activó el traductor automático (El Recuerdo → The Memory, 3 predios → «0 properties»). Eso no es un defecto del producto. Playwright sin traductor muestra «3 predios», «4 usuarios» y los nombres en español. Los conteos del DOM coinciden con {{ farms.length }} / {{ animals.length }} / {{ users.length }}.",
    )

    para(doc, "Fin del informe.", bold=True, center=True, space_after=0)
    doc.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
