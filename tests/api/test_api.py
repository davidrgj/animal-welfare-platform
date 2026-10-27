import json
import time

import pytest
import requests

from conftest import APP_URL, E2E_EMAIL, E2E_PASSWORD, SUPABASE_ANON_KEY, SUPABASE_URL, require_credentials

HEADERS = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
}


def auth_headers(access_token: str) -> dict[str, str]:
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }


def sign_in() -> dict:
    email, password = require_credentials()
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers=HEADERS,
        json={"email": email, "password": password},
        timeout=30,
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload.get("access_token")
    return payload


def test_app_home_returns_ok_and_spa_shell():
    response = requests.get(APP_URL, timeout=30)
    assert response.status_code == 200
    assert "Bienestar ICA" in response.text or "app-root" in response.text or "ng-app" in response.text or "<app-root" in response.text


def test_login_with_wrong_password_is_rejected():
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers=HEADERS,
        json={"email": "nobody@farm.local", "password": "incorrect"},
        timeout=30,
    )
    assert response.status_code in {400, 401}
    body = response.json()
    assert "access_token" not in body or not body.get("access_token")


def test_anonymous_rest_does_not_leak_farm_rows():
    response = requests.get(f"{SUPABASE_URL}/rest/v1/farms?select=id,name", headers=HEADERS, timeout=30)
    assert response.status_code in {200, 401}
    if response.status_code == 200:
        assert response.json() == []


def test_anonymous_rest_does_not_leak_profiles():
    response = requests.get(f"{SUPABASE_URL}/rest/v1/profiles?select=id,email,role", headers=HEADERS, timeout=30)
    assert response.status_code in {200, 401}
    if response.status_code == 200:
        assert response.json() == []


def test_valid_login_returns_jwt_and_user():
    session = sign_in()
    assert session["user"]["email"].lower() == E2E_EMAIL.lower()
    assert session["token_type"] == "bearer"
    assert session["expires_in"] > 0


def test_authenticated_profile_matches_session_user():
    session = sign_in()
    user_id = session["user"]["id"]
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}&select=id,full_name,email,role",
        headers=auth_headers(session["access_token"]),
        timeout=30,
    )
    assert response.status_code == 200
    rows = response.json()
    assert len(rows) == 1
    assert rows[0]["email"].lower() == E2E_EMAIL.lower()
    assert rows[0]["role"] in {"PRODUCER", "VETERINARIAN", "ADMINISTRATOR"}


def test_authenticated_farms_and_animals_use_json_arrays():
    session = sign_in()
    farms = requests.get(
        f"{SUPABASE_URL}/rest/v1/farms?select=id,name,hectares,owner_id",
        headers=auth_headers(session["access_token"]),
        timeout=30,
    )
    assert farms.status_code == 200
    farm_rows = farms.json()
    assert isinstance(farm_rows, list)
    animals = requests.get(
        f"{SUPABASE_URL}/rest/v1/animals?select=id,tag_id,species,farm_id",
        headers=auth_headers(session["access_token"]),
        timeout=30,
    )
    assert animals.status_code == 200
    assert isinstance(animals.json(), list)


def test_welfare_records_payload_includes_iba_fields():
    session = sign_in()
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/welfare_records?select=id,welfare_index,compliance_level,temperature_humidity_index&limit=5",
        headers=auth_headers(session["access_token"]),
        timeout=30,
    )
    assert response.status_code == 200
    rows = response.json()
    for row in rows:
        assert "welfare_index" in row
        if row["compliance_level"]:
            assert row["compliance_level"] in {"COMPLIANT", "ATTENTION", "NON_COMPLIANT"}


def test_insert_without_jwt_is_denied():
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/farms",
        headers=HEADERS,
        json={"name": "should-fail", "vaccination_registry": "x", "hectares": 1, "latitude": 1, "longitude": 1, "water_source": "WELL"},
        timeout=30,
    )
    assert response.status_code in {401, 403}


@pytest.mark.skipif(not E2E_EMAIL or not E2E_PASSWORD, reason="credentials required")
def test_auth_latency_is_under_three_seconds():
    started = time.perf_counter()
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers=HEADERS,
        json={"email": E2E_EMAIL, "password": E2E_PASSWORD},
        timeout=30,
    )
    elapsed_ms = (time.perf_counter() - started) * 1000
    assert response.status_code == 200
    assert elapsed_ms < 3000, f"auth took {elapsed_ms:.0f} ms"
    json.dumps(response.json())
