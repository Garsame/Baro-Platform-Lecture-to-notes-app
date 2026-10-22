import { cache } from "react";
import { DEFAULT_SITE_CONTENT, type PublicStats, type SiteContent, type Testimonial } from "./site-content";

const SERVER_API =
  process.env.API_INTERNAL_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  try {
    const res = await fetch(`${SERVER_API}/api/v1/site/content`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Partial<SiteContent>;
    return {
      updated_at: data.updated_at ?? null,
      sections: {
        branding: { ...DEFAULT_SITE_CONTENT.sections.branding, ...data.sections?.branding },
        seo: { ...DEFAULT_SITE_CONTENT.sections.seo, ...data.sections?.seo },
        navigation: { ...DEFAULT_SITE_CONTENT.sections.navigation, ...data.sections?.navigation },
        home: { ...DEFAULT_SITE_CONTENT.sections.home, ...data.sections?.home },
        about: { ...DEFAULT_SITE_CONTENT.sections.about, ...data.sections?.about },
        team: { ...DEFAULT_SITE_CONTENT.sections.team, ...data.sections?.team },
      },
    };
  } catch (error) {
    console.error("Site content unavailable, using defaults:", error);
    return DEFAULT_SITE_CONTENT;
  }
});

export const getPublicStats = cache(async (): Promise<PublicStats | null> => {
  try {
    const res = await fetch(`${SERVER_API}/api/v1/site/stats`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as PublicStats) : null;
  } catch {
    return null;
  }
});

export const getApprovedTestimonials = cache(async (): Promise<Testimonial[]> => {
  try {
    const res = await fetch(`${SERVER_API}/api/v1/site/testimonials`, { cache: "no-store" });
    return res.ok ? ((await res.json()) as Testimonial[]) : [];
  } catch {
    return [];
  }
});
