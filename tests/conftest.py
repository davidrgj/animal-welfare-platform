import os

import pytest

APP_URL = os.environ.get("E2E_BASE_URL", "https://animal-welfare-platform-vepq.vercel.app")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://gkomojjjyydbdajpxyqw.supabase.co")
SUPABASE_ANON_KEY = os.environ.get(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrb21vampqeXlkYmRhanB4eXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNjc0NDUsImV4cCI6MjEwMzg0MzQ0NX0.QbzOJdqGUelqBE9R_vOe4qotahEigrF9tBS9R5TQipc",
)
E2E_EMAIL = os.environ.get("E2E_EMAIL", "")
E2E_PASSWORD = os.environ.get("E2E_PASSWORD", "")


def require_credentials() -> tuple[str, str]:
    if not E2E_EMAIL or not E2E_PASSWORD:
        pytest.skip("E2E_EMAIL and E2E_PASSWORD are required for authenticated cases")
    return E2E_EMAIL, E2E_PASSWORD
