"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api";
import "./site-content.css";

type SectionInfo = { key: string; label: string; is_default: boolean; updated_at: string | null };

const ACTIVE: Record<string, string> = {
  branding: "Logos, favicon, colours, site name and tagline.",
  seo: "Page title, description, keywords and the social share image.",
  navigation: "Header dropdowns, header button, footer text and social links.",
  about: "The project story and every pipeline stage, start to finish.",
  team: "Writers and supervisor shown on the About page: photos, roles, bios, links and order.",
  state: "Published work, where the field stands, and BaroPlatform's contribution.",
  docs: "Help pages for students, grouped in the sidebar.",
  releases: "Version history shown on the Releases page.",
  research: "Abstract, research stages, evaluation results, paper and thesis file.",
  signup: "University, faculty and year choices on the sign-up form and Profile page.",
  contact: "Contact page text, details and form topics.",
  email: "Team inbox and the confirmation email sent to every sender. Not shown publicly.",
  home: "Hero, live numbers, how-it-works cards, sample notes, testimonials and FAQ.",
};

export default function SiteContentHubPage() {
  const [sections, setSections] = useState<SectionInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/v1/admin/site/sections"), { headers: authHeaders(), cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Could not load site content.");
        return r.json();
      })
      .then(setSections)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load site content."));
  }, []);

  return (
    <div className="sc-hub">
      <h1>Site Content</h1>
      <p className="sc-lede">Everything visitors see on the public site. Edit a section, check the preview, then save to publish it.</p>
      {error && <div className="sc-message" role="alert">{error}</div>}
      <div className="sc-grid">
        {(sections ?? []).map((s) => (
          <Link key={s.key} href={`/admin/settings/${s.key}`} className="sc-card">
            <div className="sc-card-head"><strong>{s.label}</strong><span className={`sc-badge ${s.is_default ? "" : "custom"}`}>{s.is_default ? "Default" : "Customized"}</span></div>
            <p>{ACTIVE[s.key]}</p>
            <small>{s.updated_at ? `Updated ${new Date(s.updated_at).toLocaleString()}` : "Not changed yet"}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
