"use client";

import type { SeoSettings } from "@/lib/site-content";
import { resolveAssetUrl } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { ImageField, TagsField, TextArea, TextField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

const DOMAIN = "baroplatform.garsame.com";

export default function SeoEditor() {
  const ed = useSectionEditor<SeoSettings>("seo");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;
  const titleLong = d.default_title.length > 60;
  const descOff = d.description.length < 120 || d.description.length > 160;

  const form = (
    <>
      <TextField label="Default title" value={d.default_title} max={70} error={e.default_title} help={titleLong ? "Over 60 characters: search engines may cut it off." : undefined} onChange={(v) => ed.setField("default_title", v)} />
      <TextField label="Title template" value={d.title_template} max={70} error={e.title_template} help="%s is replaced by the page name." onChange={(v) => ed.setField("title_template", v)} />
      <TextArea label="Description" value={d.description} max={160} error={e.description} help={descOff ? "Aim for 120 to 160 characters." : undefined} onChange={(v) => ed.setField("description", v)} />
      <TagsField label="Keywords" value={d.keywords} max={15} error={e.keywords} onChange={(v) => ed.setField("keywords", v)} />
      <ImageField label="Social share image" kind="image" value={d.og_image_url ?? ""} error={e.og_image_url} help="Shown when the site is shared. 1200×630 works best." onChange={(v) => ed.setField("og_image_url", v || null)} />
    </>
  );

  const og = resolveAssetUrl(d.og_image_url);
  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-serp">
        <div className="sc-serp-title">{d.default_title}</div>
        <div className="sc-serp-url">{DOMAIN}</div>
        <div className="sc-serp-desc">{d.description.slice(0, 160)}</div>
      </div>
      <div className="sc-share">
        <div className="sc-share-img">{og && <img src={og} alt="" />}</div>
        <div className="sc-share-body"><small>{DOMAIN}</small><strong>{d.default_title}</strong><span>{d.description}</span></div>
      </div>
      <div className="sc-counters">
        <span className={`sc-count ${titleLong ? "warn" : ""}`}>Title {d.default_title.length}/60</span>
        <span className={`sc-count ${descOff ? "warn" : ""}`}>Description {d.description.length} (120–160)</span>
      </div>
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
