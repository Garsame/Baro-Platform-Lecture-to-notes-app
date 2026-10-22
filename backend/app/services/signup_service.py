"""Sign-up with an emailed code. The account is created verified, only after the code is confirmed."""
import hashlib
import hmac
import re
import secrets
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.log import ActivityLog, SystemLog
from app.models.pending_signup import PendingSignup
from app.models.user import RoleEnum, User
from app.services.email import send_otp_email
from app.services.site_content_service import SiteContentService

MAX_ATTEMPTS = 5
PHONE_RE = re.compile(r"^\+?[0-9 ]{7,16}$")


def check_password_rules(password: str) -> None:
    if len(password) < 8 or not (re.search(r"[A-Za-z]", password) and re.search(r"\d", password)):
        raise HTTPException(400, "Use at least 8 characters with a letter and a number.")


def hash_code(code: str) -> str:
    return hmac.new(settings.SECRET_KEY.encode(), code.encode(), hashlib.sha256).hexdigest()


def new_code() -> str:
    return "".join(secrets.choice("0123456789") for _ in range(6))


def check_studies(db: Session, *, university: str, faculty: str, year: str, programme: str, phone: str | None, terms: bool) -> None:
    choices = SiteContentService(db).get_section("signup")
    if university not in choices["universities"]:
        raise HTTPException(400, "Choose your university from the list.")
    if faculty not in choices["faculties"]:
        raise HTTPException(400, "Choose your faculty from the list.")
    if year not in choices["year_levels"]:
        raise HTTPException(400, "Choose your year of study from the list.")
    if len(programme.strip()) < 2:
        raise HTTPException(400, "Enter your programme, for example Bachelor of Computer Science.")
    if phone and not PHONE_RE.match(phone):
        raise HTTPException(400, "Enter a phone number like +252 61 234 5678, or leave it empty.")
    if not terms:
        raise HTTPException(400, "Accept the terms to create your account.")


def _timing() -> dict:
    return {"resend_after": settings.SIGNUP_RESEND_SECONDS, "expires_in": settings.SIGNUP_CODE_MINUTES * 60}


def _issue_code(db: Session, pending: PendingSignup) -> None:
    code = new_code()
    now = datetime.utcnow()
    pending.code_hash = hash_code(code)
    pending.expires_at = now + timedelta(minutes=settings.SIGNUP_CODE_MINUTES)
    pending.attempts = 0
    pending.last_sent_at = now
    db.add(pending)
    db.commit()
    send_otp_email(pending.email, code)


def _cooldown(pending: PendingSignup) -> None:
    wait = settings.SIGNUP_RESEND_SECONDS - (datetime.utcnow() - pending.last_sent_at).total_seconds()
    if wait > 0:
        raise HTTPException(429, detail=f"Please wait {int(wait) + 1} seconds before asking for another code.", headers={"Retry-After": str(int(wait) + 1)})


def start_signup(db: Session, *, full_name: str, email: str, password: str, university: str, faculty: str, programme: str, year: str, phone: str | None, terms: bool) -> dict:
    email = email.strip().lower()
    if len(full_name.split()) < 2:
        raise HTTPException(400, "Enter your first and last name.")
    check_password_rules(password)
    check_studies(db, university=university, faculty=faculty, year=year, programme=programme, phone=phone, terms=terms)
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "This email is already registered. Sign in instead.")

    pending = db.query(PendingSignup).filter(PendingSignup.email == email).first()
    if pending is not None:
        _cooldown(pending)
    else:
        pending = PendingSignup(email=email, code_hash="", expires_at=datetime.utcnow(), full_name="", hashed_password="", university="", faculty="", programme="", year_of_study="", terms_accepted_at=datetime.utcnow())
    pending.full_name = full_name.strip()
    pending.hashed_password = get_password_hash(password)
    pending.university, pending.faculty, pending.programme = university, faculty, programme.strip()
    pending.year_of_study = year
    pending.phone = (phone or "").strip() or None
    pending.terms_accepted_at = datetime.utcnow()
    _issue_code(db, pending)
    return {"status": "code_sent", "email": email, **_timing()}


def resend_code(db: Session, email: str) -> dict:
    email = email.strip().lower()
    pending = db.query(PendingSignup).filter(PendingSignup.email == email).first()
    if pending is None:
        raise HTTPException(404, "There is no sign-up waiting for this email. Start again.")
    _cooldown(pending)
    _issue_code(db, pending)
    return {"status": "code_sent", "email": email, **_timing()}


def verify_signup(db: Session, email: str, code: str) -> User:
    email = email.strip().lower()
    pending = db.query(PendingSignup).filter(PendingSignup.email == email).first()
    if pending is None:
        raise HTTPException(400, "There is no sign-up waiting for this email. Start again.")
    if datetime.utcnow() > pending.expires_at:
        raise HTTPException(400, "The code has expired. Request a new one.")
    if pending.attempts >= MAX_ATTEMPTS:
        raise HTTPException(400, "Too many attempts. Request a new code and try again.")
    if not hmac.compare_digest(pending.code_hash, hash_code(code.strip())):
        pending.attempts += 1
        db.add(pending)
        db.commit()
        left = MAX_ATTEMPTS - pending.attempts
        if left <= 0:
            raise HTTPException(400, "Too many attempts. Request a new code and try again.")
        raise HTTPException(400, f"That code is not right. Check the email and try again ({left} tries left).")

    if db.query(User).filter(User.email == email).first():
        db.delete(pending)
        db.commit()
        raise HTTPException(400, "This email is already registered. Sign in instead.")
    user = User(
        email=email,
        hashed_password=pending.hashed_password,
        full_name=pending.full_name,
        role=RoleEnum.user,
        is_active=True,
        is_email_verified=True,
        has_password=True,
        university=pending.university,
        faculty=pending.faculty,
        programme=pending.programme,
        year_of_study=pending.year_of_study,
        phone=pending.phone,
        terms_accepted_at=pending.terms_accepted_at,
    )
    db.add(user)
    db.delete(pending)
    db.commit()
    db.refresh(user)
    db.add(SystemLog(level="INFO", message=f"New user registered: {user.email}"))
    db.add(ActivityLog(action="USER_SIGNUP", user_id=user.id, details={"email": user.email, "method": "email_code"}))
    db.commit()
    return user
