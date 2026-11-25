#!/usr/bin/env python3
"""Build the complete APA test-report PDF from the Word generator.

No annex and no “continuación” sheet: 10.12.1 / 10.12.2 live inside the report
as ordinary numbered subsections (same Times / APA style as the rest).

Outputs:
  docs/Informe_pruebas_software_Bienestar_ICA.docx
  docs/Informe_de_pruebas_Bienestar_ICA_completo.pdf
  docs/Informe_de_pruebas_Bienestar_ICA_con_EP13_roles.pdf  (same bytes; legacy name)
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DOCX = ROOT / "Informe_pruebas_software_Bienestar_ICA.docx"
OUT_PDF = ROOT / "Informe_de_pruebas_Bienestar_ICA_completo.pdf"
LEGACY_MERGED = ROOT / "Informe_de_pruebas_Bienestar_ICA_con_EP13_roles.pdf"
LEGACY_CONTINUATION = ROOT / "Continuacion_10_12_EP13_roles.pdf"


def run_report() -> None:
    subprocess.check_call([sys.executable, str(ROOT / "generate_report.py")], cwd=str(ROOT.parent))


def docx_to_pdf() -> Path:
    if not DOCX.exists():
        raise FileNotFoundError(DOCX)
    subprocess.check_call(
        [
            "soffice",
            "--headless",
            "--convert-to",
            "pdf",
            "--outdir",
            str(ROOT),
            str(DOCX),
        ],
        cwd=str(ROOT),
    )
    produced = ROOT / f"{DOCX.stem}.pdf"
    if not produced.exists():
        raise FileNotFoundError(produced)
    if produced.resolve() != OUT_PDF.resolve():
        produced.replace(OUT_PDF)
    shutil.copy2(OUT_PDF, LEGACY_MERGED)
    if LEGACY_CONTINUATION.exists():
        LEGACY_CONTINUATION.unlink()
    return OUT_PDF


if __name__ == "__main__":
    run_report()
    pdf = docx_to_pdf()
    print("docx", DOCX, "bytes", DOCX.stat().st_size)
    print("pdf", pdf, "bytes", pdf.stat().st_size)
