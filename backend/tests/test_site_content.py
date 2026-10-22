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
