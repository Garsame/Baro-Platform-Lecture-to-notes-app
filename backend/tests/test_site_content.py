import struct
import zlib

from app.core.database import SessionLocal
from app.models.user import RoleEnum, User
from app.core.config import settings
from jose import jwt


def png_bytes() -> bytes:
    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

    raw = b"\x00\xff\x00\x00"
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw))
        + chunk(b"IEND", b"")
    )


def token_for(email: str) -> str:
    db = SessionLocal()
    uid = db.query(User).filter(User.email == email).first().id
    db.close()
    return jwt.encode({"sub": str(uid)}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def test_public_content_defaults(client):
    res = client.get("/api/v1/site/content")
    assert res.status_code == 200
    assert res.headers["cache-control"] == "no-store"
    assert res.json()["sections"]["branding"]["site_name"] == "BaroPlatform"
    assert "seo" in res.json()["sections"]


def test_admin_routes_require_admin(client):
    assert client.get("/api/v1/admin/site/sections").status_code == 401
    headers = {"Authorization": f"Bearer {token_for('user@example.com')}"}
    assert client.get("/api/v1/admin/site/sections", headers=headers).status_code == 403
    headers = {"Authorization": f"Bearer {token_for('admin@example.com')}"}
    assert client.get("/api/v1/admin/site/sections", headers=headers).status_code == 200


def test_invalid_color_returns_422_with_field(admin_client):
    current = admin_client.get("/api/v1/admin/site/sections/branding").json()["value"]
    res = admin_client.put("/api/v1/admin/site/sections/branding", json={"value": {**current, "primary_color": "blue"}})
    assert res.status_code == 422
    errors = res.json()["detail"]["errors"]
    assert errors[0]["field"] == "primary_color"
    assert admin_client.get("/api/v1/site/content").json()["sections"]["branding"]["primary_color"] == "#2a2a72"


def test_update_then_reset(admin_client):
    current = admin_client.get("/api/v1/admin/site/sections/branding").json()["value"]
    res = admin_client.put("/api/v1/admin/site/sections/branding", json={"value": {**current, "tagline": "A brand new tagline for the site."}})
    assert res.status_code == 200 and res.json()["is_default"] is False
    assert admin_client.get("/api/v1/site/content").json()["sections"]["branding"]["tagline"] == "A brand new tagline for the site."
    res = admin_client.post("/api/v1/admin/site/sections/branding/reset")
    assert res.json()["is_default"] is True
    assert admin_client.get("/api/v1/site/content").json()["sections"]["branding"]["tagline"].startswith("Somali-first")


def test_unknown_section_404(client, admin_client):
    assert admin_client.get("/api/v1/admin/site/sections/nope").status_code == 404
    assert client.get("/api/v1/site/content/nope").status_code == 404


def test_upload_png_ok_svg_and_fake_png_refused(admin_client):
    res = admin_client.post("/api/v1/admin/site/assets", data={"kind": "image"}, files={"file": ("logo.png", png_bytes(), "image/png")})
    assert res.status_code == 201
    assert res.json()["url"].startswith("/uploads/site/")
    res = admin_client.post("/api/v1/admin/site/assets", data={"kind": "image"}, files={"file": ("x.svg", b"<svg onload='x'/>", "image/svg+xml")})
    assert res.status_code == 400
    res = admin_client.post("/api/v1/admin/site/assets", data={"kind": "image"}, files={"file": ("fake.png", b"just text", "image/png")})
    assert res.status_code == 400


def test_delete_asset_in_use_returns_409(admin_client):
    asset = admin_client.post("/api/v1/admin/site/assets", data={"kind": "image"}, files={"file": ("logo.png", png_bytes(), "image/png")}).json()
    current = admin_client.get("/api/v1/admin/site/sections/branding").json()["value"]
    admin_client.put("/api/v1/admin/site/sections/branding", json={"value": {**current, "logo_light_url": asset["url"]}})
    res = admin_client.delete(f"/api/v1/admin/site/assets/{asset['id']}")
    assert res.status_code == 409 and "branding" in res.json()["detail"]
    admin_client.post("/api/v1/admin/site/sections/branding/reset")
    assert admin_client.delete(f"/api/v1/admin/site/assets/{asset['id']}").status_code == 204


def test_navigation_defaults_and_validation(admin_client):
    nav = admin_client.get("/api/v1/site/content").json()["sections"]["navigation"]
    assert nav["cta_label"] == "Get started"
    assert nav["about_links"][0]["href"] == "/about"
    bad = {**nav, "social_x": "x.com/me"}
    res = admin_client.put("/api/v1/admin/site/sections/navigation", json={"value": bad})
    assert res.status_code == 422 and res.json()["detail"]["errors"][0]["field"] == "social_x"
    bad = {**nav, "about_links": [{**nav["about_links"][0], "href": "javascript:alert(1)"}]}
    res = admin_client.put("/api/v1/admin/site/sections/navigation", json={"value": bad})
    assert res.status_code == 422 and res.json()["detail"]["errors"][0]["field"] == "about_links.0.href"


def test_home_defaults_valid_and_validation(admin_client):
    home = admin_client.get("/api/v1/site/content").json()["sections"]["home"]
    assert home["headline"] == "Turn any lecture into"
    assert len(home["journey_cards"]) == 9
    bad = {**home, "faqs": [{"q": "ok?", "a": ""}]}
    res = admin_client.put("/api/v1/admin/site/sections/home", json={"value": bad})
    assert res.status_code == 422 and res.json()["detail"]["errors"][0]["field"] == "faqs.0.a"


def test_public_stats_are_aggregates(client):
    res = client.get("/api/v1/site/stats")
    assert res.status_code == 200
    data = res.json()
    assert set(data) == {"lectures", "students", "hours", "notes", "quizzes", "avg_seconds", "success_rate"}
    assert data["students"] == 1  # the seeded regular user; admins are not counted


def test_review_flow(admin_client):
    from app.api.dependencies import get_current_active_user
    from app.main import app

    def regular():
        db = SessionLocal()
        try:
            return db.query(User).filter(User.email == "user@example.com").first()
        finally:
            db.close()

    app.dependency_overrides[get_current_active_user] = regular
    body = {"text": "This turned my two hour lecture into notes I could revise from.", "rating": 5, "role": "Year 2"}
    assert admin_client.post("/api/v1/site/testimonials", json=body).status_code == 201
    assert admin_client.post("/api/v1/site/testimonials", json=body).status_code == 409
    assert admin_client.get("/api/v1/site/testimonials").json() == []  # pending is not public
    r = admin_client.get("/api/v1/admin/site/testimonials?status=pending")
    item = r.json()[0]
    put = {"kind": "review", "name": item["name"], "role": item["role"], "text": item["text"], "rating": 5, "status": "approved"}
    assert admin_client.put(f"/api/v1/admin/site/testimonials/{item['id']}", json=put).status_code == 200
    assert len(admin_client.get("/api/v1/site/testimonials").json()) == 1
    admin_client.put(f"/api/v1/admin/site/testimonials/{item['id']}", json={**put, "status": "hidden"})
    assert admin_client.get("/api/v1/site/testimonials").json() == []
    assert admin_client.delete(f"/api/v1/admin/site/testimonials/{item['id']}").status_code == 204
    app.dependency_overrides.pop(get_current_active_user, None)


def test_about_and_team_defaults_and_validation(admin_client):
    sections = admin_client.get("/api/v1/site/content").json()["sections"]
    assert len(sections["about"]["stages"]) == 8
    assert sections["team"]["members"][0]["level"] == "supervisor"
    assert len(sections["team"]["members"]) == 5
    team = {**sections["team"], "members": [{**sections["team"]["members"][0], "linkedin": "linkedin.com/in/x"}]}
    res = admin_client.put("/api/v1/admin/site/sections/team", json={"value": team})
    assert res.status_code == 422 and res.json()["detail"]["errors"][0]["field"] == "members.0.linkedin"
    about = {**sections["about"], "stages": [{**sections["about"]["stages"][0], "tech": ["x" * 41]}]}
    res = admin_client.put("/api/v1/admin/site/sections/about", json={"value": about})
    assert res.status_code == 422 and res.json()["detail"]["errors"][0]["field"] == "stages.0.tech"


def test_email_section_is_admin_only_and_validated(admin_client):
    assert "email" not in admin_client.get("/api/v1/site/content").json()["sections"]
    assert admin_client.get("/api/v1/site/content/email").status_code == 404
    current = admin_client.get("/api/v1/admin/site/sections/email").json()["value"]
    res = admin_client.put("/api/v1/admin/site/sections/email", json={"value": {**current, "recipient_email": "not-an-email"}})
    assert res.status_code == 422 and res.json()["detail"]["errors"][0]["field"] == "recipient_email"
    res = admin_client.put("/api/v1/admin/site/sections/email", json={"value": {**current, "recipient_email": "team@example.com"}})
    assert res.status_code == 200


def test_contact_notifies_admin_inbox_and_confirms_sender(admin_client, monkeypatch):
    from app.api.routers import contact as contact_router

    current = admin_client.get("/api/v1/admin/site/sections/email").json()["value"]
    admin_client.put("/api/v1/admin/site/sections/email", json={"value": {**current, "recipient_email": "team@example.com"}})
    sent = {}
    monkeypatch.setattr(contact_router, "send_contact_message_email", lambda **kw: sent.setdefault("notify", kw))
    monkeypatch.setattr(contact_router, "send_contact_confirmation_email", lambda **kw: sent.setdefault("confirm", kw))
    body = {"name": "Amina", "email": "amina@example.com", "topic": "Lecture processing", "message": "My lecture did not finish processing."}
    assert admin_client.post("/api/v1/contact/", json=body).status_code == 201
    assert sent["notify"]["recipient"] == "team@example.com"
    assert sent["confirm"]["to_email"] == "amina@example.com"
    assert "{name}" in sent["confirm"]["body_template"]
    # turning the auto reply off stops the confirmation
    sent.clear()
    admin_client.put("/api/v1/admin/site/sections/email", json={"value": {**current, "auto_reply_enabled": False}})
    admin_client.post("/api/v1/contact/", json=body)
    assert "notify" in sent and "confirm" not in sent


def test_contact_input_limits(admin_client):
    bad = {"name": "A", "email": "a@example.com", "topic": "x", "message": "short"}
    assert admin_client.post("/api/v1/contact/", json=bad).status_code == 422


def test_contact_email_escapes_input_and_links_to_production(monkeypatch):
    from app.core.config import settings
    from app.services import email as email_service

    captured = {}

    class FakeSMTP:
        def __init__(self, *a, **k): pass
        def starttls(self): pass
        def login(self, *a): pass
        def sendmail(self, sender, recipients, text): captured.update(recipients=recipients, text=text)
        def quit(self): pass

    monkeypatch.setattr(email_service.smtplib, "SMTP", FakeSMTP)
    monkeypatch.setattr(settings, "SMTP_USER", "u")
    monkeypatch.setattr(settings, "SMTP_PASSWORD", "p")
    ok = email_service.send_contact_message_email(
        "<b>Eve</b>", "eve@example.com", "Hi\nBcc: x@evil.com", "<script>alert(1)</script>", recipient="team@example.com"
    )
    assert ok and captured["recipients"] == ["team@example.com"]
    import email as stdlib_email
    msg = stdlib_email.message_from_string(captured["text"])
    assert "Bcc" not in msg and "\n" not in msg["Subject"].replace("\r\n ", " ")
    payload = msg.get_payload()[0].get_payload(decode=True).decode()
    assert "<script>" not in payload and "&lt;script&gt;" in payload
    assert "localhost" not in payload and "/admin/messages" in payload
