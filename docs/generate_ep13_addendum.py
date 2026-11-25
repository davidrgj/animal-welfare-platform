#!/usr/bin/env python3
"""Anexo corto EP-13 (productor/veterinario) para complementar el informe aprobado."""

from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, inch
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / "evidence"
UPLOADS = Path("/home/ubuntu/.cursor/projects/agent-repos-animal-welfare-platform/uploads")
BASE_PDF = next(UPLOADS.glob("Informe_de_pruebas*.pdf"))
ADDENDUM_PDF = ROOT / "Anexo_EP13_productor_veterinario.pdf"
OUT_PDF = ROOT / "Informe_de_pruebas_Bienestar_ICA_con_EP13_roles.pdf"


def build_addendum() -> Path:
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "TitleAPA",
        parent=styles["Heading1"],
        fontName="Times-Bold",
        fontSize=14,
        leading=18,
        alignment=TA_CENTER,
        spaceAfter=14,
    )
    heading = ParagraphStyle(
        "HeadingAPA",
        parent=styles["Heading2"],
        fontName="Times-Bold",
        fontSize=12,
        leading=16,
        spaceBefore=10,
        spaceAfter=8,
    )
    body = ParagraphStyle(
        "BodyAPA",
        parent=styles["Normal"],
        fontName="Times-Roman",
        fontSize=12,
        leading=18,
        alignment=TA_JUSTIFY,
        firstLineIndent=1.25 * cm,
        spaceAfter=8,
    )
    caption = ParagraphStyle(
        "CaptionAPA",
        parent=styles["Normal"],
        fontName="Times-Bold",
        fontSize=11,
        leading=14,
        alignment=TA_LEFT,
        spaceBefore=6,
        spaceAfter=4,
    )
    note = ParagraphStyle(
        "NoteAPA",
        parent=styles["Normal"],
        fontName="Times-Italic",
        fontSize=10,
        leading=13,
        alignment=TA_LEFT,
        spaceAfter=12,
    )

    doc = SimpleDocTemplate(
        str(ADDENDUM_PDF),
        pagesize=letter,
        leftMargin=3 * cm,
        rightMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )
    story = []
    story.append(Paragraph("Anexo A. Evidencia complementaria de EP-13 (productor y veterinario)", title))
    story.append(
        Paragraph(
            "Este anexo complementa la sección 10.12 del informe de pruebas ya aprobado. "
            "En la campaña original, EP-13 se documentó con la sesión de administrador y con "
            "revisión del adminGuard en código. Aquí se agrega evidencia gráfica de las sesiones "
            "de productor y veterinario sobre el despliegue en Vercel.",
            body,
        )
    )
    story.append(
        Paragraph(
            "Procedimiento. Se autenticó cada rol en https://animal-welfare-platform-vepq.vercel.app/ "
            "y se navegó a /#/app/users. El adminGuard redirigió a /#/app/profile (pantalla Cuenta). "
            "En ambos casos no aparece el botón Usuarios y roles. Viewport 1280 × 800; captura tras "
            "estabilización de la interfaz.",
            body,
        )
    )
    story.append(Paragraph("Resultado", heading))
    story.append(
        Paragraph(
            "EP-13 satisfactorio para productor y veterinario: el acceso a /app/users queda bloqueado "
            "por redirección a Cuenta, y el módulo de administración de usuarios no se expone en la "
            "interfaz de esos roles.",
            body,
        )
    )

    producer = EVIDENCE / "24-ep13-producer-users-blocked.png"
    vet = EVIDENCE / "25-ep13-vet-users-blocked.png"
    width = 15.5 * cm

    story.append(Image(str(producer), width=width, height=width * 800 / 1280, kind="proportional"))
    story.append(Paragraph("Figura A1. EP-13 — productor redirigido a Cuenta tras intentar /app/users.", caption))
    story.append(
        Paragraph(
            "Nota. Rol Productor (Camila Restrepo). No se muestra Usuarios y roles. Elaboración propia a partir del despliegue en Vercel (2026).",
            note,
        )
    )

    story.append(Image(str(vet), width=width, height=width * 800 / 1280, kind="proportional"))
    story.append(Paragraph("Figura A2. EP-13 — veterinario redirigido a Cuenta tras intentar /app/users.", caption))
    story.append(
        Paragraph(
            "Nota. Rol Veterinario (Andres Molina). No se muestra Usuarios y roles. Elaboración propia a partir del despliegue en Vercel (2026).",
            note,
        )
    )

    doc.build(story)
    return ADDENDUM_PDF


def merge() -> Path:
    writer = PdfWriter()
    for page in PdfReader(str(BASE_PDF)).pages:
        writer.add_page(page)
    for page in PdfReader(str(ADDENDUM_PDF)).pages:
        writer.add_page(page)
    with OUT_PDF.open("wb") as handle:
        writer.write(handle)
    return OUT_PDF


if __name__ == "__main__":
    addendum = build_addendum()
    merged = merge()
    print("base", BASE_PDF)
    print("addendum", addendum, "pages", len(PdfReader(str(addendum)).pages))
    print("merged", merged, "pages", len(PdfReader(str(merged)).pages))
