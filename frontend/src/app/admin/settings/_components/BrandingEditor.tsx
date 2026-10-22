"use client";

import type { BrandingSettings } from "@/lib/site-content";
import { resolveAssetUrl } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { ColorField, ImageField, TextArea, TextField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

export default function BrandingEditor() {
  const ed = useSectionEditor<BrandingSettings>("branding");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;

  const form = (
    <>
      <TextField label="Site name" value={d.site_name} max={40} error={e.site_name} onChange={(v) => ed.setField("site_name", v)} />
      <TextArea label="Tagline" value={d.tagline} max={160} error={e.tagline} help="Shown in the footer." onChange={(v) => ed.setField("tagline", v)} />
      <TextField label="Footer note" value={d.footer_note} max={120} error={e.footer_note} onChange={(v) => ed.setField("footer_note", v)} />
      <ImageField label="Light logo" kind="image" value={d.logo_light_url} error={e.logo_light_url} help="Used on light backgrounds." onChange={(v) => ed.setField("logo_light_url", v)} />
      <ImageField label="Dark logo" kind="image" value={d.logo_dark_url} error={e.logo_dark_url} help="Used on dark backgrounds." onChange={(v) => ed.setField("logo_dark_url", v)} />
      <ImageField label="Favicon" kind="icon" value={d.icon_url} error={e.icon_url} help="Square .png or .ico, shown in the browser tab." onChange={(v) => ed.setField("icon_url", v)} />
      <ColorField label="Primary colour" value={d.primary_color} error={e.primary_color} onChange={(v) => ed.setField("primary_color", v)} />
      <ColorField label="Accent colour" value={d.accent_color} error={e.accent_color} onChange={(v) => ed.setField("accent_color", v)} />
      <p className="sc-help">Colours are applied to the whole site in Phase 2.</p>
    </>
  );

  const light = resolveAssetUrl(d.logo_light_url) ?? "";
  const dark = resolveAssetUrl(d.logo_dark_url) ?? "";
  const icon = resolveAssetUrl(d.icon_url) ?? "";
  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-mock-tab">{icon && <img src={icon} alt="" />}<span>{d.site_name}</span></div>
      <div className="sc-mock-header light"><img src={light} alt="" /><span className="sc-mock-btn" style={{ background: d.primary_color }}>Get started</span></div>
      <div className="sc-mock-header dark"><img src={dark} alt="" /><span className="sc-mock-btn" style={{ background: d.primary_color }}>Get started</span></div>
      <div className="sc-mock-footer"><span>{d.tagline}</span><small>© {new Date().getFullYear()} {d.site_name}. All rights reserved. {d.footer_note}</small></div>
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
