import re

from pydantic import BaseModel, ConfigDict, Field, field_validator

HEX_COLOR = r"^#[0-9a-fA-F]{6}$"


def check_asset_url(value: str | None) -> str | None:
    """Allow uploaded files (/uploads/site/...), files in frontend/public (/...), or https links."""
    if value in (None, ""):
        return value
    if value.startswith("https://") or (value.startswith("/") and not value.startswith("//")):
        return value
    raise ValueError("Use an uploaded file, a path starting with /, or an https:// link")


class BrandingSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    site_name: str = Field(min_length=2, max_length=40)
    tagline: str = Field(min_length=10, max_length=160)
    logo_light_url: str = Field(min_length=1, max_length=500)
    logo_dark_url: str = Field(min_length=1, max_length=500)
    icon_url: str = Field(min_length=1, max_length=500)
    primary_color: str = Field(pattern=HEX_COLOR)
    accent_color: str = Field(pattern=HEX_COLOR)
    footer_note: str = Field(default="", max_length=120)

    @field_validator("logo_light_url", "logo_dark_url", "icon_url")
    @classmethod
    def _asset(cls, value: str) -> str:
        return check_asset_url(value)


class SeoSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    default_title: str = Field(min_length=10, max_length=70)
    title_template: str = Field(min_length=3, max_length=70)
    description: str = Field(min_length=50, max_length=160)
    keywords: list[str] = Field(default_factory=list, max_length=15)
    og_image_url: str | None = Field(default=None, max_length=500)

    @field_validator("title_template")
    @classmethod
    def _template(cls, value: str) -> str:
        if value.count("%s") != 1:
            raise ValueError("Must contain %s exactly once, where the page name goes")
        return value

    @field_validator("keywords")
    @classmethod
    def _keywords(cls, value: list[str]) -> list[str]:
        cleaned = [k.strip() for k in value if k.strip()]
        if any(len(k) > 40 for k in cleaned):
            raise ValueError("Each keyword must be 40 characters or fewer")
        return cleaned

    @field_validator("og_image_url")
    @classmethod
    def _og(cls, value: str | None) -> str | None:
        return check_asset_url(value)


def check_link(value: str) -> str:
    """Internal paths (/about, /about#team) or https links."""
    if value.startswith("https://") or (value.startswith("/") and not value.startswith("//")):
        return value
    raise ValueError("Use a path starting with / or an https:// link")


class NavLink(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    label: str = Field(min_length=1, max_length=40)
    description: str = Field(default="", max_length=80)
    href: str = Field(min_length=1, max_length=300)
    icon: str = Field(default="link", pattern=r"^[a-z0-9_]{1,40}$")
    enabled: bool = True

    @field_validator("href")
    @classmethod
    def _href(cls, value: str) -> str:
        return check_link(value)


def _social(value: str) -> str:
    if value == "" or value.startswith("https://"):
        return value
    raise ValueError("Use a full https:// link, or leave empty to hide it")


class NavigationSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    about_tagline: str = Field(min_length=1, max_length=90)
    resources_tagline: str = Field(min_length=1, max_length=90)
    about_links: list[NavLink] = Field(default_factory=list, max_length=8)
    resources_links: list[NavLink] = Field(default_factory=list, max_length=8)
    cta_label: str = Field(min_length=1, max_length=24)
    footer_tagline_a: str = Field(min_length=1, max_length=24)
    footer_tagline_b: str = Field(default="", max_length=24)
    footer_about: str = Field(min_length=10, max_length=220)
    social_facebook: str = Field(default="", max_length=300)
    social_x: str = Field(default="", max_length=300)
    social_linkedin: str = Field(default="", max_length=300)
    social_github: str = Field(default="", max_length=300)
    social_youtube: str = Field(default="", max_length=300)

    @field_validator("social_facebook", "social_x", "social_linkedin", "social_github", "social_youtube")
    @classmethod
    def _socials(cls, value: str) -> str:
        return _social(value)


class JourneyCard(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    tab: str = Field(min_length=1, max_length=24)
    label: str = Field(min_length=1, max_length=32)
    title: str = Field(min_length=1, max_length=90)
    icon: str = Field(default="school", pattern=r"^[a-z0-9_]{1,40}$")
    link_label: str = Field(min_length=1, max_length=30)
    href: str = Field(min_length=1, max_length=300)

    @field_validator("href")
    @classmethod
    def _href(cls, value: str) -> str:
        return check_link(value)


class FaqItem(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    q: str = Field(min_length=3, max_length=120)
    a: str = Field(min_length=3, max_length=600)


class HomeSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    badge_label: str = Field(default="", max_length=14)
    badge_text: str = Field(default="", max_length=60)
    headline: str = Field(min_length=4, max_length=50)
    headline_accent: str = Field(default="", max_length=40)
    subheadline: str = Field(min_length=10, max_length=240)
    primary_cta: str = Field(min_length=1, max_length=24)
    secondary_cta: str = Field(min_length=1, max_length=28)
    hero_points: list[str] = Field(default_factory=list, max_length=5)

    stats_title: str = Field(min_length=1, max_length=60)
    stats_intro: str = Field(default="", max_length=160)
    stat_lectures: bool = True
    stat_students: bool = True
    stat_hours: bool = True
    stat_notes: bool = True
    stat_quizzes: bool = True
    stat_time: bool = True
    stat_success: bool = False

    journey_title_a: str = Field(min_length=1, max_length=70)
    journey_title_b: str = Field(default="", max_length=80)
    journey_cards: list[JourneyCard] = Field(default_factory=list, max_length=15)

    show_note_preview: bool = True
    note_title: str = Field(min_length=1, max_length=60)
    note_intro: str = Field(default="", max_length=200)
    note_points: list[str] = Field(default_factory=list, max_length=8)

    show_testimonials: bool = True
    testimonials_title: str = Field(min_length=1, max_length=60)
    testimonials_intro: str = Field(default="", max_length=160)

    faq_title: str = Field(min_length=1, max_length=60)
    faqs: list[FaqItem] = Field(default_factory=list, max_length=12)

    cta_title: str = Field(min_length=1, max_length=60)
    cta_text: str = Field(default="", max_length=200)

    @field_validator("hero_points", "note_points")
    @classmethod
    def _points(cls, value: list[str]) -> list[str]:
        cleaned = [v.strip() for v in value if v.strip()]
        if any(len(v) > 100 for v in cleaned):
            raise ValueError("Each point must be 100 characters or fewer")
        return cleaned


class StageItem(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=14)
    code: str = Field(default="", max_length=60)
    title: str = Field(min_length=1, max_length=50)
    text: str = Field(min_length=1, max_length=320)
    tech: list[str] = Field(default_factory=list, max_length=6)
    image_url: str | None = Field(default=None, max_length=500)

    @field_validator("tech")
    @classmethod
    def _tech(cls, value: list[str]) -> list[str]:
        cleaned = [t.strip() for t in value if t.strip()]
        if any(len(t) > 40 for t in cleaned):
            raise ValueError("Each technology name must be 40 characters or fewer")
        return cleaned

    @field_validator("image_url")
    @classmethod
    def _image(cls, value: str | None) -> str | None:
        return check_asset_url(value or None)


class AboutSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    headline: str = Field(min_length=4, max_length=90)
    intro: str = Field(min_length=10, max_length=300)
    mission_title: str = Field(min_length=1, max_length=40)
    mission: str = Field(min_length=10, max_length=400)
    stages_title: str = Field(min_length=1, max_length=60)
    stages: list[StageItem] = Field(default_factory=list, max_length=12)
    cta_title: str = Field(min_length=1, max_length=60)
    cta_text: str = Field(default="", max_length=200)


class TeamMember(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=2, max_length=60)
    role: str = Field(min_length=1, max_length=80)
    level: str = Field(default="member", pattern=r"^(supervisor|member)$")
    bio: str = Field(default="", max_length=300)
    photo_url: str = Field(default="", max_length=500)
    linkedin: str = Field(default="", max_length=300)
    github: str = Field(default="", max_length=300)

    @field_validator("photo_url")
    @classmethod
    def _photo(cls, value: str) -> str:
        return check_asset_url(value) or ""

    @field_validator("linkedin", "github")
    @classmethod
    def _links(cls, value: str) -> str:
        return _social(value)


class TeamSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=60)
    intro: str = Field(default="", max_length=300)
    members: list[TeamMember] = Field(default_factory=list, max_length=12)


_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _optional_email(value: str) -> str:
    if value == "" or _EMAIL.match(value):
        return value
    raise ValueError("Enter a valid email address, or leave empty to hide it")


class ContactSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    headline: str = Field(min_length=4, max_length=80)
    intro: str = Field(min_length=10, max_length=300)
    contact_name: str = Field(default="", max_length=60)
    email: str = Field(default="", max_length=120)
    phone: str = Field(default="", max_length=40)
    whatsapp: str = Field(default="", max_length=40)
    hours: str = Field(default="", max_length=80)
    topics: list[str] = Field(default_factory=list, max_length=10)

    @field_validator("email")
    @classmethod
    def _email(cls, value: str) -> str:
        return _optional_email(value)

    @field_validator("topics")
    @classmethod
    def _topics(cls, value: list[str]) -> list[str]:
        cleaned = [t.strip() for t in value if t.strip()]
        if any(len(t) > 40 for t in cleaned):
            raise ValueError("Each topic must be 40 characters or fewer")
        return cleaned


class EmailSettings(BaseModel):
    """Admin-only: never returned by the public content API."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    recipient_email: str = Field(default="", max_length=120)
    auto_reply_enabled: bool = True
    auto_reply_subject: str = Field(min_length=3, max_length=80)
    auto_reply_body: str = Field(min_length=10, max_length=1200)

    @field_validator("recipient_email")
    @classmethod
    def _recipient(cls, value: str) -> str:
        return _optional_email(value)


class ResearchStage(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    when: str = Field(default="", max_length=30)
    name: str = Field(min_length=1, max_length=50)
    text: str = Field(default="", max_length=200)


class ResearchResult(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    label: str = Field(min_length=1, max_length=40)
    value: str = Field(min_length=1, max_length=5)

    @field_validator("value")
    @classmethod
    def _score(cls, v: str) -> str:
        try:
            n = float(v)
        except ValueError:
            raise ValueError("Enter a number between 0 and 5, for example 4.57")
        if not 0 <= n <= 5:
            raise ValueError("The score must be between 0 and 5")
        return v


class ResearchSettings(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str = Field(min_length=4, max_length=160)
    subtitle: str = Field(default="", max_length=120)
    authors: str = Field(default="", max_length=200)
    supervisor: str = Field(default="", max_length=80)
    abstract: str = Field(min_length=20, max_length=1400)
    stages: list[ResearchStage] = Field(default_factory=list, max_length=10)
    results: list[ResearchResult] = Field(default_factory=list, max_length=10)
    participants: str = Field(default="", max_length=6)
    questions: str = Field(default="", max_length=6)
    success_rate: str = Field(default="", max_length=8)
    avg_time: str = Field(default="", max_length=10)
    paper_venue: str = Field(default="", max_length=140)
    paper_detail: str = Field(default="", max_length=220)
    thesis_url: str = Field(default="", max_length=500)
    thesis_file: str = Field(default="", max_length=80)

    @field_validator("thesis_url")
    @classmethod
    def _thesis(cls, value: str) -> str:
        return check_asset_url(value) or ""


class TestimonialSubmit(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    text: str = Field(min_length=20, max_length=500)
    rating: int = Field(ge=1, le=5)
    role: str = Field(default="", max_length=80)


class TestimonialAdminIn(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    kind: str = Field(default="review", pattern=r"^(review|figure)$")
    name: str = Field(min_length=1, max_length=120)
    role: str = Field(default="", max_length=120)
    text: str = Field(min_length=3, max_length=500)
    rating: int | None = Field(default=None, ge=1, le=5)
    big: str | None = Field(default=None, max_length=40)
    source: str | None = Field(default=None, max_length=100)
    status: str = Field(default="approved", pattern=r"^(pending|approved|hidden)$")


class TestimonialOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    kind: str
    origin: str
    name: str
    role: str
    text: str
    rating: int | None = None
    big: str | None = None
    source: str | None = None
    status: str
    sort_order: int


class ReorderIn(BaseModel):
    ids: list[int]


class SectionUpdate(BaseModel):
    value: dict


class SiteAssetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    kind: str
    url: str
    original_name: str
    content_type: str
    size_bytes: int
    alt_text: str | None = None
