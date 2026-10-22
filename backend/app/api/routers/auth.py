import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import Any, Optional
from pydantic import BaseModel

class EmailVerificationRequest(BaseModel):
    code: Optional[str] = None

from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.models.log import ActivityLog, SystemLog
from app.models.user import RoleEnum
from app.schemas.user import UserCreate, User
from app.schemas.token import Token
from app.services.auth_service import AuthService
from app.api.dependencies import get_current_user, reuseable_oauth2
from app.models.user import User as DBUser

router = APIRouter()
logger = logging.getLogger("somali_notes.auth")

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests."""
    logger.info("Login attempt for email=%s", form_data.username)
    auth_service = AuthService(db)
    
    # Pre-fetch user to check lockout
    user_record = auth_service.get_user_by_email(email=form_data.username)
    if user_record:
        if user_record.lockout_until and datetime.utcnow() < user_record.lockout_until:
            time_remaining = user_record.lockout_until - datetime.utcnow()
            minutes_remaining = int(time_remaining.total_seconds() / 60) + 1
            logger.warning("Login blocked due to lockout for email=%s", form_data.username)
            raise HTTPException(
                status_code=400,
                detail=f"Too many failed login attempts. Account is locked. Please try again in {minutes_remaining} minutes."
            )
            
    user = auth_service.authenticate(email=form_data.username, password=form_data.password)
    if not user:
        logger.warning("Login failed for email=%s", form_data.username)
        if user_record:
            user_record.login_attempts = getattr(user_record, "login_attempts", 0) + 1
            if user_record.login_attempts >= 4:
                user_record.lockout_until = datetime.utcnow() + timedelta(minutes=15)
                user_record.login_attempts = 0
                db.add(user_record)
                db.commit()
                raise HTTPException(
                    status_code=400,
                    detail="Too many failed login attempts. Account is locked. Please try again in 15 minutes."
                )
            db.add(user_record)
            db.commit()
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    elif not user.is_active:
        logger.warning("Login blocked for inactive user email=%s", form_data.username)
        raise HTTPException(status_code=400, detail="Inactive user")
    elif user.role == RoleEnum.admin:
        logger.warning("Admin login attempted on user sign-in endpoint for email=%s", form_data.username)
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password"
        )
        
    # Successful login: reset attempts
    user.login_attempts = 0
    user.lockout_until = None
    db.add(user)
    db.commit()
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    logger.info("Login success for user_id=%s email=%s", user.id, user.email)
    db.add(
        ActivityLog(
            action="USER_LOGIN",
            user_id=user.id,
            details={
                "email": user.email,
                "role": user.role.value if hasattr(user.role, "value") else str(user.role),
            },
        )
    )
    db.commit()
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/admin-login", response_model=Token)
def admin_login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login for admins exclusively."""
    logger.info("Admin login attempt for email=%s", form_data.username)
    auth_service = AuthService(db)
    
    # Pre-fetch user to check lockout
    user_record = auth_service.get_user_by_email(email=form_data.username)
    if user_record:
        if user_record.lockout_until and datetime.utcnow() < user_record.lockout_until:
            time_remaining = user_record.lockout_until - datetime.utcnow()
            minutes_remaining = int(time_remaining.total_seconds() / 60) + 1
            logger.warning("Admin login blocked due to lockout for email=%s", form_data.username)
            raise HTTPException(
                status_code=400,
                detail=f"Too many failed login attempts. Account is locked. Please try again in {minutes_remaining} minutes."
            )
            
    user = auth_service.authenticate(email=form_data.username, password=form_data.password)
    if not user:
        logger.warning("Admin login failed for email=%s", form_data.username)
        if user_record:
            user_record.login_attempts = getattr(user_record, "login_attempts", 0) + 1
            if user_record.login_attempts >= 4:
                user_record.lockout_until = datetime.utcnow() + timedelta(minutes=15)
                user_record.login_attempts = 0
                db.add(user_record)
                db.commit()
                raise HTTPException(
                    status_code=400,
                    detail="Too many failed login attempts. Account is locked. Please try again in 15 minutes."
                )
            db.add(user_record)
            db.commit()
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    elif not user.is_active:
        logger.warning("Admin login blocked for inactive user email=%s", form_data.username)
        raise HTTPException(status_code=400, detail="Inactive user")
    elif user.role != RoleEnum.admin:
        logger.warning("Non-admin user login attempted on admin sign-in endpoint for email=%s", form_data.username)
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password"
        )
        
    # Successful login: reset attempts
    user.login_attempts = 0
    user.lockout_until = None
    db.add(user)
    db.commit()
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    logger.info("Admin login success for user_id=%s email=%s", user.id, user.email)
    db.add(
        ActivityLog(
            action="ADMIN_LOGIN",
            user_id=user.id,
            details={
                "email": user.email,
                "role": user.role.value if hasattr(user.role, "value") else str(user.role),
            },
        )
    )
    db.commit()
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/signup", status_code=410)
def create_new_user_retired() -> Any:
    """Retired: accounts are now created by the emailed-code flow (/signup/start, /signup/verify)."""
    raise HTTPException(status_code=410, detail="Use the new sign-up flow.")


@router.post("/admin-signup", response_model=User)
def create_new_admin(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    token: Optional[str] = Depends(reuseable_oauth2),
) -> Any:
    """Create a new administrator account.

    Open only while no administrator exists yet (first run). After that, only a
    signed-in administrator can add another one.
    """
    logger.info("Admin signup attempt for email=%s", user_in.email)
    has_admin = db.query(DBUser).filter(DBUser.role == RoleEnum.admin).first() is not None
    if has_admin:
        caller = None
        if token:
            try:
                caller = get_current_user(db=db, token=token)
            except HTTPException:
                caller = None
        if not caller or caller.role != RoleEnum.admin:
            raise HTTPException(
                status_code=403,
                detail="Administrator accounts can only be created by a signed-in administrator. Ask an existing admin, or use manage_admin.py on the server.",
            )
    if len(user_in.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long."
        )
    auth_service = AuthService(db)
    user = auth_service.get_user_by_email(email=user_in.email)
    if user:
        logger.warning("Admin signup rejected because email already exists: %s", user_in.email)
        raise HTTPException(
            status_code=400,
            detail="This email is already registered.",
        )
    user = auth_service.create_user(user_in, role=RoleEnum.admin)
    user.is_email_verified = True
    db.commit()
    
    # Write robust logging for the system and the user
    sys_log = SystemLog(level="INFO", message=f"New admin registered: {user.email}")
    act_log = ActivityLog(action="ADMIN_SIGNUP", user_id=user.id, details={"email": user.email})
    db.add(sys_log)
    db.add(act_log)
    db.commit()
    
    logger.info("Admin signup success for user_id=%s email=%s", user.id, user.email)
    return user


@router.get("/me", response_model=User)
def read_user_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get current user."""
    return current_user

from pydantic import BaseModel
from typing import Optional
from app.core.security import get_password_hash

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    university: Optional[str] = None
    faculty: Optional[str] = None
    programme: Optional[str] = None
    year: Optional[str] = None
    phone: Optional[str] = None
    # Email and password have their own endpoints so they can be confirmed properly.
    email: Optional[str] = None
    password: Optional[str] = None


@router.put("/me/profile", response_model=User)
def update_user_profile(
    *,
    db: Session = Depends(get_db),
    user_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update the personal and study details of the signed-in user."""
    if user_in.password:
        raise HTTPException(status_code=400, detail="Change your password from the password section.")
    if user_in.email and user_in.email.strip().lower() != current_user.email.lower():
        raise HTTPException(status_code=400, detail="Change your email from the email section. We send a code to the new address.")

    if user_in.full_name is not None:
        if len(user_in.full_name.split()) < 2:
            raise HTTPException(status_code=400, detail="Enter your first and last name.")
        current_user.full_name = user_in.full_name.strip()
    if current_user.role != RoleEnum.admin and any(v is not None for v in (user_in.university, user_in.faculty, user_in.programme, user_in.year)):
        signup_service.check_studies(
            db,
            university=user_in.university if user_in.university is not None else (current_user.university or ""),
            faculty=user_in.faculty if user_in.faculty is not None else (current_user.faculty or ""),
            year=user_in.year if user_in.year is not None else (current_user.year_of_study or ""),
            programme=user_in.programme if user_in.programme is not None else (current_user.programme or ""),
            phone=user_in.phone,
            terms=True,
        )
        current_user.university = user_in.university or current_user.university
        current_user.faculty = user_in.faculty or current_user.faculty
        current_user.year_of_study = user_in.year or current_user.year_of_study
        current_user.programme = (user_in.programme or current_user.programme or "").strip() or None
    if user_in.phone is not None:
        phone = user_in.phone.strip()
        if phone and not signup_service.PHONE_RE.match(phone):
            raise HTTPException(status_code=400, detail="Enter a phone number like +252 61 234 5678, or leave it empty.")
        current_user.phone = phone or None
    db.commit()
    db.refresh(current_user)
    return current_user


class EmailChangeRequest(BaseModel):
    new_email: str


class CodeRequest(BaseModel):
    code: str


class PasswordChangeRequest(BaseModel):
    current_password: Optional[str] = None
    new_password: str


@router.post("/me/email/change")
def request_email_change(
    body: EmailChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Send a code to the new address. The current email stays in use until the code is confirmed."""
    new_email = body.new_email.strip().lower()
    if not new_email or "@" not in new_email:
        raise HTTPException(status_code=400, detail="Enter an email address like name@example.com.")
    if new_email == current_user.email.lower():
        raise HTTPException(status_code=400, detail="That is already your email.")
    if AuthService(db).get_user_by_email(email=new_email):
        raise HTTPException(status_code=400, detail="This email is already registered.")
    if current_user.pending_email_expires_at and current_user.pending_email:
        sent_at = current_user.pending_email_expires_at - timedelta(minutes=settings.SIGNUP_CODE_MINUTES)
        wait = settings.SIGNUP_RESEND_SECONDS - (datetime.utcnow() - sent_at).total_seconds()
        if wait > 0:
            raise HTTPException(status_code=429, detail=f"Please wait {int(wait) + 1} seconds before asking for another code.")
    code = signup_service.new_code()
    current_user.pending_email = new_email
    current_user.pending_email_code = signup_service.hash_code(code)
    current_user.pending_email_expires_at = datetime.utcnow() + timedelta(minutes=settings.SIGNUP_CODE_MINUTES)
    current_user.pending_email_attempts = 0
    db.commit()
    from app.services.email import send_otp_email
    send_otp_email(new_email, code)
    return {"status": "code_sent", "email": new_email, "resend_after": settings.SIGNUP_RESEND_SECONDS}


@router.post("/me/email/cancel", response_model=User)
def cancel_email_change(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> Any:
    current_user.pending_email = None
    current_user.pending_email_code = None
    current_user.pending_email_expires_at = None
    current_user.pending_email_attempts = 0
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/email/confirm", response_model=User)
def confirm_email_change(
    body: CodeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    if not current_user.pending_email or not current_user.pending_email_code or not current_user.pending_email_expires_at:
        raise HTTPException(status_code=400, detail="No email change is waiting for a code.")
    if datetime.utcnow() > current_user.pending_email_expires_at:
        raise HTTPException(status_code=400, detail="The code has expired. Request a new one.")
    if current_user.pending_email_attempts >= signup_service.MAX_ATTEMPTS:
        raise HTTPException(status_code=400, detail="Too many attempts. Request a new code and try again.")
    import hmac
    if not hmac.compare_digest(current_user.pending_email_code, signup_service.hash_code(body.code.strip())):
        current_user.pending_email_attempts += 1
        db.commit()
        left = signup_service.MAX_ATTEMPTS - current_user.pending_email_attempts
        raise HTTPException(status_code=400, detail="Too many attempts. Request a new code and try again." if left <= 0 else f"That code is not right. Check the email and try again ({left} tries left).")
    if AuthService(db).get_user_by_email(email=current_user.pending_email):
        raise HTTPException(status_code=400, detail="This email is already registered.")
    current_user.email = current_user.pending_email
    current_user.is_email_verified = True
    current_user.pending_email = None
    current_user.pending_email_code = None
    current_user.pending_email_expires_at = None
    current_user.pending_email_attempts = 0
    db.add(ActivityLog(action="EMAIL_VERIFIED", user_id=current_user.id, details={"email": current_user.email}))
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/password")
def change_password(
    body: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    from app.core.security import verify_password
    signup_service.check_password_rules(body.new_password)
    if current_user.has_password and not (body.current_password and verify_password(body.current_password, current_user.hashed_password)):
        raise HTTPException(status_code=400, detail="Your current password is not right.")
    current_user.hashed_password = get_password_hash(body.new_password)
    current_user.has_password = True
    db.commit()
    return {"status": "password_changed"}

from fastapi import UploadFile, File
import shutil
import uuid
import os

@router.post("/me/avatar", response_model=User)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    # Ensure directory exists
    os.makedirs("uploads/profiles", exist_ok=True)
    
    MAX_SIZE = 5 * 1024 * 1024 # 5 MB
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
    ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, and WebP are allowed.")
        
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file extension.")

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    # Create random filename
    filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = f"uploads/profiles/{filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    current_user.profile_picture_url = f"/uploads/profiles/{filename}"
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.delete("/me/avatar", response_model=User)
def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Remove user avatar gracefully from DB and filesystem."""
    if current_user.profile_picture_url:
        file_path = current_user.profile_picture_url.lstrip("/")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.error(f"Failed to delete file {file_path}: {e}")
                
        current_user.profile_picture_url = None
        db.commit()
        db.refresh(current_user)
        
    return current_user

@router.get("/me/activity")
def get_user_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 5
) -> Any:
    """Get recent activity logs exclusively for current user."""
    from app.models.log import ActivityLog
    logs = db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "action": log.action,
            "created_at": log.created_at,
            "details": log.details
        } for log in logs
    ]

class GoogleLoginRequest(BaseModel):
    token: str

def _resolve_google_identity(token: str) -> tuple[str, str, Optional[str]]:
    """Return (email, name, picture) for a Google credential, or raise 400."""
    import urllib.request
    import json

    if token.startswith("mock-google-token-"):
        if not settings.ALLOW_MOCK_LOGIN:
            raise HTTPException(
                status_code=400,
                detail="Mock Google login is disabled in this environment."
            )
        # Simulated Google token format: "mock-google-token-email:name"
        token_content = token.replace("mock-google-token-", "")
        parts = token_content.split(":")
        email = parts[0]
        name = parts[1] if len(parts) > 1 else email.split("@")[0]
        logger.info("Using simulated Google login for email=%s", email)
        return email, name, None

    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        with urllib.request.urlopen(url) as response:
            google_data = json.loads(response.read().decode())
    except Exception as e:
        logger.error("Failed to verify Google token: %s", e)
        raise HTTPException(status_code=400, detail="Invalid Google credential token.")

    if not google_data or "email" not in google_data:
        raise HTTPException(
            status_code=400,
            detail="Could not retrieve email from Google credential token."
        )
    if settings.GOOGLE_CLIENT_ID and google_data.get("aud") != settings.GOOGLE_CLIENT_ID:
        logger.warning("Google token rejected: issued for another client")
        raise HTTPException(status_code=400, detail="This Google credential was not issued for BaroPlatform.")
    if str(google_data.get("email_verified", "true")).lower() != "true":
        raise HTTPException(status_code=400, detail="Your Google email address is not verified.")
    email = google_data["email"]
    return email, google_data.get("name", email.split("@")[0]), google_data.get("picture", None)


@router.post("/google-login", response_model=Token)
def google_login(
    *,
    db: Session = Depends(get_db),
    login_in: GoogleLoginRequest
) -> Any:
    """Login or register with Google."""
    google_email, google_name, google_picture = _resolve_google_identity(login_in.token)

    logger.info("Google login verified for email=%s", google_email)
    auth_service = AuthService(db)
    user = auth_service.get_user_by_email(email=google_email)
    
    if not user:
        import secrets
        from app.models.user import User as DBUser
        # Create a new user with Google login details
        # We assign a secure random password hash
        random_password = secrets.token_urlsafe(32)
        user = DBUser(
            email=google_email,
            hashed_password=get_password_hash(random_password),
            full_name=google_name,
            profile_picture_url=google_picture,
            role=RoleEnum.user,
            is_active=True,
            is_email_verified=True,  # Google accounts are pre-verified
            has_password=False       # Password has not been set yet
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("New Google user registered: %s", user.email)
        
        # Logging
        sys_log = SystemLog(level="INFO", message=f"New Google user registered: {user.email}")
        act_log = ActivityLog(action="USER_SIGNUP", user_id=user.id, details={"email": user.email, "method": "google"})
        db.add(sys_log)
        db.add(act_log)
        db.commit()
    else:
        # If user exists, make sure they have a name/picture if empty
        if not user.full_name:
            user.full_name = google_name
        if not user.profile_picture_url and google_picture:
            user.profile_picture_url = google_picture
        user.is_email_verified = True  # Google users are always verified
        db.commit()
    
    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    logger.info("Google login success for user_id=%s email=%s", user.id, user.email)
    
    db.add(
        ActivityLog(
            action="USER_LOGIN",
            user_id=user.id,
            details={"email": user.email, "method": "google"},
        )
    )
    db.commit()
    
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/verify-email", response_model=Any)
def verify_email(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    payload: Optional[EmailVerificationRequest] = None,
) -> Any:
    """Request email verification (sends OTP) or confirm verification OTP."""
    from app.models.user import User as DBUser
    
    if current_user.is_email_verified:
        return User.model_validate(current_user)
        
    # Case 1: Request OTP code
    if not payload or not payload.code:
        import secrets
        otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
        
        # Save OTP to user record
        current_user.otp_code = otp_code
        current_user.otp_expires_at = datetime.utcnow() + timedelta(minutes=15)
        current_user.otp_attempts = 0
        db.add(current_user)
        db.commit()
        
        # Dispatch verification code email
        from app.services.email import send_otp_email
        send_otp_email(current_user.email, otp_code)
        
        return {"status": "otp_sent", "email": current_user.email}

    # Case 2: Verify OTP code
    if not current_user.otp_code or not current_user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verification code has been requested. Please request one first."
        )

    if datetime.utcnow() > current_user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new one."
        )

    # Brute force protection check
    if getattr(current_user, "otp_attempts", 0) >= 5:
        current_user.otp_code = None
        current_user.otp_expires_at = None
        current_user.otp_attempts = 0
        db.add(current_user)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many incorrect attempts. Please request a new verification code."
        )

    if payload.code != current_user.otp_code:
        current_user.otp_attempts = getattr(current_user, "otp_attempts", 0) + 1
        db.add(current_user)
        db.commit()
        
        if current_user.otp_attempts >= 5:
            current_user.otp_code = None
            current_user.otp_expires_at = None
            current_user.otp_attempts = 0
            db.add(current_user)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many incorrect attempts. Please request a new verification code."
            )
            
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification code. Please check and try again. (Attempt {current_user.otp_attempts}/5)"
        )

    # Success: Mark email as verified
    current_user.is_email_verified = True
    current_user.otp_code = None
    current_user.otp_expires_at = None
    current_user.otp_attempts = 0
    db.add(current_user)
    
    db.add(
        ActivityLog(
            action="EMAIL_VERIFIED",
            user_id=current_user.id,
            details={"email": current_user.email},
        )
    )
    db.commit()
    db.refresh(current_user)
    logger.info("Email verified for user_id=%s email=%s", current_user.id, current_user.email)
    return User.model_validate(current_user)


# ---------------------------------------------------------------------------
# Sign-up with an emailed code, Google sign-up, and profile changes
# ---------------------------------------------------------------------------
from app.schemas.user import User as UserSchema
from app.services import signup_service
from app.models.user import User as DBUserModel


class SignupStartRequest(BaseModel):
    full_name: str
    email: str
    password: str
    university: str
    faculty: str
    programme: str
    year: str
    phone: Optional[str] = None
    terms: bool = False


class EmailOnly(BaseModel):
    email: str


class SignupVerifyRequest(BaseModel):
    email: str
    code: str


class GoogleSignupRequest(BaseModel):
    token: str
    university: str
    faculty: str
    programme: str
    year: str
    phone: Optional[str] = None
    terms: bool = False


class GoogleToken(BaseModel):
    token: str


def _token_for(user: DBUserModel) -> dict:
    expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {"access_token": create_access_token(user.id, expires_delta=expires), "token_type": "bearer"}


@router.post("/signup/start")
def signup_start(body: SignupStartRequest, db: Session = Depends(get_db)) -> Any:
    """Step 3 of sign-up: check the details and email a 6-digit code. No account exists yet."""
    return signup_service.start_signup(
        db, full_name=body.full_name, email=body.email, password=body.password, university=body.university,
        faculty=body.faculty, programme=body.programme, year=body.year, phone=body.phone, terms=body.terms,
    )


@router.post("/signup/resend")
def signup_resend(body: EmailOnly, db: Session = Depends(get_db)) -> Any:
    return signup_service.resend_code(db, body.email)


@router.post("/signup/verify")
def signup_verify(body: SignupVerifyRequest, db: Session = Depends(get_db)) -> Any:
    """Confirm the code: the account is created already verified, and the person is signed in."""
    user = signup_service.verify_signup(db, body.email, body.code)
    return {**_token_for(user), "user": UserSchema.model_validate(user)}


@router.post("/google/verify")
def google_verify(body: GoogleToken, db: Session = Depends(get_db)) -> Any:
    """Check a Google credential and say whether that email already has an account."""
    email, name, picture = _resolve_google_identity(body.token)
    exists = AuthService(db).get_user_by_email(email=email) is not None
    return {"email": email, "name": name, "picture": picture, "registered": exists}


@router.post("/google-signup")
def google_signup(body: GoogleSignupRequest, db: Session = Depends(get_db)) -> Any:
    """Google sign-up: studies are collected first; Google emails are already verified, so no code is sent."""
    email, name, picture = _resolve_google_identity(body.token)
    auth_service = AuthService(db)
    user = auth_service.get_user_by_email(email=email)
    if user is None:
        signup_service.check_studies(
            db, university=body.university, faculty=body.faculty, year=body.year,
            programme=body.programme, phone=body.phone, terms=body.terms,
        )
        import secrets
        user = DBUserModel(
            email=email,
            hashed_password=get_password_hash(secrets.token_urlsafe(32)),
            full_name=name,
            profile_picture_url=picture,
            role=RoleEnum.user,
            is_active=True,
            is_email_verified=True,
            has_password=False,
            university=body.university,
            faculty=body.faculty,
            programme=body.programme.strip(),
            year_of_study=body.year,
            phone=(body.phone or "").strip() or None,
            terms_accepted_at=datetime.utcnow(),
        )
        db.add(user)
        db.add(SystemLog(level="INFO", message=f"New Google user registered: {email}"))
        db.commit()
        db.refresh(user)
        db.add(ActivityLog(action="USER_SIGNUP", user_id=user.id, details={"email": email, "method": "google"}))
        db.commit()
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return {**_token_for(user), "user": UserSchema.model_validate(user)}
