from datetime import datetime, timedelta

import pytest

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.pending_signup import PendingSignup
from app.models.user import User

STUDIES = {"university": "Hormuud University", "faculty": "Computer Science and IT", "programme": "Bachelor of Computer Science", "year": "Year 4", "phone": "+252 61 234 5678", "terms": True}


def payload(**over):
    return {"full_name": "Hodan Ali", "email": "hodan@example.com", "password": "secret123", **STUDIES, **over}


@pytest.fixture
def codes(monkeypatch):
    """Capture the emailed code instead of sending it."""
    sent = []
    from app.services import email as email_service, signup_service

    def fake(to_email, code):
        sent.append((to_email, code))
        return True

    monkeypatch.setattr(signup_service, "send_otp_email", fake)
    monkeypatch.setattr(email_service, "send_otp_email", fake)
    return sent


def test_old_open_signup_is_retired(client):
    assert client.post("/api/v1/auth/signup", json={"email": "a@example.com", "password": "secret123"}).status_code == 410


def test_signup_creates_verified_account_only_after_code(client, codes, monkeypatch):
    monkeypatch.setattr(settings, "SIGNUP_RESEND_SECONDS", 0)
    res = client.post("/api/v1/auth/signup/start", json=payload())
    assert res.status_code == 200 and res.json()["status"] == "code_sent"
    db = SessionLocal()
    assert db.query(User).filter(User.email == "hodan@example.com").first() is None  # nothing created yet
    assert db.query(PendingSignup).count() == 1
    assert db.query(PendingSignup).first().code_hash != codes[-1][1]  # stored hashed, not plain
    db.close()

    bad = client.post("/api/v1/auth/signup/verify", json={"email": "hodan@example.com", "code": "000000"})
    assert bad.status_code == 400 and "4 tries left" in bad.json()["detail"]

    ok = client.post("/api/v1/auth/signup/verify", json={"email": "hodan@example.com", "code": codes[-1][1]})
    assert ok.status_code == 200
    body = ok.json()
    assert body["user"]["is_email_verified"] is True and body["user"]["university"] == "Hormuud University"
    assert body["user"]["year_of_study"] == "Year 4" and body["user"]["programme"] == "Bachelor of Computer Science"
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200 and me.json()["email"] == "hodan@example.com"
    db = SessionLocal()
    assert db.query(PendingSignup).count() == 0
    db.close()
    # the same email cannot start again
    assert client.post("/api/v1/auth/signup/start", json=payload()).status_code == 400


@pytest.mark.parametrize("over,fragment", [
    ({"password": "short1"}, "8 characters"),
    ({"password": "onlyletters"}, "letter and a number"),
    ({"full_name": "Hodan"}, "first and last name"),
    ({"university": "Nowhere College"}, "university"),
    ({"faculty": "Magic"}, "faculty"),
    ({"year": "Year 9"}, "year of study"),
    ({"programme": "x"}, "programme"),
    ({"phone": "abc"}, "phone number"),
    ({"terms": False}, "terms"),
])
def test_signup_validation(client, codes, over, fragment):
    res = client.post("/api/v1/auth/signup/start", json=payload(**over))
    assert res.status_code == 400 and fragment in res.json()["detail"]
    assert codes == []


def test_resend_has_a_cooldown_and_replaces_the_code(client, codes, monkeypatch):
    monkeypatch.setattr(settings, "SIGNUP_RESEND_SECONDS", 30)
    assert client.post("/api/v1/auth/signup/start", json=payload()).status_code == 200
    assert client.post("/api/v1/auth/signup/resend", json={"email": "hodan@example.com"}).status_code == 429
    monkeypatch.setattr(settings, "SIGNUP_RESEND_SECONDS", 0)
    assert client.post("/api/v1/auth/signup/resend", json={"email": "hodan@example.com"}).status_code == 200
    first, second = codes[0][1], codes[1][1]
    if first != second:  # an old code stops working once a new one is sent
        assert client.post("/api/v1/auth/signup/verify", json={"email": "hodan@example.com", "code": first}).status_code == 400
    assert client.post("/api/v1/auth/signup/verify", json={"email": "hodan@example.com", "code": second}).status_code == 200
    assert client.post("/api/v1/auth/signup/resend", json={"email": "nobody@example.com"}).status_code == 404


def test_five_wrong_codes_lock_the_code_and_expiry_is_enforced(client, codes):
    client.post("/api/v1/auth/signup/start", json=payload())
    right = codes[-1][1]
    wrong = "111111" if right != "111111" else "222222"
    for _ in range(5):
        client.post("/api/v1/auth/signup/verify", json={"email": "hodan@example.com", "code": wrong})
    locked = client.post("/api/v1/auth/signup/verify", json={"email": "hodan@example.com", "code": right})
    assert locked.status_code == 400 and "Too many attempts" in locked.json()["detail"]

    db = SessionLocal()
    p = db.query(PendingSignup).first()
    p.attempts = 0
    p.expires_at = datetime.utcnow() - timedelta(minutes=1)
    db.commit()
    db.close()
    expired = client.post("/api/v1/auth/signup/verify", json={"email": "hodan@example.com", "code": right})
    assert expired.status_code == 400 and "expired" in expired.json()["detail"]


def test_google_signup_skips_the_code(client, monkeypatch):
    monkeypatch.setattr(settings, "ALLOW_MOCK_LOGIN", True)
    token = "mock-google-token-abdi@gmail.com:Abdi Warsame"
    info = client.post("/api/v1/auth/google/verify", json={"token": token}).json()
    assert info["email"] == "abdi@gmail.com" and info["registered"] is False
    bad = client.post("/api/v1/auth/google-signup", json={"token": token, **{k: v for k, v in STUDIES.items() if k != "terms"}, "terms": False})
    assert bad.status_code == 400
    ok = client.post("/api/v1/auth/google-signup", json={"token": token, **STUDIES})
    assert ok.status_code == 200 and ok.json()["user"]["is_email_verified"] is True
    assert ok.json()["user"]["university"] == "Hormuud University" and ok.json()["user"]["has_password"] is False
    assert client.post("/api/v1/auth/google/verify", json={"token": token}).json()["registered"] is True


def signed_in(client, codes, monkeypatch, email="hodan@example.com"):
    monkeypatch.setattr(settings, "SIGNUP_RESEND_SECONDS", 0)
    client.post("/api/v1/auth/signup/start", json=payload(email=email))
    res = client.post("/api/v1/auth/signup/verify", json={"email": email, "code": codes[-1][1]})
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def test_profile_edit_validates_choices_and_blocks_email_and_password(client, codes, monkeypatch):
    h = signed_in(client, codes, monkeypatch)
    ok = client.put("/api/v1/auth/me/profile", headers=h, json={"full_name": "Hodan Ali Warsame", "faculty": "Engineering", "year": "Year 3", "phone": ""})
    assert ok.status_code == 200 and ok.json()["faculty"] == "Engineering" and ok.json()["phone"] is None
    assert client.put("/api/v1/auth/me/profile", headers=h, json={"university": "Nowhere"}).status_code == 400
    assert client.put("/api/v1/auth/me/profile", headers=h, json={"email": "other@example.com"}).status_code == 400
    assert client.put("/api/v1/auth/me/profile", headers=h, json={"password": "newsecret1"}).status_code == 400


def test_email_change_needs_a_code_and_keeps_old_email_until_then(client, codes, monkeypatch):
    h = signed_in(client, codes, monkeypatch)
    assert client.post("/api/v1/auth/me/email/change", headers=h, json={"new_email": "hodan@example.com"}).status_code == 400
    res = client.post("/api/v1/auth/me/email/change", headers=h, json={"new_email": "new.hodan@example.com"})
    assert res.status_code == 200
    assert codes[-1][0] == "new.hodan@example.com"  # the code goes to the NEW address
    me = client.get("/api/v1/auth/me", headers=h).json()
    assert me["email"] == "hodan@example.com" and me["pending_email"] == "new.hodan@example.com"
    bad = client.post("/api/v1/auth/me/email/confirm", headers=h, json={"code": "000000"})
    assert bad.status_code == 400
    done = client.post("/api/v1/auth/me/email/confirm", headers=h, json={"code": codes[-1][1]})
    assert done.status_code == 200 and done.json()["email"] == "new.hodan@example.com" and done.json()["pending_email"] is None
    # cancelling a change keeps the current email
    client.post("/api/v1/auth/me/email/change", headers=h, json={"new_email": "third@example.com"})
    cancelled = client.post("/api/v1/auth/me/email/cancel", headers=h)
    assert cancelled.json()["pending_email"] is None and cancelled.json()["email"] == "new.hodan@example.com"


def test_password_change_requires_current_password(client, codes, monkeypatch):
    h = signed_in(client, codes, monkeypatch)
    assert client.post("/api/v1/auth/me/password", headers=h, json={"current_password": "wrong", "new_password": "newsecret1"}).status_code == 400
    assert client.post("/api/v1/auth/me/password", headers=h, json={"current_password": "secret123", "new_password": "short"}).status_code == 400
    assert client.post("/api/v1/auth/me/password", headers=h, json={"current_password": "secret123", "new_password": "newsecret1"}).status_code == 200
    login = client.post("/api/v1/auth/login", data={"username": "hodan@example.com", "password": "newsecret1"})
    assert login.status_code == 200


def test_signup_choices_are_public_and_editable(admin_client):
    sec = admin_client.get("/api/v1/site/content").json()["sections"]["signup"]
    assert "Hormuud University" in sec["universities"] and "Year 1" in sec["year_levels"]
    res = admin_client.put("/api/v1/admin/site/sections/signup", json={"value": {**sec, "faculties": ["Law", "Law"]}})
    assert res.status_code == 422
    ok = admin_client.put("/api/v1/admin/site/sections/signup", json={"value": {**sec, "faculties": ["Law", "Other"]}})
    assert ok.status_code == 200
