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
