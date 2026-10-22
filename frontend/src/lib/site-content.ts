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

export type SiteContent = {
  updated_at: string | null;
  sections: { branding: BrandingSettings; seo: SeoSettings; navigation: NavigationSettings };
};

// Must match BRANDING_DEFAULT, SEO_DEFAULT and NAVIGATION_DEFAULT in the backend registry.
export const DEFAULT_SITE_CONTENT: SiteContent = {
  updated_at: null,
  sections: {
    branding: {
      site_name: "BaroPlatform",
      tagline:
        "Somali-first AI study tools that turn recorded lectures into notes, summaries, quizzes and review material.",
      logo_light_url: "/barobadi-logo.png",
      logo_dark_url: "/barobadi-logo-dark.png",
      icon_url: "/baro-icon.png",
      primary_color: "#2a2a72",
      accent_color: "#009ffd",
      footer_note: "Built for focused lecture revision.",
    },
    seo: {
      default_title: "BaroPlatform | Turn lectures into Somali study notes",
      title_template: "%s | BaroPlatform",
      description:
        "BaroPlatform turns lecture videos into Somali study notes, summaries, quizzes and a lecture chatbot, built at Hormuud University.",
      keywords: ["Somali lecture notes", "Somali AI", "lecture transcription", "study notes", "Hormuud University"],
      og_image_url: "/public-hero-somali-notes.png",
    },
    navigation: {
      about_tagline: "How BaroPlatform turns one lecture into a full study pack.",
      resources_tagline: "Everything about the platform and the research behind it.",
      about_links: [
        { label: "How it works", description: "The stages from video to notes", href: "/about", icon: "account_tree", enabled: true },
        { label: "Team", description: "The writers and supervisor behind BaroPlatform", href: "/about#team", icon: "groups", enabled: false },
        { label: "Intro video", description: "Watch one lecture become a study pack", href: "/#intro-video", icon: "play_circle", enabled: false },
      ],
      resources_links: [
        { label: "Documentation", description: "How to use every feature", href: "/resources/docs", icon: "menu_book", enabled: false },
        { label: "Releases", description: "What changed and what is next", href: "/resources/releases", icon: "new_releases", enabled: false },
        { label: "Research and findings", description: "Abstract, stages and results", href: "/resources/research", icon: "science", enabled: false },
        { label: "State of research", description: "Published work and our contribution", href: "/resources/state-of-research", icon: "travel_explore", enabled: false },
      ],
      cta_label: "Get started",
      footer_tagline_a: "Learn it",
      footer_tagline_b: "in Somali.",
      footer_about:
        "BaroPlatform turns recorded lectures into Somali notes, quizzes and a study chat, so students spend their time learning instead of transcribing.",
      social_facebook: "",
      social_x: "",
      social_linkedin: "",
      social_github: "",
      social_youtube: "",
    },
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
