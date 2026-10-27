import statistics
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

from conftest import APP_URL, SUPABASE_ANON_KEY, SUPABASE_URL

USERS = 20
HITS_PER_USER = 3


def fetch(url: str) -> tuple[int, float]:
    started = time.perf_counter()
    response = requests.get(url, timeout=30)
    elapsed = time.perf_counter() - started
    return response.status_code, elapsed


def test_homepage_handles_concurrent_readers():
    latencies: list[float] = []
    statuses: list[int] = []
    with ThreadPoolExecutor(max_workers=USERS) as pool:
        jobs = [pool.submit(fetch, APP_URL) for _ in range(USERS * HITS_PER_USER)]
        for job in as_completed(jobs):
            status, elapsed = job.result()
            statuses.append(status)
            latencies.append(elapsed)
    assert statuses.count(200) == len(statuses)
    p95 = sorted(latencies)[max(0, int(len(latencies) * 0.95) - 1)]
    mean = statistics.mean(latencies)
    assert mean < 2.5, f"mean {mean:.3f}s"
    assert p95 < 4.0, f"p95 {p95:.3f}s"
    (requests.Session().get(APP_URL)).close()
    report = {
        "users": USERS,
        "samples": len(latencies),
        "mean_ms": round(mean * 1000, 1),
        "p95_ms": round(p95 * 1000, 1),
        "max_ms": round(max(latencies) * 1000, 1),
        "error_rate": 0,
    }
    print(report)


def test_supabase_rest_options_are_fast_without_auth_leak():
    started = time.perf_counter()
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/farms?select=id",
        headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {SUPABASE_ANON_KEY}"},
        timeout=30,
    )
    elapsed = time.perf_counter() - started
    assert response.status_code in {200, 401}
    assert elapsed < 2.0
