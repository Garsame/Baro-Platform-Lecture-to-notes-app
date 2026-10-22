import type { MetadataRoute } from "next";
import { docSlugs } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-content.server";

export const dynamic = "force-dynamic";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://baroplatform.garsame.com").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ["", "/about", "/contact", "/resources", "/resources/research", "/resources/state-of-research", "/resources/docs", "/resources/releases"];
  try {
    const pages = (await getSiteContent()).sections.docs.pages;
    docSlugs(pages).forEach((s) => paths.push(`/resources/docs/${s}`));
  } catch {
    // The static pages are still listed if the content service is unreachable.
  }
  return paths.map((p) => ({ url: `${SITE}${p}`, changeFrequency: p === "" ? "weekly" : "monthly", priority: p === "" ? 1 : 0.7 }));
}
