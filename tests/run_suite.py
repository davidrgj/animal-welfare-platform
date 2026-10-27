#!/usr/bin/env python3
"""Run every automated suite and write tests/results/summary.json."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / "tests" / "results"
RESULTS.mkdir(parents=True, exist_ok=True)


def run(name: str, command: list[str], cwd: Path | None = None, env: dict | None = None) -> dict:
    started = time.perf_counter()
    merged = os.environ.copy()
    if env:
        merged.update(env)
    process = subprocess.run(command, cwd=cwd or ROOT, env=merged, capture_output=True, text=True)
    payload = {
        "name": name,
        "command": " ".join(command),
        "exit_code": process.returncode,
        "seconds": round(time.perf_counter() - started, 2),
        "passed": process.returncode == 0,
        "stdout_tail": process.stdout[-4000:],
        "stderr_tail": process.stderr[-4000:],
    }
    (RESULTS / f"{name}.log").write_text(process.stdout + "\n" + process.stderr, encoding="utf-8")
    print(f"[{'PASS' if payload['passed'] else 'FAIL'}] {name} ({payload['seconds']}s)")
    if not payload["passed"]:
        print(process.stdout[-1500:])
        print(process.stderr[-1500:])
    return payload


def main() -> int:
    jobs = [
        run("unit-ts", ["npx", "tsx", "--test", "tests/unit/domain.test.ts"]),
        run("unit-py", ["pytest", "tests/unit", "tests/acceptance", "-q"]),
        run("api", ["pytest", "tests/api", "-q"]),
        run("security", ["pytest", "tests/security", "-q"]),
        run("performance", ["pytest", "tests/performance", "-q"]),
        run("quality", [sys.executable, "tests/quality/analyze_quality.py"]),
    ]
    if os.environ.get("E2E_EMAIL") and os.environ.get("E2E_PASSWORD"):
        jobs.append(
            run(
                "e2e",
                ["npx", "playwright", "test", "--config", "tests/e2e/playwright.config.ts"],
            )
        )
    else:
        jobs.append({"name": "e2e", "passed": False, "skipped": True, "exit_code": None, "seconds": 0})

    quality = {}
    quality_path = RESULTS / "quality.json"
    if quality_path.exists():
        quality = json.loads(quality_path.read_text(encoding="utf-8"))

    executed = [job for job in jobs if not job.get("skipped")]
    summary = {
        "suites": jobs,
        "passed": sum(1 for job in executed if job["passed"]),
        "failed": sum(1 for job in executed if not job["passed"]),
        "skipped": sum(1 for job in jobs if job.get("skipped")),
        "quality": quality,
    }
    (RESULTS / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps({key: summary[key] for key in ("passed", "failed", "skipped")}, indent=2))
    return 0 if summary["failed"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
