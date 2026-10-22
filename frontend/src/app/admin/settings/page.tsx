"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api";
import "./site-content.css";

type SectionInfo = { key: string; label: string; is_default: boolean; updated_at: string | null };

const ACTIVE: Record<string, string> = {
  branding: "Logos, favicon, colours, site name and tagline.",
  seo: "Page title, description, keywords and the social share image.",
};

const UPCOMING = [
  { label: "Navigation and footer", phase: 2 },
  { label: "Home page", phase: 3 },
  { label: "About page", phase: 4 },
  { label: "Team on the About page", phase: 4 },
  { label: "Contact page and email", phase: 5 },
  { label: "Research and findings", phase: 6 },
  { label: "State of research", phase: 7 },
  { label: "Documentation and releases", phase: 7 },
];

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
        {UPCOMING.map((u) => (
          <div key={u.label} className="sc-card disabled" aria-disabled="true">
            <div className="sc-card-head"><strong>{u.label}</strong><span className="sc-badge">Phase {u.phase}</span></div>
            <p>Added in Phase {u.phase}.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
