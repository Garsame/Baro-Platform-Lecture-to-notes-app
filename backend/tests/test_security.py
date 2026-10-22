from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.core.security import create_access_token
from app.main import app
from app.models.user import RoleEnum, User

NEW_ADMIN = {"email": "second@example.com", "password": "longenough1", "full_name": "Second Admin"}


def _client():
    app.dependency_overrides.clear()
    return TestClient(app)


def _admin_id():
    db = SessionLocal()
    try:
        return db.query(User).filter(User.email == "admin@example.com").first().id
    finally:
        db.close()


def test_admin_signup_is_closed_to_anonymous_visitors():
    r = _client().post("/api/v1/auth/admin-signup", json=NEW_ADMIN)
    assert r.status_code == 403


def test_admin_signup_is_closed_to_students():
    db = SessionLocal()
    uid = db.query(User).filter(User.email == "user@example.com").first().id
    db.close()
    token = create_access_token(uid)
    r = _client().post("/api/v1/auth/admin-signup", json=NEW_ADMIN, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


def test_signed_in_admin_can_add_an_admin():
    token = create_access_token(_admin_id())
    r = _client().post("/api/v1/auth/admin-signup", json=NEW_ADMIN, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["role"] == "admin"


def test_first_admin_can_be_created_when_none_exist():
    db = SessionLocal()
    db.query(User).filter(User.role == RoleEnum.admin).delete()
    db.commit()
    db.close()
    r = _client().post("/api/v1/auth/admin-signup", json=NEW_ADMIN)
    assert r.status_code == 200


def test_private_uploads_are_not_served_directly():
    c = _client()
    assert c.get("/uploads/lecture_1_audio.mp3").status_code == 404
    assert c.get("/uploads/tts/1_female.mp3").status_code == 404


def test_login_is_rate_limited():
    c = _client()
    codes = [c.post("/api/v1/auth/login", data={"username": f"nobody{i}@example.com", "password": "x"}).status_code for i in range(22)]
    assert codes[-1] == 429
    assert 429 not in codes[:20]


def test_security_headers_present():
    r = _client().get("/")
    assert r.headers["x-content-type-options"] == "nosniff"
    assert r.headers["x-frame-options"] == "DENY"
