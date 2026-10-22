import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteContentProvider } from "@/components/site/SiteContentProvider";
import { resolveAssetUrl } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-content.server";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Every page renders with the latest saved site content, so routes are dynamic.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { sections } = await getSiteContent();
  const { branding, seo } = sections;
  const icon = resolveAssetUrl(branding.icon_url) ?? "/baro-icon.png";
  const ogImage = resolveAssetUrl(seo.og_image_url);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://baroplatform.garsame.com"),
    title: { default: seo.default_title, template: seo.title_template },
    description: seo.description,
    keywords: seo.keywords,
    applicationName: branding.site_name,
    icons: { icon: [{ url: icon }], shortcut: icon, apple: icon },
    openGraph: {
      title: seo.default_title,
      description: seo.description,
      siteName: branding.site_name,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: seo.default_title,
      description: seo.description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getSiteContent();

  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${inter.variable}`}
      style={
        {
          // Admin-chosen colours; globals.css derives every tint from these two.
          "--brand-raw": content.sections.branding.primary_color,
          "--accent-raw": content.sections.branding.accent_color,
        } as React.CSSProperties
      }
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Display face for headings; falls back to system sans if unavailable. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=block"
        />
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var saved = window.localStorage.getItem("public-theme") || window.localStorage.getItem("theme");
                  var theme = saved === "dark" || saved === "light" ? saved : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                  document.documentElement.dataset.theme = theme;
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <SiteContentProvider value={content}>{children}</SiteContentProvider>
      </body>
    </html>
  );
}
