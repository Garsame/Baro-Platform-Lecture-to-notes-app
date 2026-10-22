from dataclasses import dataclass

from pydantic import BaseModel

from app.schemas.site_content import BrandingSettings, HomeSettings, NavigationSettings, SeoSettings


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

HOME_DEFAULT = {
    "badge_label": "New",
    "badge_text": "Somali notes from any lecture video",
    "headline": "Turn any lecture into",
    "headline_accent": "Somali study notes.",
    "subheadline": "Paste a YouTube link or upload a recording. BaroPlatform transcribes it, writes structured Somali notes, builds a quiz, and lets you ask the lecture questions.",
    "primary_cta": "Get started",
    "secondary_cta": "See how it works",
    "hero_points": ["YouTube links or uploads", "Notes written in Somali", "Quiz and lecture chat included"],
    "stats_title": "The work happening behind the scenes",
    "stats_intro": "These numbers come from the platform itself and update every time this page loads.",
    "stat_lectures": True,
    "stat_students": True,
    "stat_hours": True,
    "stat_notes": True,
    "stat_quizzes": True,
    "stat_time": True,
    "stat_success": False,
    "journey_title_a": "From one recording to a full revision pack,",
    "journey_title_b": "BaroPlatform fits every way you study.",
    "journey_cards": [
        {"tab": "By step", "label": "Add · about a minute", "title": "Paste a YouTube link or upload a file, and processing starts.", "icon": "add_link", "link_label": "Add a lecture", "href": "/sign-up"},
        {"tab": "By step", "label": "Process · a few minutes", "title": "Speech is transcribed and Somali notes are written for you.", "icon": "graphic_eq", "link_label": "See the pipeline", "href": "/about"},
        {"tab": "By step", "label": "Revise · any time", "title": "Read, listen, take the quiz and chat with the lecture.", "icon": "auto_stories", "link_label": "Get started", "href": "/sign-up"},
        {"tab": "By lecture source", "label": "YouTube", "title": "Public lecture videos, using captions when the video has them.", "icon": "smart_display", "link_label": "Add a link", "href": "/sign-up"},
        {"tab": "By lecture source", "label": "Recorded class", "title": "Audio or video you recorded, uploaded from your phone or laptop.", "icon": "mic", "link_label": "Upload a file", "href": "/sign-up"},
        {"tab": "By lecture source", "label": "Long lectures", "title": "Recordings over an hour are split into chunks so nothing is skipped.", "icon": "timer", "link_label": "See how it works", "href": "/about"},
        {"tab": "By study goal", "label": "Exam revision", "title": "Key points and a quiz show what you remember and what you missed.", "icon": "quiz", "link_label": "Get started", "href": "/sign-up"},
        {"tab": "By study goal", "label": "Understanding", "title": "Detailed Somali notes and key terms explain the hard parts.", "icon": "lightbulb", "link_label": "See how it works", "href": "/about"},
        {"tab": "By study goal", "label": "Asking questions", "title": "The lecture chat answers from the transcript, like a tutor.", "icon": "forum", "link_label": "Get started", "href": "/sign-up"},
    ],
    "show_note_preview": True,
    "note_title": "What you get from one lecture",
    "note_intro": "Every processed lecture becomes a study pack. This sample comes from an introductory databases lecture.",
    "note_points": [
        "Summary and key points in Somali",
        "Detailed notes organized by topic",
        "Key terms with Somali explanations",
        "A quiz to check what you remember",
        "The notes read aloud in a Somali voice",
    ],
    "show_testimonials": True,
    "testimonials_title": "What students say",
    "testimonials_intro": "Results from our student evaluation, and reviews from people who use BaroPlatform.",
    "faq_title": "Questions students ask",
    "faqs": [
        {"q": "How accurate is the Somali speech transcription?", "a": "BaroPlatform uses general-purpose AI speech and language models to transcribe lectures and write Somali notes. Accuracy depends on audio quality and how clearly the lecturer speaks; clear recordings give the best results."},
        {"q": "Can I paste YouTube links directly?", "a": "Yes. Paste any public YouTube lecture link, and BaroPlatform will fetch the audio, transcribe the speech, and write your study notes."},
        {"q": "How does the AI interactive chat work?", "a": "Once a lecture is processed, open it and ask a question. The assistant answers from that lecture's transcript, like a tutor who attended the class."},
        {"q": "Can I download my notes and quizzes?", "a": "Yes. Generated notes can be downloaded as a PDF for printing or offline revision."},
    ],
    "cta_title": "Smarter revision starts here.",
    "cta_text": "Create your account and convert your next recorded lecture into structured Somali notes, a transcript, and study tools.",
}

SECTIONS: dict[str, SectionSpec] = {
    "branding": SectionSpec("branding", "Branding", BrandingSettings, BRANDING_DEFAULT),
    "seo": SectionSpec("seo", "Search and sharing", SeoSettings, SEO_DEFAULT),
    "navigation": SectionSpec("navigation", "Navigation and footer", NavigationSettings, NAVIGATION_DEFAULT),
    "home": SectionSpec("home", "Home page", HomeSettings, HOME_DEFAULT),
}

# Fail fast at import if a default does not satisfy its own schema.
for _spec in SECTIONS.values():
    _spec.schema.model_validate(_spec.default)
