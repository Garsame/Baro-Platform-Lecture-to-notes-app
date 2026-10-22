from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.site_content_registry import SECTIONS
from app.services.site_content_service import SectionNotFound, SiteContentService

router = APIRouter()


@router.get("/content")
def get_site_content(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    return SiteContentService(db).public_bundle()


@router.get("/content/{key}")
def get_site_section(key: str, response: Response, db: Session = Depends(get_db)):
    spec = SECTIONS.get(key)
    if spec is None or not spec.public:
        raise HTTPException(404, "Section not found")
    response.headers["Cache-Control"] = "no-store"
    try:
        return SiteContentService(db).get_section(key)
    except SectionNotFound:
        raise HTTPException(404, "Section not found")
