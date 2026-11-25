#!/usr/bin/env python3
"""Continuation of §10.12 (EP-13 role walkthroughs) for the approved test report.

Inserts after page 15 of Informe_de_pruebas (after Figura 15 / before 10.13).
Not an annex — numbered 10.12.1 and 10.12.2.
"""

from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Image, KeepTogether, Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / "evidence"
UPLOADS = Path("/home/ubuntu/.cursor/projects/agent-repos-animal-welfare-platform/uploads")
BASE_PDF = next(UPLOADS.glob("Informe_de_pruebas*.pdf"))
INSERT_PDF = ROOT / "Continuacion_10_12_EP13_roles.pdf"
OUT_PDF = ROOT / "Informe_de_pruebas_Bienestar_ICA_con_EP13_roles.pdf"
# After page 15 (1-based): Figura 15 ends; 10.13 starts on the same page in the
# approved PDF. Inserted sheets continue 10.12 before the reader reaches 10.13 figures.
INSERT_AFTER_PAGE = 15

PRODUCER_FIGURES = [
    ("role-producer-01-dashboard.png", "Figura 15a. EP-13 — productor: tablero Estado ICA (2 predios propios)."),
    ("role-producer-02-farms.png", "Figura 15b. EP-13 — productor: inventario de predios."),
    ("role-producer-03-animals.png", "Figura 15c. EP-13 — productor: inventario de animales."),
    ("role-producer-04-animal-detail.png", "Figura 15d. EP-13 — productor: detalle e IBA de un animal."),
    ("role-producer-05-simulation.png", "Figura 15e. EP-13 — productor: módulo de simulación."),
    ("role-producer-06-reports.png", "Figura 15f. EP-13 — productor: reportes de predio."),
    ("role-producer-08-account-menu.png", "Figura 15g. EP-13 — productor: menú de cuenta sin Usuarios y roles."),
    ("role-producer-09-users-blocked.png", "Figura 15h. EP-13 — productor: /app/users redirige a Cuenta."),
]

VET_FIGURES = [
    ("role-vet-01-dashboard.png", "Figura 15i. EP-13 — veterinario: tablero Estado ICA."),
    ("role-vet-02-farms.png", "Figura 15j. EP-13 — veterinario: predios visibles."),
    ("role-vet-03-animals.png", "Figura 15k. EP-13 — veterinario: inventario vivo (6 ejemplares)."),
    ("role-vet-04-animal-detail.png", "Figura 15l. EP-13 — veterinario: detalle animal."),
    ("role-vet-05-simulation.png", "Figura 15m. EP-13 — veterinario: simulación."),
    ("role-vet-06-reports.png", "Figura 15n. EP-13 — veterinario: reportes."),
    ("role-vet-08-account-menu.png", "Figura 15o. EP-13 — veterinario: menú de cuenta sin Usuarios y roles."),
    ("role-vet-09-users-blocked.png", "Figura 15p. EP-13 — veterinario: /app/users redirige a Cuenta."),
]


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "TitleAPA",
            parent=base["Heading1"],
            fontName="Times-Bold",
            fontSize=14,
            leading=18,
            alignment=TA_CENTER,
            spaceAfter=12,
        ),
        "h2": ParagraphStyle(
            "HeadingAPA",
            parent=base["Heading2"],
            fontName="Times-Bold",
            fontSize=12,
            leading=16,
            spaceBefore=12,
            spaceAfter=8,
        ),
        "body": ParagraphStyle(
            "BodyAPA",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=12,
            leading=18,
            alignment=TA_JUSTIFY,
            firstLineIndent=1.25 * cm,
            spaceAfter=8,
        ),
        "caption": ParagraphStyle(
            "CaptionAPA",
            parent=base["Normal"],
            fontName="Times-Bold",
            fontSize=11,
            leading=14,
            alignment=TA_LEFT,
            spaceBefore=4,
            spaceAfter=2,
        ),
        "note": ParagraphStyle(
            "NoteAPA",
            parent=base["Normal"],
            fontName="Times-Italic",
            fontSize=10,
            leading=13,
            alignment=TA_LEFT,
            spaceAfter=10,
        ),
    }


def add_figure(story, filename: str, caption: str, note: str, s: dict) -> None:
    path = EVIDENCE / filename
    if not path.exists():
        story.append(Paragraph(f"[Evidencia no disponible: {filename}]", s["note"]))
        return
    width = 15.2 * cm
    height = width * 800 / 1280
    block = [
        Image(str(path), width=width, height=height, kind="proportional"),
        Paragraph(caption, s["caption"]),
        Paragraph(note, s["note"]),
    ]
    story.append(KeepTogether(block))


def build_continuation() -> Path:
    s = styles()
    doc = SimpleDocTemplate(
        str(INSERT_PDF),
        pagesize=letter,
        leftMargin=3 * cm,
        rightMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )
    story = []

    story.append(Paragraph("10.12 EP-12 / EP-13 · Continuación (recorrido por rol)", s["title"]))
    story.append(
        Paragraph(
            "Esta continuación forma parte de la sección 10.12 del informe de pruebas. "
            "Tras la Figura 15 (administración de usuarios con rol administrador), se documenta "
            "el recorrido operativo de productor y veterinario: módulos visibles, visualización "
            "de información (tablero, predios, animales, detalle, simulación, reportes), menú "
            "de cuenta y bloqueo de /app/users. No es un anexo.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Procedimiento. Autenticación en https://animal-welfare-platform-vepq.vercel.app/ "
            "con producer@farm.local y vet@farm.local. Viewport 1280 × 800. Capturas tras "
            "estabilización de la interfaz (Playwright).",
            s["body"],
        )
    )

    story.append(Paragraph("10.12.1 Recorrido con rol productor", s["h2"]))
    story.append(
        Paragraph(
            "Sesión producer@farm.local (Camila Restrepo). El tablero muestra IBA filtrado a "
            "sus predios (2 predios, 5 evaluados). Accede a Predios, Animales, detalle animal, "
            "Simulación y Reportes. El menú de cuenta ofrece Mi cuenta y Reportes de predio; "
            "no ofrece Usuarios y roles. Al abrir /#/app/users el adminGuard redirige a Cuenta.",
            s["body"],
        )
    )
    for filename, caption in PRODUCER_FIGURES:
        add_figure(
            story,
            filename,
            caption,
            "Nota. Rol Productor. Elaboración propia a partir del despliegue en Vercel (2026).",
            s,
        )

    story.append(Paragraph("10.12.2 Recorrido con rol veterinario", s["h2"]))
    story.append(
        Paragraph(
            "Sesión vet@farm.local (Andres Molina). El veterinario ve el inventario completo "
            "(6 ejemplares; staff). Accede a Predios, Animales, Simulación y Reportes. El menú "
            "de cuenta tampoco ofrece Usuarios y roles. /#/app/users redirige a Cuenta.",
            s["body"],
        )
    )
    for filename, caption in VET_FIGURES:
        add_figure(
            story,
            filename,
            caption,
            "Nota. Rol Veterinario. Elaboración propia a partir del despliegue en Vercel (2026).",
            s,
        )

    story.append(Spacer(1, 8))
    story.append(
        Paragraph(
            "Resultado EP-13. Satisfactorio para productor y veterinario: cada rol visualiza "
            "los módulos operativos de su perfil; la administración de usuarios permanece "
            "oculta en el menú y bloqueada por adminGuard al forzar la URL.",
            s["body"],
        )
    )

    doc.build(story)
    return INSERT_PDF


def merge() -> Path:
    base = PdfReader(str(BASE_PDF))
    insert = PdfReader(str(INSERT_PDF))
    writer = PdfWriter()
    for page in base.pages[:INSERT_AFTER_PAGE]:
        writer.add_page(page)
    for page in insert.pages:
        writer.add_page(page)
    for page in base.pages[INSERT_AFTER_PAGE:]:
        writer.add_page(page)
    with OUT_PDF.open("wb") as handle:
        writer.write(handle)
    return OUT_PDF


if __name__ == "__main__":
    insert = build_continuation()
    merged = merge()
    print("base", BASE_PDF, "pages", len(PdfReader(str(BASE_PDF)).pages))
    print("insert", insert, "pages", len(PdfReader(str(insert)).pages))
    print("merged", merged, "pages", len(PdfReader(str(merged)).pages))
    print("insert_after_page", INSERT_AFTER_PAGE)
