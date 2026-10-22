import copy
import logging
from datetime import datetime

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.models.log import ActivityLog
from app.models.site_content import SiteSetting
from app.models.user import User
from app.services.site_content_registry import SECTIONS

logger = logging.getLogger("somali_notes.site_content")


class SectionNotFound(Exception):
    pass


class SectionValidationError(Exception):
    def __init__(self, errors: list[dict]):
        super().__init__("Some fields need attention")
        self.errors = errors


class SiteContentService:
    def __init__(self, db: Session):
        self.db = db

    def _spec(self, key: str):
        spec = SECTIONS.get(key)
        if spec is None:
            raise SectionNotFound(key)
        return spec

    def _row(self, key: str) -> SiteSetting | None:
        return self.db.query(SiteSetting).filter(SiteSetting.key == key).first()

    def _resolve(self, spec, row: SiteSetting | None) -> dict:
        if row is None:
            return copy.deepcopy(spec.default)
        merged = {**spec.default, **(row.value or {})}
        merged = {k: v for k, v in merged.items() if k in spec.schema.model_fields}
        try:
            return spec.schema.model_validate(merged).model_dump()
        except ValidationError as exc:
            logger.warning("Stored site content %r is invalid, using default: %s", spec.key, exc)
            return copy.deepcopy(spec.default)

    def get_section(self, key: str) -> dict:
        spec = self._spec(key)
        return self._resolve(spec, self._row(key))

    def describe(self, key: str) -> dict:
        spec = self._spec(key)
        row = self._row(key)
        return {
            "key": spec.key,
            "label": spec.label,
            "public": spec.public,
            "value": self._resolve(spec, row),
            "default": copy.deepcopy(spec.default),
            "is_default": row is None,
            "updated_at": row.updated_at.isoformat() if row else None,
        }

    def public_bundle(self) -> dict:
        public_keys = [k for k, s in SECTIONS.items() if s.public]
        rows = {r.key: r for r in self.db.query(SiteSetting).filter(SiteSetting.key.in_(public_keys)).all()}
        stamps = [r.updated_at for r in rows.values() if r.updated_at]
        return {
            "updated_at": max(stamps).isoformat() if stamps else None,
            "sections": {k: self._resolve(SECTIONS[k], rows.get(k)) for k in public_keys},
        }

    def update_section(self, key: str, value: dict, admin: User) -> dict:
        spec = self._spec(key)
        try:
            clean = spec.schema.model_validate(value).model_dump()
        except ValidationError as exc:
            raise SectionValidationError(
                [{"field": ".".join(str(p) for p in e["loc"]), "message": e["msg"]} for e in exc.errors()]
            )
        row = self._row(key)
        if row is None:
            row = SiteSetting(key=key, value=clean)
            self.db.add(row)
        else:
            row.value = clean
        row.updated_by_id = admin.id
        row.updated_at = datetime.utcnow()
        self.db.add(ActivityLog(action="SITE_CONTENT_UPDATED", user_id=admin.id, details={"section": key}))
        self.db.commit()
        return self.describe(key)

    def reset_section(self, key: str, admin: User) -> dict:
        self._spec(key)
        row = self._row(key)
        if row is not None:
            self.db.delete(row)
        self.db.add(ActivityLog(action="SITE_CONTENT_RESET", user_id=admin.id, details={"section": key}))
        self.db.commit()
        return self.describe(key)
