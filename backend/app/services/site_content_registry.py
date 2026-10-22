from dataclasses import dataclass

from pydantic import BaseModel

from app.schemas.site_content import AboutSettings, BrandingSettings, ContactSettings, EmailSettings, HomeSettings, NavigationSettings, SeoSettings, TeamSettings


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
        {"label": "Team", "description": "The writers and supervisor behind BaroPlatform", "href": "/about#team", "icon": "groups", "enabled": True},
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

ABOUT_DEFAULT = {
    "headline": "From a lecture video to Somali study notes, step by step",
    "intro": "BaroPlatform was built at Hormuud University to help Somali-speaking students learn from recorded lectures. This is exactly what happens between pressing Submit and opening your notes.",
    "mission_title": "Why we built it",
    "mission": "Most university lectures available online are in English, and long recordings are hard to revise from. Students spend hours pausing, translating and rewriting. BaroPlatform automates that work so the time goes into learning.",
    "stages_title": "The pipeline, stage by stage",
    "stages": [
        {"name": "Submit", "code": "validating_input", "title": "Bring any lecture", "text": "Paste a public YouTube link or upload an audio or video file. The platform checks the link or file before anything else runs.", "tech": ["YouTube links", "Audio and video uploads"], "image_url": None},
        {"name": "Prepare", "code": "preparing_media · extracting_audio · preparing_audio", "title": "Extract and split the audio", "text": "The video is downloaded, the audio track is extracted, and long recordings are split into chunks of about eight minutes so each one transcribes reliably.", "tech": ["yt-dlp", "FFmpeg"], "image_url": None},
        {"name": "Transcribe", "code": "transcribing", "title": "Turn speech into text", "text": "Each chunk is transcribed by an AI speech model, then the pieces are joined back in order.", "tech": ["Google Gemini", "OpenAI Whisper (fallback)"], "image_url": None},
        {"name": "Clean", "code": "cleaning_transcript", "title": "Tidy the transcript", "text": "Repeated fragments are removed and the text is formatted into readable paragraphs.", "tech": ["Transcript cleaning"], "image_url": None},
        {"name": "Write", "code": "generating_notes", "title": "Write the Somali notes", "text": "A large language model reads the transcript and writes a summary, key points, detailed notes and key terms in Somali. Long transcripts are handled in sections so nothing is skipped.", "tech": ["Google Gemini"], "image_url": None},
        {"name": "Check", "code": "lecture analysis", "title": "Classify and check quality", "text": "The lecture is labelled with its subject area and the notes get a confidence score, which the admin team uses to spot weak results.", "tech": ["Subject label", "Confidence score"], "image_url": None},
        {"name": "Study", "code": "quiz · chat · audio", "title": "Build your study tools", "text": "A quiz is generated from the notes, the lecture chat answers from the transcript, and the notes can be read aloud in a Somali neural voice.", "tech": ["Quiz generation", "Google Gemini chat", "Azure Somali voices"], "image_url": None},
        {"name": "Save", "code": "saving_results · completed", "title": "Saved to your library", "text": "Everything is saved to your account, so the lecture, notes, quiz and chat history are there whenever you come back.", "tech": ["PostgreSQL", "FastAPI"], "image_url": None},
    ],
    "cta_title": "Your next lecture, in Somali notes",
    "cta_text": "Create an account and turn your next recorded lecture into notes, a quiz and a study chat.",
}

TEAM_DEFAULT = {
    "title": "The team behind BaroPlatform",
    "intro": "BaroPlatform was designed, built and evaluated by four final-year Computer Science students at Hormuud University, under faculty supervision.",
    "members": [
        {"name": "Dr. Yusuf Abas Mohamed", "role": "Research supervisor", "level": "supervisor", "bio": "Faculty of Computer Science and Information Technology, Hormuud University. Supervised the research and is corresponding author of the HUMC 2026 paper.", "photo_url": "", "linkedin": "", "github": ""},
        {"name": "Abdirahim Mohamud Iftin", "role": "Researcher and developer", "level": "member", "bio": "Final-year Bachelor of Computer Science student at Hormuud University and co-author of the BaroPlatform thesis.", "photo_url": "", "linkedin": "", "github": ""},
        {"name": "Mohamed Abdi Mire", "role": "Researcher and developer", "level": "member", "bio": "Final-year Bachelor of Computer Science student at Hormuud University and co-author of the BaroPlatform thesis.", "photo_url": "", "linkedin": "", "github": ""},
        {"name": "Faaiza Daahir Dhaqane", "role": "Researcher and developer", "level": "member", "bio": "Final-year Bachelor of Computer Science student at Hormuud University and co-author of the BaroPlatform thesis.", "photo_url": "", "linkedin": "", "github": ""},
        {"name": "Hafso Hersi Omar", "role": "Researcher and developer", "level": "member", "bio": "Final-year Bachelor of Computer Science student at Hormuud University and co-author of the BaroPlatform thesis.", "photo_url": "", "linkedin": "", "github": ""},
    ],
}

CONTACT_DEFAULT = {
    "headline": "Talk to the BaroPlatform team",
    "intro": "Questions about your account, a lecture that did not process, or using BaroPlatform in your classes. Send a message and we reply by email.",
    "contact_name": "BaroPlatform Support",
    # Empty until the admin fills them in; empty details are hidden on the page.
    "email": "",
    "phone": "",
    "whatsapp": "",
    "hours": "",
    "topics": ["Account and sign-in", "Lecture processing", "Notes and quizzes", "Using BaroPlatform in class", "Something else"],
}

EMAIL_DEFAULT = {
    # Empty means: use the SMTP_FROM_EMAIL (or SMTP_USER) inbox from the backend environment.
    "recipient_email": "",
    "auto_reply_enabled": True,
    "auto_reply_subject": "We received your message",
    "auto_reply_body": "Hi {name},\n\nThanks for contacting BaroPlatform. We received your message about \"{topic}\" and will reply by email as soon as we can.\n\nThe BaroPlatform team",
}

SECTIONS: dict[str, SectionSpec] = {
    "branding": SectionSpec("branding", "Branding", BrandingSettings, BRANDING_DEFAULT),
    "seo": SectionSpec("seo", "Search and sharing", SeoSettings, SEO_DEFAULT),
    "navigation": SectionSpec("navigation", "Navigation and footer", NavigationSettings, NAVIGATION_DEFAULT),
    "home": SectionSpec("home", "Home page", HomeSettings, HOME_DEFAULT),
    "about": SectionSpec("about", "About page", AboutSettings, ABOUT_DEFAULT),
    "team": SectionSpec("team", "Team", TeamSettings, TEAM_DEFAULT),
    "contact": SectionSpec("contact", "Contact page", ContactSettings, CONTACT_DEFAULT),
    "email": SectionSpec("email", "Email settings", EmailSettings, EMAIL_DEFAULT, public=False),
}

# Fail fast at import if a default does not satisfy its own schema.
for _spec in SECTIONS.values():
    _spec.schema.model_validate(_spec.default)
