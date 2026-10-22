"use client";

import type { NavigationSettings } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { LinkListField, TextArea, TextField, UrlField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

export default function NavigationEditor() {
  const ed = useSectionEditor<NavigationSettings>("navigation");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;
  const set = ed.setField;

  const form = (
    <>
      <TextField label="Header button label" value={d.cta_label} max={24} error={e.cta_label} onChange={(v) => set("cta_label", v)} />
      <TextField label="About dropdown tagline" value={d.about_tagline} max={90} error={e.about_tagline} onChange={(v) => set("about_tagline", v)} />
      <LinkListField fieldKey="about_links" label="About dropdown links" help="Links to pages that are not built yet are switched off until they are." errors={e} value={d.about_links} max={8} onChange={(v) => set("about_links", v)} />
      <TextField label="Resources dropdown tagline" value={d.resources_tagline} max={90} error={e.resources_tagline} onChange={(v) => set("resources_tagline", v)} />
      <LinkListField fieldKey="resources_links" label="Resources dropdown links" help="The Resources menu appears once at least one link is shown." errors={e} value={d.resources_links} max={8} onChange={(v) => set("resources_links", v)} />
      <TextField label="Footer headline, first part" value={d.footer_tagline_a} max={24} error={e.footer_tagline_a} onChange={(v) => set("footer_tagline_a", v)} />
      <TextField label="Footer headline, accent part" value={d.footer_tagline_b} max={24} error={e.footer_tagline_b} onChange={(v) => set("footer_tagline_b", v)} />
      <TextArea label="Footer description" value={d.footer_about} max={220} error={e.footer_about} onChange={(v) => set("footer_about", v)} />
      <UrlField label="Facebook link" value={d.social_facebook} error={e.social_facebook} onChange={(v) => set("social_facebook", v)} />
      <UrlField label="X link" value={d.social_x} error={e.social_x} onChange={(v) => set("social_x", v)} />
      <UrlField label="LinkedIn link" value={d.social_linkedin} error={e.social_linkedin} onChange={(v) => set("social_linkedin", v)} />
      <UrlField label="GitHub link" value={d.social_github} error={e.social_github} onChange={(v) => set("social_github", v)} />
      <UrlField label="YouTube link" value={d.social_youtube} error={e.social_youtube} onChange={(v) => set("social_youtube", v)} />
    </>
  );

  const aboutLinks = d.about_links.filter((l) => l.enabled);
  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-nav-mock">
        <div className="sc-nav-mock-bar">
          <strong>Home</strong><span>About ▾</span>{d.resources_links.some((l) => l.enabled) && <span>Resources ▾</span>}<span>Contact</span>
          <span className="cta">{d.cta_label}</span>
        </div>
        <div className="sc-nav-mock-panel">
          <div><strong>{d.about_tagline}</strong></div>
          <div>{aboutLinks.map((l) => <div key={l.label}><strong>{l.label}</strong><br /><span className="sc-help">{l.description}</span></div>)}</div>
        </div>
      </div>
      <div className="sc-nav-mock sc-footer-mock">
        <div className="big">{d.footer_tagline_a} <span>{d.footer_tagline_b}</span></div>
        <span className="sc-help">{d.footer_about}</span>
      </div>
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
