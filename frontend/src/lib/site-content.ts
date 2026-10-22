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

export type SiteContent = {
  updated_at: string | null;
  sections: { branding: BrandingSettings; seo: SeoSettings };
};

// Must match BRANDING_DEFAULT and SEO_DEFAULT in the backend registry.
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
