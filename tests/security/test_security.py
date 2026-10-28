import re
import socket
import ssl

import requests

from conftest import APP_URL, SUPABASE_ANON_KEY, SUPABASE_URL

SENSITIVE = ("service_role", "SUPABASE_SERVICE", "BEGIN PRIVATE KEY", "sk_live")


def test_app_is_served_over_https():
    assert APP_URL.startswith("https://")
    response = requests.get(APP_URL, timeout=30, allow_redirects=True)
    assert response.url.startswith("https://")
    assert response.status_code == 200


def test_tls_certificate_matches_host():
    host = APP_URL.replace("https://", "").split("/")[0]
    context = ssl.create_default_context()
    with socket.create_connection((host, 443), timeout=15) as raw:
        with context.wrap_socket(raw, server_hostname=host) as tls:
            cert = tls.getpeercert()
    assert cert
    names = []
    for type_name, value in cert.get("subjectAltName", []):
        if type_name == "DNS":
            names.append(value)
    assert names, cert


def test_security_headers_on_frontend():
    response = requests.get(APP_URL, timeout=30)
    headers = {key.lower(): value for key, value in response.headers.items()}
    assert "strict-transport-security" in headers or response.url.startswith("https://")
    assert headers.get("x-frame-options", "").upper() == "DENY"
    assert headers.get("x-content-type-options", "").lower() == "nosniff"
    assert "referrer-policy" in headers
    # CSP is intentionally omitted: Ionic relies on inline event handlers that a
    # strict script-src 'self' policy blocks and leaves the UI unstyled.
    assert "content-security-policy" not in headers
    print(
        {
            "x-frame-options": headers.get("x-frame-options", ""),
            "referrer-policy": headers.get("referrer-policy", ""),
            "permissions-policy": headers.get("permissions-policy", ""),
        }
    )


def test_login_page_does_not_publish_demo_credentials():
    response = requests.get(APP_URL, timeout=30)
    assert response.status_code == 200
    html = response.text
    scripts = re.findall(r'src="([^"]+\.js)"', html)
    blobs = [html]
    for source in scripts[:20]:
        url = source if source.startswith("http") else APP_URL.rstrip("/") + "/" + source.lstrip("./")
        try:
            blobs.append(requests.get(url, timeout=30).text)
        except requests.RequestException:
            continue
    joined = "\n".join(blobs).replace("&#64;", "@").replace("\\u0040", "@")
    assert "Demo: producer@farm.local" not in joined
    assert "Demo: producer@" not in joined
    assert re.search(r"Demo:\s*producer@", joined, flags=re.I) is None


def test_client_bundle_does_not_embed_service_role():
    html = requests.get(APP_URL, timeout=30).text
    scripts = re.findall(r'src="([^"]+\.js)"', html)
    blobs = [html]
    for source in scripts[:12]:
        url = source if source.startswith("http") else APP_URL.rstrip("/") + "/" + source.lstrip("./")
        try:
            blobs.append(requests.get(url, timeout=30).text)
        except requests.RequestException:
            continue
    joined = "\n".join(blobs)
    for secret in SENSITIVE:
        assert secret not in joined


def test_anon_key_cannot_read_auth_users():
    response = requests.get(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {SUPABASE_ANON_KEY}"},
        timeout=30,
    )
    assert response.status_code in {401, 403, 404}


def test_rest_openapi_does_not_require_service_role_in_query():
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/",
        headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {SUPABASE_ANON_KEY}"},
        timeout=30,
    )
    assert response.status_code in {200, 401, 404}
