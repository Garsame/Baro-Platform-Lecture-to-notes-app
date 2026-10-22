from datetime import datetime

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Integer, JSON, String, Text

from app.core.database import Base


class SiteSetting(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(64), unique=True, index=True, nullable=False)
    value = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    updated_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)


class SiteAsset(Base):
    __tablename__ = "site_assets"

    id = Column(Integer, primary_key=True, index=True)
    kind = Column(String(16), nullable=False)  # image | icon | document
    url = Column(String(500), nullable=False, unique=True)
    original_name = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    size_bytes = Column(BigInteger, nullable=False)
    alt_text = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)


class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    kind = Column(String(16), nullable=False, default="review")  # review | figure
    origin = Column(String(16), nullable=False, default="admin")  # admin (questionnaire) | user
    name = Column(String(120), nullable=False)
    role = Column(String(120), nullable=False, default="")
    text = Column(Text, nullable=False)
    rating = Column(Integer, nullable=True)
    big = Column(String(40), nullable=True)
    source = Column(String(100), nullable=True)
    status = Column(String(16), nullable=False, default="pending", index=True)  # pending | approved | hidden
    sort_order = Column(Integer, nullable=False, default=0)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
