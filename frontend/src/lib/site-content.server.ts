import { cache } from "react";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "./site-content";

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
      },
    };
  } catch (error) {
    console.error("Site content unavailable, using defaults:", error);
    return DEFAULT_SITE_CONTENT;
  }
});
