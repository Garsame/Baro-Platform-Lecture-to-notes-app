export type BrandingSettings = {
  site_name: string;
  tagline: string;
  logo_light_url: string;
  logo_dark_url: string;
  icon_url: string;
  primary_color: string;
  accent_color: string;
  footer_note: string;
};

export type SeoSettings = {
  default_title: string;
  title_template: string;
  description: string;
  keywords: string[];
  og_image_url: string | null;
};

export type NavLink = {
  label: string;
  description: string;
  href: string;
  icon: string;
  enabled: boolean;
};

export type NavigationSettings = {
  about_tagline: string;
  resources_tagline: string;
  about_links: NavLink[];
  resources_links: NavLink[];
  cta_label: string;
  footer_tagline_a: string;
  footer_tagline_b: string;
  footer_about: string;
  social_facebook: string;
  social_x: string;
  social_linkedin: string;
  social_github: string;
  social_youtube: string;
};

export type JourneyCard = {
  tab: string;
  label: string;
  title: string;
  icon: string;
  link_label: string;
  href: string;
};

export type FaqItem = { q: string; a: string };

export type Highlight = { value: string; label: string };
export type Milestone = { date: string; title: string; text: string; highlight: boolean };

export type HomeSettings = {
  carousel_autoplay: boolean;
  carousel_seconds: number;
  show_publication: boolean;
  pub_eyebrow: string;
  pub_headline: string;
  pub_text: string;
  pub_journal_line: string;
  pub_button_label: string;
  pub_highlights: Highlight[];
  show_milestones: boolean;
  milestones_title: string;
  milestones_intro: string;
  milestones: Milestone[];
  badge_label: string;
  badge_text: string;
  headline: string;
  headline_accent: string;
  subheadline: string;
  primary_cta: string;
  secondary_cta: string;
  hero_points: string[];
  video_title: string;
  video_caption: string;
  video_url: string;
  video_poster_url: string;
  video_youtube: string;
  stats_title: string;
  stats_intro: string;
  stat_lectures: boolean;
  stat_students: boolean;
  stat_hours: boolean;
  stat_notes: boolean;
  stat_quizzes: boolean;
  stat_time: boolean;
  stat_success: boolean;
  journey_title_a: string;
  journey_title_b: string;
  journey_cards: JourneyCard[];
  show_note_preview: boolean;
  note_title: string;
  note_intro: string;
  note_points: string[];
  show_testimonials: boolean;
  testimonials_title: string;
  testimonials_intro: string;
  faq_title: string;
  faqs: FaqItem[];
  cta_title: string;
  cta_text: string;
};

export type PublicStats = {
  lectures: number;
  students: number;
  hours: number;
  notes: number;
  quizzes: number;
  avg_seconds: number;
  success_rate: number;
};

export type Testimonial = {
  id: number;
  kind: "review" | "figure";
  origin: string;
  name: string;
  role: string;
  text: string;
  rating: number | null;
  big: string | null;
  source: string | null;
  status: "pending" | "approved" | "hidden";
  sort_order: number;
};

export type StageItem = {
  name: string;
  code: string;
  title: string;
  text: string;
  tech: string[];
  image_url: string | null;
};

export type AboutSettings = {
  headline: string;
  intro: string;
  mission_title: string;
  mission: string;
  show_video: boolean;
  stages_title: string;
  stages: StageItem[];
  cta_title: string;
  cta_text: string;
};

export type TeamMember = {
  name: string;
  role: string;
  level: "supervisor" | "lead" | "member";
  bio: string;
  photo_url: string;
  linkedin: string;
  github: string;
};

export type TeamSettings = { title: string; intro: string; members: TeamMember[] };

export type Finding = { title: string; text: string };

export type ResearchSettings = {
  pub_label: string;
  pub_title: string;
  pub_journal: string;
  pub_authors: string;
  pub_details: string;
  pub_url: string;
  pub_pdf_url: string;
  pub_cite: string;
  findings_title: string;
  findings: Finding[];
  limitations: string;
  future_work: string;
  title: string;
  subtitle: string;
  authors: string;
  supervisor: string;
  abstract: string;
  stages: { when: string; name: string; text: string }[];
  results: { label: string; value: string }[];
  participants: string;
  questions: string;
  success_rate: string;
  avg_time: string;
  paper_venue: string;
  paper_detail: string;
  thesis_url: string;
  thesis_file: string;
};

export type StateEntry = {
  year: string;
  title: string;
  authors: string;
  venue: string;
  url: string;
  category: string;
  summary: string;
  relation: string;
};

export type StateSettings = {
  title: string;
  intro: string;
  now_text: string;
  contribution: string;
  entries: StateEntry[];
};

export type DocsPage = { group: string; title: string; body: string };
export type DocsSettings = { pages: DocsPage[] };

export type ReleaseEntry = { version: string; date: string; status: "Released" | "Planned"; title: string; notes: string };
export type ReleasesSettings = { intro: string; entries: ReleaseEntry[] };

export type SignupSettings = { universities: string[]; faculties: string[]; year_levels: string[] };

export type ContactSettings = {
  headline: string;
  intro: string;
  contact_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  hours: string;
  topics: string[];
};

/** Admin-only; the public API never returns this section. */
export type EmailSettings = {
  recipient_email: string;
  auto_reply_enabled: boolean;
  auto_reply_subject: string;
  auto_reply_body: string;
};

export type SiteContent = {
  updated_at: string | null;
  sections: {
    branding: BrandingSettings;
    seo: SeoSettings;
    navigation: NavigationSettings;
    home: HomeSettings;
    about: AboutSettings;
    team: TeamSettings;
    contact: ContactSettings;
    research: ResearchSettings;
    state: StateSettings;
    docs: DocsSettings;
    releases: ReleasesSettings;
    signup: SignupSettings;
  };
};

// Generated from the backend registry defaults; keep in sync with backend/app/services/site_content_registry.py.
export const DEFAULT_SITE_CONTENT: SiteContent = {
  updated_at: null,
  sections: {
    "branding": {
      "site_name": "BaroPlatform",
      "tagline": "Somali-first AI study tools that turn recorded lectures into notes, summaries, quizzes and review material.",
      "logo_light_url": "/barobadi-logo.png",
      "logo_dark_url": "/barobadi-logo-dark.png",
      "icon_url": "/baro-icon.png",
      "primary_color": "#2a2a72",
      "accent_color": "#009ffd",
      "footer_note": "Built at Hormuud University for focused lecture revision."
    },
    "seo": {
      "default_title": "BaroPlatform | Turn lectures into Somali study notes",
      "title_template": "%s | BaroPlatform",
      "description": "BaroPlatform turns lecture videos into Somali study notes, summaries, quizzes and a lecture chatbot, built at Hormuud University.",
      "keywords": [
        "Somali lecture notes",
        "Somali AI",
        "lecture transcription",
        "study notes",
        "Hormuud University"
      ],
      "og_image_url": "/public-hero-somali-notes.png"
    },
    "navigation": {
      "about_tagline": "How BaroPlatform turns one lecture into a full study pack.",
      "resources_tagline": "Everything about the platform and the research behind it.",
      "about_links": [
        {
          "label": "How it works",
          "description": "The stages from video to notes",
          "href": "/about",
          "icon": "account_tree",
          "enabled": true
        },
        {
          "label": "Team",
          "description": "The writers and supervisor behind BaroPlatform",
          "href": "/about#team",
          "icon": "groups",
          "enabled": true
        },
        {
          "label": "Intro video",
          "description": "Watch one lecture become a study pack",
          "href": "/?play=intro",
          "icon": "play_circle",
          "enabled": true
        }
      ],
      "resources_links": [
        {
          "label": "Documentation",
          "description": "How to use every feature",
          "href": "/resources/docs",
          "icon": "menu_book",
          "enabled": true
        },
        {
          "label": "Releases",
          "description": "What changed and what is next",
          "href": "/resources/releases",
          "icon": "new_releases",
          "enabled": true
        },
        {
          "label": "Research and findings",
          "description": "Abstract, stages and results",
          "href": "/resources/research",
          "icon": "science",
          "enabled": true
        },
        {
          "label": "State of research",
          "description": "Published work and our contribution",
          "href": "/resources/state-of-research",
          "icon": "travel_explore",
          "enabled": true
        }
      ],
      "cta_label": "Get started",
      "footer_tagline_a": "Learn it",
      "footer_tagline_b": "in Somali.",
      "footer_about": "BaroPlatform turns recorded lectures into Somali notes, quizzes and a study chat, so students spend their time learning instead of transcribing.",
      "social_facebook": "",
      "social_x": "",
      "social_linkedin": "",
      "social_github": "",
      "social_youtube": ""
    },
    "home": {
      "badge_label": "New",
      "badge_text": "Somali notes from any lecture video",
      "headline": "Turn any lecture into",
      "headline_accent": "Somali study notes.",
      "subheadline": "Paste a YouTube link or upload a recording. BaroPlatform transcribes it, writes structured Somali notes, builds a quiz, and lets you ask the lecture questions.",
      "primary_cta": "Get started",
      "secondary_cta": "See how it works",
      "hero_points": [
        "YouTube links or uploads",
        "Notes written in Somali",
        "Quiz and lecture chat included"
      ],
      "carousel_autoplay": true,
      "carousel_seconds": 8,
      "show_publication": true,
      "pub_eyebrow": "Published research",
      "pub_headline": "Our research is published in an international journal.",
      "pub_text": "BaroPlatform was designed and evaluated at Hormuud University, and the study is published in the International Journal of Artificial Intelligence and Digital Innovation. Students rated usability 4.57 out of 5, and every participant agreed it reduced the time needed to prepare study notes.",
      "pub_journal_line": "International Journal of Artificial Intelligence and Digital Innovation · Vol. 1, No. 1 · 2026",
      "pub_button_label": "Read more",
      "pub_highlights": [
        {
          "value": "4.57 / 5",
          "label": "Usability"
        },
        {
          "value": "5.00 / 5",
          "label": "Time saved, all 7 agreed"
        },
        {
          "value": "4.45 / 5",
          "label": "Educational value"
        },
        {
          "value": "7",
          "label": "Students, two universities"
        }
      ],
      "show_milestones": true,
      "milestones_title": "From idea to publication",
      "milestones_intro": "The milestones BaroPlatform has reached so far.",
      "milestones": [
        {
          "date": "20 Feb 2026",
          "title": "Project started",
          "text": "The BaroPlatform project began at Hormuud University.",
          "highlight": false
        },
        {
          "date": "18 Jun 2026",
          "title": "First release",
          "text": "The first version of the app was released.",
          "highlight": false
        },
        {
          "date": "25 Jun 2026",
          "title": "Testing and deploying",
          "text": "The platform was tested and deployed online.",
          "highlight": false
        },
        {
          "date": "1–2 Jul 2026",
          "title": "Student evaluation",
          "text": "Seven students from two universities used the platform and answered a 33-item questionnaire.",
          "highlight": false
        },
        {
          "date": "18–19 Jul 2026",
          "title": "Presented at HUMC 2026",
          "text": "Presented at the Hormuud University International Hybrid Multidisciplinary Conference in Mogadishu.",
          "highlight": false
        },
        {
          "date": "30 Sep 2026",
          "title": "Published in IJAIDI",
          "text": "The research was published in the International Journal of Artificial Intelligence and Digital Innovation.",
          "highlight": true
        }
      ],
      "video_title": "See one lecture become a study pack",
      "video_caption": "Intro video · storyboard preview",
      "video_url": "",
      "video_poster_url": "",
      "video_youtube": "",
      "stats_title": "The work happening behind the scenes",
      "stats_intro": "These numbers come from the platform itself and update every time this page loads.",
      "stat_lectures": true,
      "stat_students": true,
      "stat_hours": true,
      "stat_notes": true,
      "stat_quizzes": true,
      "stat_time": true,
      "stat_success": false,
      "journey_title_a": "From one recording to a full revision pack,",
      "journey_title_b": "BaroPlatform fits every way you study.",
      "journey_cards": [
        {
          "tab": "By step",
          "label": "Add · about a minute",
          "title": "Paste a YouTube link or upload a file, and processing starts.",
          "icon": "add_link",
          "link_label": "Add a lecture",
          "href": "/sign-up"
        },
        {
          "tab": "By step",
          "label": "Process · a few minutes",
          "title": "Speech is transcribed and Somali notes are written for you.",
          "icon": "graphic_eq",
          "link_label": "See the pipeline",
          "href": "/about"
        },
        {
          "tab": "By step",
          "label": "Revise · any time",
          "title": "Read, listen, take the quiz and chat with the lecture.",
          "icon": "auto_stories",
          "link_label": "Read about the notes",
          "href": "/resources/docs/read-your-somali-notes"
        },
        {
          "tab": "By lecture source",
          "label": "YouTube",
          "title": "Public lecture videos, using captions when the video has them.",
          "icon": "smart_display",
          "link_label": "How to add a link",
          "href": "/resources/docs/add-your-first-lecture"
        },
        {
          "tab": "By lecture source",
          "label": "Recorded class",
          "title": "Audio or video you recorded, uploaded from your phone or laptop.",
          "icon": "mic",
          "link_label": "How to upload",
          "href": "/resources/docs/add-your-first-lecture"
        },
        {
          "tab": "By lecture source",
          "label": "Long lectures",
          "title": "Recordings over an hour are split into chunks so nothing is skipped.",
          "icon": "timer",
          "link_label": "See how it works",
          "href": "/about"
        },
        {
          "tab": "By study goal",
          "label": "Exam revision",
          "title": "Key points and a quiz show what you remember and what you missed.",
          "icon": "quiz",
          "link_label": "About quizzes",
          "href": "/resources/docs/take-the-quiz"
        },
        {
          "tab": "By study goal",
          "label": "Understanding",
          "title": "Detailed Somali notes and key terms explain the hard parts.",
          "icon": "lightbulb",
          "link_label": "About the notes",
          "href": "/resources/docs/read-your-somali-notes"
        },
        {
          "tab": "By study goal",
          "label": "Asking questions",
          "title": "The lecture chat answers from the transcript, like a tutor.",
          "icon": "forum",
          "link_label": "About the chat",
          "href": "/resources/docs/ask-the-lecture-chat"
        }
      ],
      "show_note_preview": true,
      "note_title": "What you get from one lecture",
      "note_intro": "Every processed lecture becomes a study pack. This sample comes from an introductory databases lecture.",
      "note_points": [
        "Summary and key points in Somali",
        "Detailed notes organized by topic",
        "Key terms with Somali explanations",
        "A quiz to check what you remember",
        "The notes read aloud in a Somali voice"
      ],
      "show_testimonials": true,
      "testimonials_title": "What students say",
      "testimonials_intro": "Results from our student evaluation, and reviews from people who use BaroPlatform.",
      "faq_title": "Questions students ask",
      "faqs": [
        {
          "q": "Which lectures can I use?",
          "a": "Any public YouTube lecture, or an audio or video file you upload. Clear audio gives the best results."
        },
        {
          "q": "Is the transcription accurate?",
          "a": "BaroPlatform uses general-purpose AI speech and language models. Accuracy depends on audio quality and how clearly the lecturer speaks."
        },
        {
          "q": "Are the notes really in Somali?",
          "a": "Yes. Notes, summaries, key points and quizzes are written in Somali. The original transcript stays available next to them."
        },
        {
          "q": "How does the lecture chat work?",
          "a": "Open a lecture and ask a question. The assistant answers from that lecture's transcript, like a tutor who attended the class."
        },
        {
          "q": "Can I download my notes?",
          "a": "Yes. Generated notes can be downloaded as a PDF for printing or offline revision."
        },
        {
          "q": "How long does processing take?",
          "a": "Most lectures finish in a few minutes. The platform-wide average is shown in the numbers above."
        }
      ],
      "cta_title": "Your next lecture, in Somali notes",
      "cta_text": "Create an account and turn your next recorded lecture into notes, a quiz and a study chat."
    },
    "about": {
      "headline": "From a lecture video to Somali study notes, step by step",
      "intro": "BaroPlatform was built at Hormuud University to help Somali-speaking students learn from recorded lectures. This is exactly what happens between pressing Submit and opening your notes.",
      "mission_title": "Why we built it",
      "mission": "Most university lectures available online are in English, and long recordings are hard to revise from. Students spend hours pausing, translating and rewriting. BaroPlatform automates that work so the time goes into learning.",
      "show_video": true,
      "stages_title": "The pipeline, stage by stage",
      "stages": [
        {
          "name": "Submit",
          "code": "validating_input",
          "title": "Bring any lecture",
          "text": "Paste a public YouTube link or upload an audio or video file. The platform checks the link or file before anything else runs.",
          "tech": [
            "YouTube links",
            "Audio and video uploads"
          ],
          "image_url": null
        },
        {
          "name": "Prepare",
          "code": "preparing_media · extracting_audio · preparing_audio",
          "title": "Extract and split the audio",
          "text": "The video is downloaded, the audio track is extracted, and long recordings are split into chunks of about eight minutes so each one transcribes reliably.",
          "tech": [
            "yt-dlp",
            "FFmpeg"
          ],
          "image_url": null
        },
        {
          "name": "Transcribe",
          "code": "transcribing",
          "title": "Turn speech into text",
          "text": "Each chunk is transcribed by OpenAI Whisper, then the pieces are joined back in order.",
          "tech": [
            "OpenAI Whisper"
          ],
          "image_url": null
        },
        {
          "name": "Clean",
          "code": "cleaning_transcript",
          "title": "Tidy the transcript",
          "text": "Repeated fragments are removed and the text is formatted into readable paragraphs.",
          "tech": [
            "Transcript cleaning"
          ],
          "image_url": null
        },
        {
          "name": "Write",
          "code": "generating_notes",
          "title": "Write the Somali notes",
          "text": "A large language model reads the transcript and writes a summary, key points, detailed notes and key terms in Somali. Long transcripts are handled in sections so nothing is skipped.",
          "tech": [
            "Google Gemini 2.5 Flash-Lite",
            "Gemini 2.5 Flash fallback"
          ],
          "image_url": null
        },
        {
          "name": "Check",
          "code": "lecture analysis",
          "title": "Classify and check quality",
          "text": "The lecture is labelled with its subject area and the notes get a confidence score, which the admin team uses to spot weak results.",
          "tech": [
            "Subject label",
            "Confidence score"
          ],
          "image_url": null
        },
        {
          "name": "Study",
          "code": "quiz · chat · audio",
          "title": "Build your study tools",
          "text": "A quiz is generated from the notes, the lecture chat answers from the transcript, and the notes can be read aloud in a Somali neural voice.",
          "tech": [
            "Quiz generation",
            "Google Gemini chat",
            "Azure Somali voices"
          ],
          "image_url": null
        },
        {
          "name": "Save",
          "code": "saving_results · completed",
          "title": "Saved to your library",
          "text": "Everything is saved to your account, so the lecture, notes, quiz and chat history are there whenever you come back.",
          "tech": [
            "PostgreSQL",
            "FastAPI"
          ],
          "image_url": null
        }
      ],
      "cta_title": "Your next lecture, in Somali notes",
      "cta_text": "Create an account and turn your next recorded lecture into notes, a quiz and a study chat."
    },
    "team": {
      "title": "The team behind BaroPlatform",
      "intro": "BaroPlatform was designed, built and evaluated by four final-year Computer Science students at Hormuud University, under faculty supervision.",
      "members": [
        {
          "name": "Dr. Yusuf Abas Mohamed",
          "role": "Research supervisor",
          "level": "supervisor",
          "bio": "Faculty of Computer Science and Information Technology, Hormuud University. Supervised the research and is corresponding author of the HUMC 2026 paper.",
          "photo_url": "",
          "linkedin": "",
          "github": ""
        },
        {
          "name": "Abdirahim Mohamud Iftin",
          "role": "Researcher and developer",
          "level": "member",
          "bio": "Final-year Bachelor of Computer Science student at Hormuud University and co-author of the BaroPlatform thesis.",
          "photo_url": "",
          "linkedin": "",
          "github": ""
        },
        {
          "name": "Mohamed Abdi Mire",
          "role": "Researcher and developer",
          "level": "member",
          "bio": "Final-year Bachelor of Computer Science student at Hormuud University and co-author of the BaroPlatform thesis.",
          "photo_url": "",
          "linkedin": "",
          "github": ""
        },
        {
          "name": "Faaiza Daahir Dhaqane",
          "role": "Researcher and developer",
          "level": "member",
          "bio": "Final-year Bachelor of Computer Science student at Hormuud University and co-author of the BaroPlatform thesis.",
          "photo_url": "",
          "linkedin": "",
          "github": ""
        },
        {
          "name": "Hafso Hersi Omar",
          "role": "Researcher and developer",
          "level": "member",
          "bio": "Final-year Bachelor of Computer Science student at Hormuud University and co-author of the BaroPlatform thesis.",
          "photo_url": "",
          "linkedin": "",
          "github": ""
        }
      ]
    },
    "research": {
      "pub_label": "Peer-reviewed journal article",
      "pub_title": "Cross-Lingual Lecture Note Generation for a Low-Resource Language: Design and User Evaluation of BaroPlatform AI for Somali-Speaking Students",
      "pub_journal": "International Journal of Artificial Intelligence and Digital Innovation (IJAIDI)",
      "pub_authors": "Abdirahim Mohamud Iftin, Mohamed Abdi Mire, Faaiza Daahir Dhaqane, Hafso Hersi Omar, Yusuf Abas Mohamed",
      "pub_details": "Hormuud University · Vol. 1, No. 1 (2026), pp. 20–34 · Published 30 September 2026 · Open access (CC BY 4.0)",
      "pub_url": "https://www.journals.hu.edu.so/index.php/ijaidi/article/view/30",
      "pub_pdf_url": "https://www.journals.hu.edu.so/index.php/ijaidi/article/download/30/22",
      "pub_cite": "Iftin, A. M., Mire, M. A., Dhaqane, F. D., Omar, H. H., & Mohamed, Y. A. (2026). Cross-Lingual Lecture Note Generation for a Low-Resource Language: Design and User Evaluation of BaroPlatform AI for Somali-Speaking Students. International Journal of Artificial Intelligence and Digital Innovation, 1(1), 20–34. https://www.journals.hu.edu.so/index.php/ijaidi/article/view/30",
      "findings_title": "What the paper found",
      "findings": [
        {
          "title": "Somali notes without Somali-specific training",
          "text": "Prompting a general-purpose multilingual model to write notes directly in Somali produced material students rated as usable (note quality 4.02 out of 5). Every lecture that reached the generation stage produced usable notes."
        },
        {
          "title": "Every student said it saves time",
          "text": "All seven participants strongly agreed that the platform reduced the time needed to prepare study notes (5.00 out of 5, no variation). All seven also said they would use it regularly if it were deployed."
        },
        {
          "title": "Saving time is not the same as fitting daily study",
          "text": "Agreement that the tool is useful for day-to-day university studies was the weakest result (3.71 out of 5, only 57% agreed). The paper treats this as the most important finding to resolve in a follow-up study."
        },
        {
          "title": "A transcription finding for other builders",
          "text": "Google Gemini was rejected for transcription because it returned RECITATION safety blocks on widely distributed educational audio, so transcription and note generation are kept as separate steps."
        }
      ],
      "limitations": "Seven purposively selected participants, six from one institution, cannot represent Somali university students generally\nTime savings and value are self-reported, with no control group and no measured learning outcome\nNo automatic quality metric exists for Somali, so note quality was judged by people\n66.7% end-to-end completion is acceptable for a prototype but not for institutional deployment\nEvery judgement came from a single session, and the cost at scale is unmeasured",
      "future_work": "A controlled study measuring knowledge recall against studying from raw video\nA structured review of the generated Somali by native-speaker raters\nRaising end-to-end reliability well above 66.7%, a media-handling problem rather than a generation problem\nTesting whether the same prompt-level approach works for other low-resource languages",
      "title": "A Unified AI Framework for Somali Lecture Transcription, Translation, and Note Generation",
      "subtitle": "Final-year Bachelor of Computer Science thesis · Hormuud University · 2025–2026",
      "authors": "Abdirahim Mohamud Iftin, Mohamed Abdi Mire, Faaiza Daahir Dhaqane, Hafso Hersi Omar",
      "supervisor": "Dr. Yusuf Abas Mohamed",
      "abstract": "Somali is spoken by an estimated 25 million people yet remains among the least represented languages in speech and language technology. Somali-speaking university students consequently depend on English-medium lecture material while no AI-assisted learning tool produces study material in their language. This paper presents BaroPlatform AI, an end-to-end platform that converts English lecture video into structured Somali study material, and reports its evaluation with university students. The system ingests a YouTube link or an uploaded file, extracts audio with FFmpeg, transcribes it with OpenAI Whisper (whisper-1), and prompts Google Gemini (gemini-2.5-flash-lite, with gemini-2.5-flash as fallback) to generate Somali notes, a summary, key points, quiz items and transcript-grounded chatbot responses; Azure Cognitive Services synthesises Somali speech from the notes. The backend is FastAPI with PostgreSQL; the frontend is Next.js. Gemini was empirically rejected for transcription after it returned RECITATION safety blocks on widely distributed educational audio, an engineering finding reported here in full. Seven students at two Somali universities evaluated the deployed system using a 33-item instrument (Cronbach's α = 0.816). Usability scored 4.57/5, note quality 4.02/5 and educational value 4.45/5; every participant agreed without exception that the platform reduced the time needed to prepare study notes (M = 5.00, SD = 0.00), every participant reported measurable time savings, and every participant indicated they would use the system regularly if deployed. Operational data show that while 66.7% of submitted lectures completed the full pipeline, 100% of lectures that reached the generation stage produced usable Somali notes, locating the reliability constraint in media handling rather than in cross-lingual generation. Among the note-quality items, the naturalness of the generated Somali scored below the construct mean (M = 3.86), consistent with the known limits of general-purpose multilingual models on low-resource languages. We argue that prompt-level cross-lingual generation is a viable interim strategy for languages that lack the annotated corpora required for fine-tuning.",
      "stages": [
        {
          "when": "Stage 1",
          "name": "Problem and objectives",
          "text": "Defined the gap: no tool produces Somali study notes from lecture videos."
        },
        {
          "when": "Stage 2",
          "name": "Literature review",
          "text": "Reviewed speech recognition, LLM note generation, AI in education and Somali digital learning."
        },
        {
          "when": "Stage 3",
          "name": "System design",
          "text": "Designed the processing pipeline, the database, and the student and admin interfaces."
        },
        {
          "when": "Stage 4",
          "name": "Implementation",
          "text": "Built the platform with Next.js, FastAPI and PostgreSQL and deployed it online."
        },
        {
          "when": "Stage 5",
          "name": "Evaluation",
          "text": "Seven Somali-speaking students from two universities answered a 33-item questionnaire on 1 and 2 July 2026."
        },
        {
          "when": "Stage 6",
          "name": "Dissemination",
          "text": "Presented at HUMC 2026 in Mogadishu on 18–19 July 2026 and published in IJAIDI on 30 September 2026."
        }
      ],
      "results": [
        {
          "label": "Time saved",
          "value": "5.00"
        },
        {
          "label": "Usability",
          "value": "4.57"
        },
        {
          "label": "Educational value",
          "value": "4.45"
        },
        {
          "label": "Overall rating",
          "value": "4.29"
        },
        {
          "label": "Note quality",
          "value": "4.02"
        },
        {
          "label": "Somali naturalness",
          "value": "3.86"
        },
        {
          "label": "Useful for day-to-day studies",
          "value": "3.71"
        }
      ],
      "participants": "7",
      "questions": "33",
      "success_rate": "66.7%",
      "avg_time": "2m 43s",
      "paper_venue": "HUMC 2026 · Hormuud University International Hybrid Multidisciplinary Conference",
      "paper_detail": "18–19 July 2026 · Jazeera Palace Hotel, Mogadishu · Theme: Transforming Somalia's Education in the Era of Artificial Intelligence",
      "thesis_url": "",
      "thesis_file": "BaroPlatform-thesis.pdf"
    },
    "state": {
      "title": "Where the research stands",
      "intro": "Speech recognition and large language models now reach hundreds of languages, but Somali remains a low-resource language with little lecture-style training data. This page tracks the published work BaroPlatform builds on.",
      "now_text": "Multilingual speech models such as Whisper and MMS include Somali, and multilingual language models can write Somali text. Published work on turning university lectures into Somali study material is still scarce, and accuracy on long, noisy lecture audio is rarely measured.",
      "contribution": "One pipeline from lecture video to Somali notes, quiz and chat\nUses general-purpose models with no Somali-specific fine-tuning\nA user evaluation with Somali-speaking students, including where the output falls short\nAn admin portal that makes AI processing failures visible",
      "entries": [
        {
          "year": "2023",
          "title": "Robust Speech Recognition via Large-Scale Weak Supervision",
          "authors": "A. Radford, J. W. Kim, T. Xu, G. Brockman, C. McLeavey, I. Sutskever",
          "venue": "ICML 2023",
          "url": "https://arxiv.org/abs/2212.04356",
          "category": "Speech recognition",
          "summary": "Introduces Whisper, a speech recognition model trained on 680,000 hours of multilingual audio that transcribes many languages without task-specific fine-tuning.",
          "relation": "BaroPlatform uses Whisper to transcribe lecture audio."
        },
        {
          "year": "2024",
          "title": "Scaling Speech Technology to 1,000+ Languages",
          "authors": "V. Pratap et al.",
          "venue": "Journal of Machine Learning Research",
          "url": "https://arxiv.org/abs/2305.13516",
          "category": "Speech recognition",
          "summary": "Meta's Massively Multilingual Speech project extends speech recognition and synthesis to more than 1,100 languages.",
          "relation": "Shows how far low-resource language coverage has come, and where accuracy still lags."
        },
        {
          "year": "2022",
          "title": "FLEURS: Few-shot Learning Evaluation of Universal Representations of Speech",
          "authors": "A. Conneau et al.",
          "venue": "IEEE SLT 2022",
          "url": "https://arxiv.org/abs/2205.12446",
          "category": "Speech recognition",
          "summary": "A speech benchmark of read sentences in 102 languages for comparing multilingual models.",
          "relation": "Includes read Somali speech; spontaneous lecture audio remains far less studied."
        },
        {
          "year": "2024",
          "title": "LLMs for Low Resource Languages in Multilingual, Multimodal and Dialectal Settings",
          "authors": "F. Alam, S. A. Chowdhury, S. Boughorbel, M. Hasanain",
          "venue": "EACL 2024 (tutorial)",
          "url": "",
          "category": "Language models",
          "summary": "Surveys how large language models perform, and how they can be adapted, for low-resource and dialectal languages.",
          "relation": "Supports using general-purpose LLMs to write Somali notes."
        },
        {
          "year": "2024",
          "title": "Multistage Fine-tuning Strategies for Automatic Speech Recognition in Low-resource Languages",
          "authors": "L. G. Pillai, K. Manohar, B. K. Raju, E. Sherly",
          "venue": "arXiv:2411.04573",
          "url": "https://arxiv.org/abs/2411.04573",
          "category": "Speech recognition",
          "summary": "Studies staged fine-tuning approaches that improve speech recognition for a low-resource language.",
          "relation": "Points to fine-tuning as the next step for Somali accuracy."
        },
        {
          "year": "1989",
          "title": "Perceived Usefulness, Perceived Ease of Use, and User Acceptance of Information Technology",
          "authors": "F. D. Davis",
          "venue": "MIS Quarterly, 13(3)",
          "url": "",
          "category": "Education",
          "summary": "Defines the Technology Acceptance Model, which explains adoption through perceived usefulness and ease of use.",
          "relation": "The BaroPlatform questionnaire measured both constructs."
        }
      ]
    },
    "docs": {
      "pages": [
        {
          "group": "Getting started",
          "title": "Create your account",
          "body": "Sign up with your email or a Google account. We send a six-digit code to confirm your email address.\n\n1. Open BaroPlatform and choose Get started.\n2. Enter your name, email and a password of at least 8 characters.\n3. Type the code from your email to verify the account.\n\n> Codes expire after 15 minutes. You can request a new one from the notification bell."
        },
        {
          "group": "Getting started",
          "title": "Add your first lecture",
          "body": "You can add a lecture in two ways.\n\n- Paste a public YouTube link.\n- Upload an audio or video file from your device.\n\nChoose New lecture, add the source and a title, then press Start processing. You can follow each stage live, and leave the page while it runs.\n\n## What makes a good source\n\nClear audio matters more than video quality. A lecturer close to the microphone gives the best transcript."
        },
        {
          "group": "Studying",
          "title": "Read your Somali notes",
          "body": "Every finished lecture opens on the Notes tab. It has four parts:\n\n- Soo koobid: a short summary.\n- Qodobbada muhiimka ah: the key points.\n- Faahfaahin: detailed notes by topic.\n- Ereybixin: key terms with Somali explanations.\n\nThe Transcript tab keeps the original text for checking anything in the notes."
        },
        {
          "group": "Studying",
          "title": "Take the quiz",
          "body": "Each lecture has a multiple-choice quiz built from its notes. Pick an answer to see immediately whether it is right, then check your score at the end.\n\n> Quiz results count toward the Quizzes completed number on the home page."
        },
        {
          "group": "Studying",
          "title": "Ask the lecture chat",
          "body": "Open the Chat tab and ask in Somali or English. The assistant answers from that lecture's transcript and remembers the conversation.\n\nTry questions like `Sharax primary key` or `Isku soo koob casharka`."
        },
        {
          "group": "Studying",
          "title": "Listen to your notes",
          "body": "On the Listen tab, choose a voice (Ubax or Muuse) and play the notes aloud. Audio is generated once and saved, so the second play starts instantly."
        },
        {
          "group": "Account",
          "title": "Downloads and privacy",
          "body": "Download any set of notes as a PDF from the Notes tab.\n\nYour lectures, notes and chats are visible only to you. Administrators see processing status to fix failures, and can remove a lecture on request."
        }
      ]
    },
    "releases": {
      "intro": "Release history reconstructed from the platform's database migrations. Version numbers are proposals for the admin to confirm.",
      "entries": [
        {
          "version": "v2.0",
          "date": "Planned",
          "status": "Planned",
          "title": "Redesigned public site, managed from the admin",
          "notes": "New home, about, resources and contact pages\nAll public text, branding and contact settings editable in the admin portal\nTestimonials submitted by users and approved by the admin"
        },
        {
          "version": "v1.3",
          "date": "2026-06-24",
          "status": "Released",
          "title": "Reply to messages by email",
          "notes": "Admins reply to contact messages from the portal\nReplies are emailed to the sender and tracked as replied"
        },
        {
          "version": "v1.2",
          "date": "2026-06-15",
          "status": "Released",
          "title": "Verified accounts",
          "notes": "Email verification with one-time codes\nProfile pictures\nSign-in lockout after repeated failed attempts"
        },
        {
          "version": "v1.1",
          "date": "2026-04-18",
          "status": "Released",
          "title": "Lecture chat and cancel",
          "notes": "Ask questions in a chat that remembers the conversation\nCancel a lecture while it is still processing"
        },
        {
          "version": "v1.0",
          "date": "Before April 2026",
          "status": "Released",
          "title": "First release",
          "notes": "YouTube and upload processing into Somali notes\nStudent dashboard, quizzes and admin monitoring"
        }
      ]
    },
    "signup": {
      "universities": [
        "Hormuud University",
        "SIMAD University",
        "Somali National University",
        "Mogadishu University",
        "Benadir University",
        "City University of Mogadishu",
        "University of Kismayo",
        "Other"
      ],
      "faculties": [
        "Computer Science and IT",
        "Engineering",
        "Medicine and Health Sciences",
        "Economics and Management",
        "Education",
        "Law",
        "Social Sciences",
        "Other"
      ],
      "year_levels": [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
        "Year 5",
        "Postgraduate",
        "Lecturer or staff",
        "Other"
      ]
    },
    "contact": {
      "headline": "Talk to the BaroPlatform team",
      "intro": "Questions about your account, a lecture that did not process, or using BaroPlatform in your classes. Send a message and we reply by email.",
      "contact_name": "BaroPlatform Support",
      "email": "",
      "phone": "",
      "whatsapp": "",
      "hours": "Saturday to Thursday, 8:00 to 17:00 (EAT)",
      "topics": [
        "Account and sign-in",
        "Lecture processing",
        "Notes and quizzes",
        "Using BaroPlatform in class",
        "Something else"
      ]
    }
  },
};

const PUBLIC_API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

/** Uploaded files live on the API host; everything else is in frontend/public or a full URL. */
export function resolveAssetUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/uploads/")) return `${PUBLIC_API}${url}`;
  return url;
}

export const STATE_CATEGORIES = ["Speech recognition", "Language models", "Education", "Somali context"] as const;

/** URL slugs for documentation pages, derived from the titles and made unique. */
export function docSlugs(pages: DocsPage[]): string[] {
  const seen = new Map<string, number>();
  return pages.map((p, i) => {
    const base = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `page-${i + 1}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}

/** Video id from a youtube.com or youtu.be link, or null when the link is not a recognizable YouTube video. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ?? "";
    return /^[\w-]{6,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
