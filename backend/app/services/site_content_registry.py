from dataclasses import dataclass

from pydantic import BaseModel

from app.schemas.site_content import BrandingSettings, NavigationSettings, SeoSettings


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

NAVIGATION_DEFAULT = {
    "about_tagline": "How BaroPlatform turns one lecture into a full study pack.",
    "resources_tagline": "Everything about the platform and the research behind it.",
    # Links to pages that do not exist yet start disabled; enable them when the page ships.
    "about_links": [
        {"label": "How it works", "description": "The stages from video to notes", "href": "/about", "icon": "account_tree", "enabled": True},
        {"label": "Team", "description": "The writers and supervisor behind BaroPlatform", "href": "/about#team", "icon": "groups", "enabled": False},
        {"label": "Intro video", "description": "Watch one lecture become a study pack", "href": "/#intro-video", "icon": "play_circle", "enabled": False},
    ],
    "resources_links": [
        {"label": "Documentation", "description": "How to use every feature", "href": "/resources/docs", "icon": "menu_book", "enabled": False},
        {"label": "Releases", "description": "What changed and what is next", "href": "/resources/releases", "icon": "new_releases", "enabled": False},
        {"label": "Research and findings", "description": "Abstract, stages and results", "href": "/resources/research", "icon": "science", "enabled": False},
        {"label": "State of research", "description": "Published work and our contribution", "href": "/resources/state-of-research", "icon": "travel_explore", "enabled": False},
    ],
    "cta_label": "Get started",
    "footer_tagline_a": "Learn it",
    "footer_tagline_b": "in Somali.",
    "footer_about": "BaroPlatform turns recorded lectures into Somali notes, quizzes and a study chat, so students spend their time learning instead of transcribing.",
    "social_facebook": "",
    "social_x": "",
    "social_linkedin": "",
    "social_github": "",
    "social_youtube": "",
}

SECTIONS: dict[str, SectionSpec] = {
    "branding": SectionSpec("branding", "Branding", BrandingSettings, BRANDING_DEFAULT),
    "seo": SectionSpec("seo", "Search and sharing", SeoSettings, SEO_DEFAULT),
    "navigation": SectionSpec("navigation", "Navigation and footer", NavigationSettings, NAVIGATION_DEFAULT),
}

# Fail fast at import if a default does not satisfy its own schema.
for _spec in SECTIONS.values():
    _spec.schema.model_validate(_spec.default)
