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



# ============================================================
# NEW FEATURE TESTS — admin extensions (hero, logo, reviews mgmt, change-pwd)
# ============================================================


# ---------- Settings: logo_url + hero_slides (public defaults) ----------
def test_settings_public_has_logo_and_hero_slides(s):
    r = s.get(f"{API}/settings", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert "logo_url" in d, "logo_url missing from /api/settings"
    assert isinstance(d["logo_url"], str) and d["logo_url"].startswith("http")
    assert "hero_slides" in d, "hero_slides missing from /api/settings"
    assert isinstance(d["hero_slides"], list)
    assert len(d["hero_slides"]) >= 2, f"expected >=2 default hero_slides, got {len(d['hero_slides'])}"
    first = d["hero_slides"][0]
    for k in ("image", "title", "eyebrow", "subtitle", "cta_label", "cta_link", "align"):
        assert k in first, f"hero_slide missing key {k}"


# ---------- Settings PATCH: hero_slides persists ----------
def test_settings_patch_hero_slides_persists(s, auth_headers):
    new_slides = [
        {
            "image": "https://example.com/img1.jpg",
            "eyebrow": "TEST_EYEBROW_1",
            "title": "TEST_TITLE_1",
            "subtitle": "TEST_SUB_1",
            "cta_label": "Shop Now",
            "cta_link": "/shop",
            "align": "left",
        },
        {
            "image": "https://example.com/img2.jpg",
            "eyebrow": "TEST_EYEBROW_2",
            "title": "TEST_TITLE_2",
            "subtitle": "TEST_SUB_2",
            "cta_label": "Discover",
            "cta_link": "/about",
            "align": "right",
        },
        {
            "image": "https://example.com/img3.jpg",
            "eyebrow": "TEST_EYEBROW_3",
            "title": "TEST_TITLE_3",
            "subtitle": "TEST_SUB_3",
            "cta_label": "Book",
            "cta_link": "/book",
            "align": "center",
        },
    ]
    r = s.patch(f"{API}/settings", json={"hero_slides": new_slides}, headers=auth_headers, timeout=10)
    assert r.status_code == 200, r.text
    body = r.json()
    assert len(body["hero_slides"]) == 3
    assert body["hero_slides"][0]["title"] == "TEST_TITLE_1"
    assert body["hero_slides"][2]["align"] == "center"

    # Verify persistence via subsequent public GET
    r2 = s.get(f"{API}/settings", timeout=10)
    assert r2.status_code == 200
    d2 = r2.json()
    assert len(d2["hero_slides"]) == 3
    assert d2["hero_slides"][1]["eyebrow"] == "TEST_EYEBROW_2"
    assert d2["hero_slides"][2]["cta_link"] == "/book"

    # Restore to default 2 slides
    default_slides = [
        {
            "image": "https://images.pexels.com/photos/33343580/pexels-photo-33343580.jpeg",
            "eyebrow": "Bridal Season 2026",
            "title": "Hand-crafted Lehengas",
            "subtitle": "Book your private fitting",
            "cta_label": "Book Appointment",
            "cta_link": "/book",
            "align": "left",
        },
        {
            "image": "https://images.unsplash.com/photo-1711130388758-2ccf44bb735c",
            "eyebrow": "Festive Radiance",
            "title": "Heirloom Sarees & Gowns",
            "subtitle": "Explore our atelier",
            "cta_label": "View Gallery",
            "cta_link": "/gallery",
            "align": "right",
        },
    ]
    s.patch(f"{API}/settings", json={"hero_slides": default_slides}, headers=auth_headers, timeout=10)


# ---------- Settings PATCH: logo_url persists ----------
def test_settings_patch_logo_url_persists(s, auth_headers):
    original = s.get(f"{API}/settings", timeout=10).json().get("logo_url")
    new_logo = f"https://example.com/logo-{uuid.uuid4().hex[:6]}.png"
    r = s.patch(f"{API}/settings", json={"logo_url": new_logo}, headers=auth_headers, timeout=10)
    assert r.status_code == 200, r.text
    assert r.json()["logo_url"] == new_logo

    r2 = s.get(f"{API}/settings", timeout=10)
    assert r2.json()["logo_url"] == new_logo

    # Restore
    if original:
        s.patch(f"{API}/settings", json={"logo_url": original}, headers=auth_headers, timeout=10)


# ---------- Reviews: GET /reviews/all auth-gated ----------
def test_reviews_all_requires_auth(s):
    r = s.get(f"{API}/reviews/all", timeout=10)
    assert r.status_code == 401


def test_reviews_all_returns_unapproved(s, auth_headers):
    # Create an unapproved review by hiding a freshly-created one
    create = s.post(f"{API}/reviews", json={"name": "TEST_AllRev", "rating": 4, "comment": "TEST_all_unapproved"}, timeout=10)
    assert create.status_code == 200
    rid = create.json()["id"]

    # Hide it
    h = s.patch(f"{API}/reviews/{rid}", json={"approved": False}, headers=auth_headers, timeout=10)
    assert h.status_code == 200

    # /reviews/all should include the hidden one
    r_all = s.get(f"{API}/reviews/all", headers=auth_headers, timeout=10)
    assert r_all.status_code == 200
    all_ids = [x["id"] for x in r_all.json()]
    assert rid in all_ids

    # Public /reviews should NOT include it
    r_pub = s.get(f"{API}/reviews", timeout=10)
    pub_ids = [x["id"] for x in r_pub.json()]
    assert rid not in pub_ids

    # Restore via approved=true
    r_restore = s.patch(f"{API}/reviews/{rid}", json={"approved": True}, headers=auth_headers, timeout=10)
    assert r_restore.status_code == 200
    r_pub2 = s.get(f"{API}/reviews", timeout=10)
    assert rid in [x["id"] for x in r_pub2.json()]

    # Cleanup: delete
    rd = s.delete(f"{API}/reviews/{rid}", headers=auth_headers, timeout=10)
    assert rd.status_code == 200


# ---------- Reviews: PATCH/DELETE auth gating ----------
def test_review_patch_requires_auth(s):
    r = s.patch(f"{API}/reviews/{uuid.uuid4()}", json={"approved": False}, timeout=10)
    assert r.status_code == 401


def test_review_delete_requires_auth(s):
    r = s.delete(f"{API}/reviews/{uuid.uuid4()}", timeout=10)
    assert r.status_code == 401


def test_review_delete_removes_from_db(s, auth_headers):
    create = s.post(f"{API}/reviews", json={"name": "TEST_DelRev", "rating": 3, "comment": "TEST_delete"}, timeout=10)
    rid = create.json()["id"]
    rd = s.delete(f"{API}/reviews/{rid}", headers=auth_headers, timeout=10)
    assert rd.status_code == 200
    # Should no longer be in /reviews/all
    r_all = s.get(f"{API}/reviews/all", headers=auth_headers, timeout=10)
    assert rid not in [x["id"] for x in r_all.json()]


# ---------- Change Password ----------
def test_change_password_requires_auth(s):
    r = s.post(f"{API}/auth/change-password", json={"current_password": "x", "new_password": "yyyyyy"}, timeout=10)
    assert r.status_code == 401


def test_change_password_wrong_current_returns_400(s, auth_headers):
    r = s.post(
        f"{API}/auth/change-password",
        json={"current_password": "DefinitelyWrong!", "new_password": "Whatever123"},
        headers=auth_headers,
        timeout=10,
    )
    assert r.status_code == 400, r.text


def test_change_password_flow_then_restore(s):
    """Login as admin1, change password, login with NEW password, then restore original."""
    email, original_pwd = ADMIN1
    new_pwd = "TempTest_" + uuid.uuid4().hex[:8]

    # Independent session (don't pollute the session-scoped token)
    sess = requests.Session()
    login = sess.post(f"{API}/auth/login", json={"email": email, "password": original_pwd}, timeout=15)
    assert login.status_code == 200, login.text
    tok = login.json()["access_token"]
    h = {"Authorization": f"Bearer {tok}"}

    # Change to new
    r = sess.post(
        f"{API}/auth/change-password",
        json={"current_password": original_pwd, "new_password": new_pwd},
        headers=h, timeout=10,
    )
    assert r.status_code == 200, r.text
    assert r.json().get("ok") is True

    # Login with NEW password should succeed
    l2 = sess.post(f"{API}/auth/login", json={"email": email, "password": new_pwd}, timeout=15)
    assert l2.status_code == 200, l2.text
    tok2 = l2.json()["access_token"]

    # Login with OLD password should now fail
    l_old = sess.post(f"{API}/auth/login", json={"email": email, "password": original_pwd}, timeout=15)
    assert l_old.status_code == 401

    # Restore original password (CRITICAL for /app/memory/test_credentials.md accuracy)
    h2 = {"Authorization": f"Bearer {tok2}"}
    r_restore = sess.post(
        f"{API}/auth/change-password",
        json={"current_password": new_pwd, "new_password": original_pwd},
        headers=h2, timeout=10,
    )
    assert r_restore.status_code == 200, r_restore.text

    # Verify original password works again
    l_final = sess.post(f"{API}/auth/login", json={"email": email, "password": original_pwd}, timeout=15)
    assert l_final.status_code == 200, "CRITICAL: failed to restore admin1 password!"
