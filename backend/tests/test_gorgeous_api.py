"""Gorgeous Fashion Boutique — backend API regression suite."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://priceless-germain-8.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN1 = ("admin1@gorgeousfashion.com", "Gorgeous2025A")
ADMIN2 = ("admin2@gorgeousfashion.com", "Gorgeous2025B")
ADMIN3 = ("admin3@gorgeousfashion.com", "Gorgeous2025C")


@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN1[0], "password": ADMIN1[1]}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Health ----------
def test_health(s):
    r = s.get(f"{API}/", timeout=10)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---------- Auth ----------
@pytest.mark.parametrize("email,password", [ADMIN1, ADMIN2, ADMIN3])
def test_login_all_admins(s, email, password):
    r = s.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["email"] == email
    assert d["role"] == "admin"
    assert isinstance(d["access_token"], str) and len(d["access_token"]) > 20


def test_login_wrong_password(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN1[0], "password": "wrong"}, timeout=15)
    assert r.status_code == 401


def test_me_with_token(s, auth_headers):
    r = s.get(f"{API}/auth/me", headers=auth_headers, timeout=10)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN1[0]


def test_me_without_token(s):
    r = s.get(f"{API}/auth/me", timeout=10)
    assert r.status_code == 401


# ---------- Contact ----------
def test_contact_create_public(s):
    payload = {"name": "TEST_Visitor", "phone": "9999999999", "email": "test@example.com", "message": "TEST enquiry"}
    r = s.post(f"{API}/contact", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    assert r.json()["ok"] is True
    assert "id" in r.json()


def test_contact_list_requires_auth(s, auth_headers):
    assert s.get(f"{API}/contact", timeout=10).status_code == 401
    r = s.get(f"{API}/contact", headers=auth_headers, timeout=10)
    assert r.status_code == 200
    assert any(m.get("name") == "TEST_Visitor" for m in r.json())


# ---------- Bookings ----------
@pytest.fixture(scope="session")
def booking_id(s):
    payload = {
        "name": "TEST_Booker", "phone": "9888888888", "email": "book@example.com",
        "date": "2026-02-15", "time": "14:00", "category": "Saree", "notes": "TEST"
    }
    r = s.post(f"{API}/bookings", json=payload, timeout=20)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["status"] == "pending"
    assert d["name"] == "TEST_Booker"
    assert "id" in d
    return d["id"]


def test_bookings_created(booking_id):
    assert booking_id


def test_bookings_list_requires_auth(s, auth_headers, booking_id):
    assert s.get(f"{API}/bookings", timeout=10).status_code == 401
    r = s.get(f"{API}/bookings", headers=auth_headers, timeout=10)
    assert r.status_code == 200
    assert any(b["id"] == booking_id for b in r.json())


def test_booking_status_patch(s, auth_headers, booking_id):
    r = s.patch(f"{API}/bookings/{booking_id}?status=confirmed", headers=auth_headers, timeout=10)
    assert r.status_code == 200
    r2 = s.get(f"{API}/bookings", headers=auth_headers, timeout=10)
    found = next(b for b in r2.json() if b["id"] == booking_id)
    assert found["status"] == "confirmed"


# ---------- Reviews ----------
def test_reviews_public(s):
    r = s.get(f"{API}/reviews", timeout=10)
    assert r.status_code == 200
    assert len(r.json()) >= 3


def test_reviews_create(s):
    r = s.post(f"{API}/reviews", json={"name": "TEST_Rev", "rating": 5, "comment": "TEST review"}, timeout=10)
    assert r.status_code == 200
    assert r.json()["name"] == "TEST_Rev"


# ---------- Media ----------
def test_media_list_public(s):
    r = s.get(f"{API}/media", timeout=10)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_media_create_requires_auth(s):
    r = s.post(f"{API}/media", json={"public_id": "x", "secure_url": "https://x", "resource_type": "image", "category": "Saree"}, timeout=10)
    assert r.status_code == 401


def test_media_delete_requires_auth(s):
    r = s.delete(f"{API}/media/{uuid.uuid4()}", timeout=10)
    assert r.status_code == 401


# ---------- Cloudinary ----------
def test_cloudinary_signature_requires_auth(s):
    assert s.get(f"{API}/cloudinary/signature", timeout=10).status_code == 401


def test_cloudinary_signature_ok(s, auth_headers):
    r = s.get(f"{API}/cloudinary/signature", headers=auth_headers, timeout=10)
    assert r.status_code == 200
    d = r.json()
    for k in ("signature", "timestamp", "cloud_name", "api_key", "folder", "resource_type"):
        assert k in d, f"missing {k}"
    assert d["resource_type"] == "image"


# ---------- Settings ----------
def test_settings_public(s):
    r = s.get(f"{API}/settings", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert "tagline" in d and "phone" in d


def test_settings_patch_requires_auth(s):
    assert s.patch(f"{API}/settings", json={"tagline": "X"}, timeout=10).status_code == 401


def test_settings_patch_ok(s, auth_headers):
    new_tag = f"TEST_{uuid.uuid4().hex[:6]}"
    r = s.patch(f"{API}/settings", json={"tagline": new_tag}, headers=auth_headers, timeout=10)
    assert r.status_code == 200
    assert r.json()["tagline"] == new_tag
    # Restore
    s.patch(f"{API}/settings", json={"tagline": "Elegance in Every Thread"}, headers=auth_headers, timeout=10)
