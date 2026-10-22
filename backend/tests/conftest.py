import os
import tempfile

_db_file = os.path.join(tempfile.mkdtemp(), "test.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_db_file}"
os.environ["SECRET_KEY"] = "test-secret"
os.environ["USE_CELERY"] = "false"

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_current_active_admin
from app.core.database import Base, SessionLocal, engine
from app.main import app
from app.models.user import RoleEnum, User
from app.services import site_asset_service


@pytest.fixture(autouse=True)
def _reset_rate_limits():
    from app.core import rate_limit
    rate_limit.reset()
    yield


@pytest.fixture(autouse=True)
def _db(tmp_path, monkeypatch):
    monkeypatch.setattr(site_asset_service, "SITE_UPLOAD_DIR", tmp_path / "site")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    db.add(User(email="admin@example.com", hashed_password="x", full_name="Admin", role=RoleEnum.admin, is_email_verified=True))
    db.add(User(email="user@example.com", hashed_password="x", full_name="User", role=RoleEnum.user, is_email_verified=True))
    db.commit()
    db.close()
    yield


@pytest.fixture
def client():
    app.dependency_overrides.clear()
    return TestClient(app)


@pytest.fixture
def admin_client():
    def _admin():
        db = SessionLocal()
        try:
            return db.query(User).filter(User.email == "admin@example.com").first()
        finally:
            db.close()

    app.dependency_overrides[get_current_active_admin] = _admin
    yield TestClient(app)
    app.dependency_overrides.clear()
