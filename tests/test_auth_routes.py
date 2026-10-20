from datetime import datetime, timedelta, timezone

from sqlalchemy import text

GOOD_PW = "correct-horse-battery"
EMAIL = "alice@example.com"

def session_cookie(client) -> str:
    # The Secure flag stops the cookie jar from sending it over http://testserver,
    # so the test reads the value from the login response and sends it explicitly.
    return client.cookies.get("df_session")

def register(client, email=EMAIL, password=GOOD_PW):
    return client.post("/api/v1/auth/register", json={"email": email, "password": password})


def login(client, email=EMAIL, password=GOOD_PW):
    return client.post("/api/v1/auth/login", json={"email": email, "password": password})


def test_register_creates_user(client):
    r = register(client)
    assert r.status_code == 201
    assert r.json()["email"] == EMAIL
    assert "password" not in r.text and "password_hash" not in r.text


def test_register_normalizes_email_case(client):
    register(client, email="Alice@Example.com")
    assert login(client, email="alice@example.com").status_code == 200


def test_duplicate_email_rejected(client):
    register(client)
    r = register(client)
    assert r.status_code == 400
    assert r.json()["detail"] == "Registration failed."


def test_short_password_rejected(client):
    r = register(client, password="short")
    assert r.status_code == 422


def test_invalid_email_rejected(client):
    r = client.post("/api/v1/auth/register", json={"email": "not-an-email", "password": GOOD_PW})
    assert r.status_code == 422


def test_login_sets_httponly_secure_cookie(client):
    register(client)
    r = login(client)
    assert r.status_code == 200
    cookie = r.headers["set-cookie"].lower()
    assert "df_session=" in cookie
    assert "httponly" in cookie
    assert "secure" in cookie
    assert "samesite=lax" in cookie


def test_wrong_password_rejected(client):
    register(client)
    r = login(client, password="wrong-password-123")
    assert r.status_code == 401
    assert r.json()["detail"] == "Invalid email or password."


def test_unknown_email_gives_same_error_as_wrong_password(client):
    register(client)
    wrong_pw = login(client, password="wrong-password-123").json()
    unknown = login(client, email="nobody@example.com").json()
    assert wrong_pw == unknown


def test_me_returns_user_with_valid_cookie(client):
    register(client)
    r = login(client)
    token = r.cookies.get("df_session")
    assert token is not None
    r = client.get("/api/v1/auth/me", cookies={"df_session": token})
    assert r.status_code == 200
    assert r.json()["email"] == EMAIL


def test_me_rejects_missing_cookie(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_me_rejects_forged_cookie(client):
    client.cookies.set("df_session", "not-a-real-token")
    assert client.get("/api/v1/auth/me").status_code == 401


def test_logout_invalidates_session(client):
    register(client)
    r = login(client)
    token = r.cookies.get("df_session")
    csrf = r.cookies.get("df_csrf")
    headers = {"X-CSRF-Token": csrf}
    cookies = {"df_session": token, "df_csrf": csrf}

    assert client.get("/api/v1/auth/me", cookies=cookies).status_code == 200
    assert client.post("/api/v1/auth/logout", cookies=cookies, headers=headers).status_code == 204
    assert client.get("/api/v1/auth/me", cookies={"df_session": token}).status_code == 401


def test_expired_session_rejected(client, monkeypatch):
    register(client)
    login(client)
    import dataforge.database as database
    from dataforge.models.session import Session as UserSession
    db = database.SessionLocal()
    try:
        for row in db.query(UserSession).all():
            row.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        db.commit()
    finally:
        db.close()
    assert client.get("/api/v1/auth/me").status_code == 401

def test_login_sets_csrf_cookie_readable_by_js(client):
    register(client)
    r = login(client)
    assert r.cookies.get("df_csrf")
    set_cookie = r.headers["set-cookie"].lower()
    assert "df_csrf=" in set_cookie
    # The CSRF cookie must NOT be HttpOnly, so the frontend can read it.
    csrf_segment = [part for part in set_cookie.split(", ") if part.startswith("df_csrf=")][0]
    assert "httponly" not in csrf_segment