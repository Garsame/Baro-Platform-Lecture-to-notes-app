from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text, Boolean
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.core.database import Base

class RoleEnum(str, enum.Enum):
    guest = "guest"
    user = "user"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(RoleEnum), default=RoleEnum.user, nullable=False)
    profile_picture_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_email_verified = Column(Boolean, default=False, nullable=False)
    has_password = Column(Boolean, default=True, nullable=False)
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    otp_attempts = Column(Integer, default=0, nullable=False)
    login_attempts = Column(Integer, default=0, nullable=False)
    lockout_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    lectures = relationship("Lecture", back_populates="owner")
    logs = relationship("ActivityLog", back_populates="user")
    chat_messages = relationship("LectureChatMessage", back_populates="owner")
