import json
import os
import uuid
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.site_content import SiteAsset, SiteSetting
from app.models.user import User

SITE_UPLOAD_DIR = Path("uploads/site")

PNG = b"\x89PNG\r\n\x1a\n"

KINDS = {
    "image": {"ext": {"png", "jpg", "jpeg", "webp"}, "max": 5 * 1024 * 1024},
    "icon": {"ext": {"ico", "png"}, "max": 1 * 1024 * 1024},
    "document": {"ext": {"pdf"}, "max": 25 * 1024 * 1024},
    "video": {"ext": {"mp4", "webm"}, "max": 100 * 1024 * 1024},
}
CONTENT_TYPES = {
    "png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp",
    "ico": "image/x-icon", "pdf": "application/pdf", "mp4": "video/mp4", "webm": "video/webm",
}


def _matches_signature(ext: str, data: bytes) -> bool:
    if ext == "png":
        return data.startswith(PNG)
    if ext in ("jpg", "jpeg"):
        return data.startswith(b"\xff\xd8\xff")
    if ext == "webp":
        return data[:4] == b"RIFF" and data[8:12] == b"WEBP"
    if ext == "ico":
        return data.startswith(b"\x00\x00\x01\x00")
    if ext == "pdf":
        return data.startswith(b"%PDF-")
    if ext == "mp4":
        return data[4:8] == b"ftyp"
    if ext == "webm":
        return data.startswith(b"\x1a\x45\xdf\xa3")
    return False


def max_upload_bytes(kind: str) -> int:
    """Largest file accepted for a kind; the router reads one byte more to detect oversize files."""
    spec = KINDS.get(kind)
    return spec["max"] if spec else 0


def save_asset(db: Session, *, filename: str, data: bytes, kind: str, alt_text: str | None, admin: User) -> SiteAsset:
    spec = KINDS.get(kind)
    if spec is None:
        raise HTTPException(400, "Unknown file kind. Use image, icon or document.")
    ext = os.path.splitext(filename or "")[1].lower().lstrip(".")
    if ext == "svg":
        raise HTTPException(400, "SVG files are not accepted because they can carry scripts. Use PNG, JPG or WebP.")
    if ext not in spec["ext"]:
        allowed = ", ".join(sorted(spec["ext"]))
        raise HTTPException(400, f"This kind accepts {allowed} files only.")
    if len(data) > spec["max"]:
        raise HTTPException(400, f"The file is larger than {spec['max'] // (1024 * 1024)} MB.")
    if not _matches_signature(ext, data):
        raise HTTPException(400, "The file contents do not match its extension.")

    SITE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    stored = f"{uuid.uuid4().hex}.{ext}"
    (SITE_UPLOAD_DIR / stored).write_bytes(data)
    asset = SiteAsset(
        kind=kind,
        url=f"/uploads/site/{stored}",
        original_name=(filename or stored)[:255],
        content_type=CONTENT_TYPES[ext],
        size_bytes=len(data),
        alt_text=alt_text,
        uploaded_by_id=admin.id,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


def delete_asset(db: Session, asset_id: int) -> None:
    asset = db.query(SiteAsset).filter(SiteAsset.id == asset_id).first()
    if asset is None:
        raise HTTPException(404, "Asset not found")
    used_in = [r.key for r in db.query(SiteSetting).all() if asset.url in json.dumps(r.value)]
    if used_in:
        raise HTTPException(409, f"This file is in use by: {', '.join(used_in)}")
    path = SITE_UPLOAD_DIR / os.path.basename(asset.url)
    if path.exists():
        path.unlink()
    db.delete(asset)
    db.commit()
