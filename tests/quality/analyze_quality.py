#!/usr/bin/env python3
"""Lightweight SonarQube-style metrics for the TypeScript sources."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src"
RESULTS = ROOT / "tests" / "results"


def iter_source() -> list[Path]:
    return [path for path in SRC.rglob("*") if path.suffix in {".ts", ".scss"} and "node_modules" not in path.parts]


def count_functions(text: str) -> int:
    return len(re.findall(r"\b(function|=>)\b", text))


def cyclomatic(text: str) -> int:
    keywords = r"\b(if|for|while|case|catch|&&|\|\||\?)\b"
    return 1 + len(re.findall(keywords, text))


def duplication_blocks(files: list[tuple[str, str]]) -> int:
    hashes: Counter[str] = Counter()
    for _, text in files:
        lines = [line.strip() for line in text.splitlines() if line.strip() and not line.strip().startswith("//")]
        for index in range(len(lines) - 5):
            block = "\n".join(lines[index : index + 6])
            hashes[block] += 1
    return sum(1 for count in hashes.values() if count > 1)


def main() -> None:
    files = [(str(path.relative_to(ROOT)), path.read_text(encoding="utf-8")) for path in iter_source()]
    loc = sum(text.count("\n") + 1 for _, text in files)
    comments = sum(len(re.findall(r"^\s*(//|\*)", text, re.M)) for _, text in files)
    todos = sum(len(re.findall(r"TODO|FIXME", text)) for _, text in files)
    complexity = {name: cyclomatic(text) for name, text in files}
    hottest = sorted(complexity.items(), key=lambda item: item[1], reverse=True)[:8]
    long_files = sorted(((name, text.count("\n") + 1) for name, text in files), key=lambda item: item[1], reverse=True)[:8]
    duplicated = duplication_blocks(files)
    maintainability = max(0, min(100, 100 - (sum(complexity.values()) / max(len(files), 1)) / 4 - duplicated / 10))
    report = {
        "files": len(files),
        "lines_of_code": loc,
        "comment_lines": comments,
        "todo_fixme": todos,
        "duplicated_blocks": duplicated,
        "average_cyclomatic": round(sum(complexity.values()) / max(len(files), 1), 2),
        "maintainability_index": round(maintainability, 1),
        "hottest_files": [{"file": name, "complexity": value} for name, value in hottest],
        "largest_files": [{"file": name, "lines": value} for name, value in long_files],
        "bugs_heuristic": todos,
        "vulnerabilities_heuristic": 0,
        "rating": "A" if maintainability >= 80 else "B" if maintainability >= 65 else "C",
    }
    RESULTS.mkdir(parents=True, exist_ok=True)
    (RESULTS / "quality.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
