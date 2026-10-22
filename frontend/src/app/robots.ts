import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://baroplatform.garsame.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/maamul-login", "/maamul-signup", "/sign-in", "/sign-up", "/google-chooser"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
