from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_active_user
from app.core.database import get_db
from app.models.site_content import Testimonial
from app.models.user import User
from app.schemas.site_content import TestimonialOut, TestimonialSubmit
from app.services.site_stats_service import public_stats
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


@router.get("/stats")
def get_public_stats(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    return public_stats(db)


@router.get("/testimonials", response_model=list[TestimonialOut])
def list_public_testimonials(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    return (
        db.query(Testimonial)
        .filter(Testimonial.status == "approved")
        .order_by(Testimonial.sort_order.asc(), Testimonial.id.asc())
        .all()
    )


@router.post("/testimonials", response_model=TestimonialOut, status_code=201)
def submit_review(
    body: TestimonialSubmit,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    already = db.query(Testimonial).filter(Testimonial.user_id == user.id, Testimonial.status == "pending").first()
    if already:
        raise HTTPException(409, "You already have a review waiting for approval.")
    review = Testimonial(
        kind="review",
        origin="user",
        name=user.full_name or user.email.split("@")[0],
        role=body.role,
        text=body.text,
        rating=body.rating,
        status="pending",
        user_id=user.id,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
