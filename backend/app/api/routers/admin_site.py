from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_admin
from app.core.database import get_db
from app.models.site_content import SiteAsset
from app.models.user import User
from app.schemas.site_content import SectionUpdate, SiteAssetOut
from app.services import site_asset_service
from app.services.site_content_registry import SECTIONS
from app.services.site_content_service import SectionNotFound, SectionValidationError, SiteContentService

router = APIRouter()


@router.get("/sections")
def list_sections(db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    service = SiteContentService(db)
    return [service.describe(key) for key in SECTIONS]


@router.get("/sections/{key}")
def get_section(key: str, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    try:
        return SiteContentService(db).describe(key)
    except SectionNotFound:
        raise HTTPException(404, "Section not found")


@router.put("/sections/{key}")
def update_section(
    key: str,
    body: SectionUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    try:
        return SiteContentService(db).update_section(key, body.value, admin)
    except SectionNotFound:
        raise HTTPException(404, "Section not found")
    except SectionValidationError as exc:
        raise HTTPException(422, detail={"message": "Some fields need attention", "errors": exc.errors})


@router.post("/sections/{key}/reset")
def reset_section(key: str, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    try:
        return SiteContentService(db).reset_section(key, admin)
    except SectionNotFound:
        raise HTTPException(404, "Section not found")


@router.get("/assets", response_model=list[SiteAssetOut])
def list_assets(
    kind: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    query = db.query(SiteAsset)
    if kind:
        query = query.filter(SiteAsset.kind == kind)
    return query.order_by(SiteAsset.created_at.desc(), SiteAsset.id.desc()).all()


@router.post("/assets", response_model=SiteAssetOut, status_code=201)
async def upload_asset(
    file: UploadFile = File(...),
    kind: str = Form(...),
    alt_text: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    data = await file.read()
    return site_asset_service.save_asset(
        db, filename=file.filename or "", data=data, kind=kind, alt_text=alt_text, admin=admin
    )


@router.delete("/assets/{asset_id}", status_code=204)
def delete_asset(asset_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    site_asset_service.delete_asset(db, asset_id)
