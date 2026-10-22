from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.core.database import Base


class PendingSignup(Base):
    """A sign-up waiting for its email code. The user row is only created once the code is verified."""

    __tablename__ = "pending_signups"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    university = Column(String(120), nullable=False)
    faculty = Column(String(120), nullable=False)
    programme = Column(String(160), nullable=False)
    year_of_study = Column(String(40), nullable=False)
    phone = Column(String(40), nullable=True)
    terms_accepted_at = Column(DateTime, nullable=False)
    code_hash = Column(String(128), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    last_sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
