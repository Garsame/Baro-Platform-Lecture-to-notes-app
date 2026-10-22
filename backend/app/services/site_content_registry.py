from dataclasses import dataclass

from pydantic import BaseModel

from app.schemas.site_content import BrandingSettings, SeoSettings


@dataclass(frozen=True)
class SectionSpec:
    key: str
    label: str
    schema: type[BaseModel]
    default: dict
    public: bool = True  # False = admin-only (e.g. email settings in Phase 5)


BRANDING_DEFAULT = {
    "site_name": "BaroPlatform",
    "tagline": "Somali-first AI study tools that turn recorded lectures into notes, summaries, quizzes and review material.",
    "logo_light_url": "/barobadi-logo.png",
    "logo_dark_url": "/barobadi-logo-dark.png",
    "icon_url": "/baro-icon.png",
    "primary_color": "#2a2a72",
    "accent_color": "#009ffd",
    "footer_note": "Built for focused lecture revision.",
}

SEO_DEFAULT = {
    "default_title": "BaroPlatform | Turn lectures into Somali study notes",
    "title_template": "%s | BaroPlatform",
    "description": "BaroPlatform turns lecture videos into Somali study notes, summaries, quizzes and a lecture chatbot, built at Hormuud University.",
    "keywords": ["Somali lecture notes", "Somali AI", "lecture transcription", "study notes", "Hormuud University"],
    "og_image_url": "/public-hero-somali-notes.png",
}

SECTIONS: dict[str, SectionSpec] = {
    "branding": SectionSpec("branding", "Branding", BrandingSettings, BRANDING_DEFAULT),
    "seo": SectionSpec("seo", "Search and sharing", SeoSettings, SEO_DEFAULT),
}

# Fail fast at import if a default does not satisfy its own schema.
for _spec in SECTIONS.values():
    _spec.schema.model_validate(_spec.default)
