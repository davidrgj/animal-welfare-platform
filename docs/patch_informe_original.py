#!/usr/bin/env python3
"""Surgical content-only patch of the approved test report PDF.

Preserves cover, spacing, Times fonts, and italic centered figure captions.
Changes only advisor content: thresholds, §5/§6, Figura 13 shot, roles, Vitest.
"""

from __future__ import annotations

from pathlib import Path

import pymupdf as fitz

ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / "evidence"
UPLOADS = Path("/home/ubuntu/.cursor/projects/agent-repos-animal-welfare-platform/uploads")
BASE = next(UPLOADS.glob("Informe_de_pruebas__1946.pdf"), None) or next(
    UPLOADS.glob("Informe_de_pruebas__1__*.pdf")
)
OUT = ROOT / "Informe_de_pruebas_Bienestar_ICA_completo.pdf"
LEGACY = ROOT / "Informe_de_pruebas_Bienestar_ICA_con_EP13_roles.pdf"
SEQ_SHOT = EVIDENCE / "23-simulation-detail.png"

FONT = "times-roman"
FONT_I = "times-italic"
FONT_B = "times-bold"
SIZE = 12


def redact_replace(page: fitz.Page, old: str, new: str, *, fontsize: float = SIZE) -> int:
    hits = page.search_for(old)
    for rect in hits:
        # Widen slightly when replacement is longer so glyphs are not clipped.
        grow = max(0, (len(new) - len(old)) * fontsize * 0.42)
        box = fitz.Rect(rect.x0, rect.y0, min(page.rect.x1 - 40, rect.x1 + grow), rect.y1)
        page.add_redact_annot(
            box,
            text=new,
            fontname=FONT,
            fontsize=fontsize,
            fill=(1, 1, 1),
            text_color=(0, 0, 0),
            align=fitz.TEXT_ALIGN_LEFT,
        )
    if hits:
        page.apply_redactions(images=0)
    return len(hits)


def cover_rect(page: fitz.Page, rect: fitz.Rect) -> None:
    page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1), overlay=True)


def centered_italic(page: fitz.Page, y: float, text: str) -> None:
    width = fitz.get_text_length(text, fontname=FONT_I, fontsize=SIZE)
    x0 = (page.rect.width - width) / 2
    page.insert_text((x0, y), text, fontname=FONT_I, fontsize=SIZE, color=(0, 0, 0))


def patch_text(doc: fitz.Document) -> None:
    p2 = doc[1]
    n = redact_replace(p2, "semáforo 80/60", "semáforo 75/50")
    print("p2 80/60→75/50", n)

    p4 = doc[3]
    print("p4 usuario", redact_replace(p4, "Usuario de evaluación", "Cuentas de evaluación"))
    print(
        "p4 email",
        redact_replace(p4, "rxgdavid@gmail.com (rol ADMINISTRATOR)", "admin / productor / veterinario (semilla)"),
    )
    print(
        "p4 fecha",
        redact_replace(p4, "28 oct, 2026, zona America/Bogota", "28 oct y 25 nov, 2026, America/Bogota"),
    )
    print(
        "p4 estrategia",
        redact_replace(
            p4,
            "E2E de los caminos de un administrador",
            "E2E de admin, productor y veterinario",
        ),
    )
    print(
        "p4 semaforo",
        redact_replace(
            p4,
            "Semáforo IBA ≥80 cumple, ≥60 atención, <60 no",
            "Semáforo IBA ≥75 cumple, ≥50 atención, <50 no",
        ),
    )

    p5 = doc[4]
    print("p5 iba", redact_replace(p5, "IBA ≥ 80 y COMPLIANT", "IBA ≥ 75 y COMPLIANT"))


def remove_vitest(doc: fitz.Document) -> None:
    """Cover only the Vitest bibliography line on the last page (after inserts)."""
    page = doc[-1]
    hits = page.search_for("Vitest")
    if not hits:
        print("Vitest already absent")
        return
    url = page.search_for("vitest.dev")
    y0 = min(h.y0 for h in hits) - 2
    y1 = max((u.y1 for u in url), default=max(h.y1 for h in hits)) + 3
    cover_rect(page, fitz.Rect(62, y0, 550, y1))
    print("Vitest line covered on last page")


def patch_figure_13(doc: fitz.Document) -> None:
    page = doc[13]
    xref = page.get_images()[0][0]
    page.replace_image(xref, filename=str(SEQ_SHOT))
    print("fig13 image replaced", xref)

    old_cap = "Figura 13. EP-10 — detalle de simulación (peso, IBA, trayectoria)."
    new_cap = "Figura 13. EP-10 — detalle «Sequía 90 días» (93,5 kg; IBA 78,3)."
    hits = page.search_for(old_cap)
    if not hits:
        # try shorter
        hits = page.search_for("Figura 13. EP-10")
    if hits:
        r = hits[0]
        # Cover full original caption line width
        cover_rect(page, fitz.Rect(90, r.y0 - 1, 522, r.y1 + 2))
        centered_italic(page, r.y1 - 3, new_cap)
        print("fig13 caption updated")


PRODUCER = [
    ("role-producer-01-dashboard.png", "Figura 15a. EP-13 — productor: tablero Estado ICA (2 predios propios)."),
    ("role-producer-02-farms.png", "Figura 15b. EP-13 — productor: inventario de predios."),
    ("role-producer-03-animals.png", "Figura 15c. EP-13 — productor: inventario de animales."),
    ("role-producer-04-animal-detail.png", "Figura 15d. EP-13 — productor: detalle e IBA de un animal."),
    ("role-producer-05-simulation.png", "Figura 15e. EP-13 — productor: módulo de simulación."),
    ("role-producer-06-reports.png", "Figura 15f. EP-13 — productor: reportes de predio."),
    ("role-producer-08-account-menu.png", "Figura 15g. EP-13 — productor: menú de cuenta sin Usuarios y roles."),
    ("role-producer-09-users-blocked.png", "Figura 15h. EP-13 — productor: /app/users redirige a Cuenta."),
]

VET = [
    ("role-vet-01-dashboard.png", "Figura 15i. EP-13 — veterinario: tablero Estado ICA."),
    ("role-vet-02-farms.png", "Figura 15j. EP-13 — veterinario: predios visibles."),
    ("role-vet-03-animals.png", "Figura 15k. EP-13 — veterinario: inventario vivo (6 ejemplares)."),
    ("role-vet-04-animal-detail.png", "Figura 15l. EP-13 — veterinario: detalle animal."),
    ("role-vet-05-simulation.png", "Figura 15m. EP-13 — veterinario: simulación."),
    ("role-vet-06-reports.png", "Figura 15n. EP-13 — veterinario: reportes."),
    ("role-vet-08-account-menu.png", "Figura 15o. EP-13 — veterinario: menú de cuenta sin Usuarios y roles."),
    ("role-vet-09-users-blocked.png", "Figura 15p. EP-13 — veterinario: /app/users redirige a Cuenta."),
]


def add_role_pages(doc: fitz.Document) -> None:
    """Insert after page 15 as ordinary 10.12.1 / 10.12.2 (same Times look)."""
    insert_at = 15
    added = 0

    def page() -> fitz.Page:
        nonlocal added
        p = doc.new_page(pno=insert_at + added, width=612, height=792)
        added += 1
        return p

    def paint(start: fitz.Page, y: float, figures: list[tuple[str, str]]) -> None:
        nonlocal added
        cur = start
        img_w = 432.0
        img_h = img_w * 800 / 1280
        for filename, caption in figures:
            path = EVIDENCE / filename
            if y + img_h + 40 > 740:
                cur = page()
                y = 62
            rect = fitz.Rect(90, y, 90 + img_w, y + img_h)
            cur.insert_image(rect, filename=str(path), keep_proportion=True)
            y = rect.y1 + 16
            centered_italic(cur, y, caption)
            y += 26

    p = page()
    p.insert_text((62.35, 72), "10.12.1 Recorrido con rol productor", fontname=FONT_B, fontsize=12)
    body = (
        "Sesión producer@farm.local (Camila Restrepo), 25 nov, 2026. El tablero muestra IBA "
        "filtrado a sus predios (2 predios, 5 evaluados). Accede a Predios, Animales, detalle "
        "animal, Simulación y Reportes. El menú de cuenta ofrece Mi cuenta y Reportes de predio; "
        "no ofrece Usuarios y roles. Al abrir /#/app/users el adminGuard redirige a Cuenta."
    )
    p.insert_textbox(fitz.Rect(62.35, 88, 550, 200), body, fontname=FONT, fontsize=12, align=fitz.TEXT_ALIGN_JUSTIFY)
    paint(p, 210, PRODUCER)

    p = page()
    p.insert_text((62.35, 72), "10.12.2 Recorrido con rol veterinario", fontname=FONT_B, fontsize=12)
    body = (
        "Sesión vet@farm.local (Andres Molina), 25 nov, 2026. El veterinario ve el inventario "
        "completo (6 ejemplares; staff). Accede a Predios, Animales, Simulación y Reportes. El "
        "menú de cuenta tampoco ofrece Usuarios y roles. /#/app/users redirige a Cuenta."
    )
    p.insert_textbox(fitz.Rect(62.35, 88, 550, 180), body, fontname=FONT, fontsize=12, align=fitz.TEXT_ALIGN_JUSTIFY)
    paint(p, 190, VET)
    print("role pages added", added)


def main() -> None:
    if not SEQ_SHOT.exists():
        raise FileNotFoundError(SEQ_SHOT)
    doc = fitz.open(str(BASE))
    patch_text(doc)
    patch_figure_13(doc)
    add_role_pages(doc)
    remove_vitest(doc)
    tmp = ROOT / "_informe_tmp.pdf"
    doc.save(str(tmp), garbage=4, deflate=True)
    doc.close()
    OUT.write_bytes(tmp.read_bytes())
    LEGACY.write_bytes(tmp.read_bytes())
    tmp.unlink(missing_ok=True)
    print("base", BASE)
    print("out", OUT, "pages", fitz.open(str(OUT)).page_count)


if __name__ == "__main__":
    main()
