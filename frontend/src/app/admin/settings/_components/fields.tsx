"use client";

import { useEffect, useId, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/site-content";

type BaseProps = { label: string; help?: string; error?: string };

function FieldFrame({ id, label, help, error, count, children }: BaseProps & { id: string; count?: { n: number; max: number }; children: React.ReactNode }) {
  return (
    <div className="sc-field">
      <label htmlFor={id}>{label}</label>
      {children}
      <div className="sc-field-foot">
        <span id={`${id}-desc`} className={error ? "sc-error" : "sc-help"}>{error ?? help}</span>
        {count && <span className={`sc-count ${count.n > count.max ? "over" : ""}`}>{count.n}/{count.max}</span>}
      </div>
    </div>
  );
}

export function TextField({ label, help, error, value, max, onChange }: BaseProps & { value: string; max: number; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} help={help} error={error} count={{ n: value.length, max }}>
      <input id={id} className={`sc-input ${error ? "invalid" : ""}`} value={value} aria-describedby={`${id}-desc`} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)} />
    </FieldFrame>
  );
}

export function TextArea({ label, help, error, value, max, rows = 3, onChange }: BaseProps & { value: string; max: number; rows?: number; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} help={help} error={error} count={{ n: value.length, max }}>
      <textarea id={id} rows={rows} className={`sc-input ${error ? "invalid" : ""}`} value={value} aria-describedby={`${id}-desc`} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)} />
    </FieldFrame>
  );
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(hexA: string, hexB: string): number {
  const [a, b] = [luminance(hexA), luminance(hexB)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const DARK_BG = "#0b0e1c";

export function ColorField({ label, help, error, value, onChange }: BaseProps & { value: string; onChange: (v: string) => void }) {
  const id = useId();
  const valid = HEX.test(value);
  const onWhite = valid ? contrast(value, "#ffffff") : 0;
  const onDark = valid ? contrast(value, DARK_BG) : 0;
  const badge = (name: string, ratio: number) => (
    <span className={`sc-contrast ${ratio < 4.5 ? "warn" : ""}`}>{name} {ratio.toFixed(1)}:1{ratio < 4.5 ? " (low)" : ""}</span>
  );
  return (
    <FieldFrame id={id} label={label} help={help} error={error}>
      <div className="sc-color-row">
        <input type="color" aria-label={`${label} picker`} value={valid ? value : "#000000"} onChange={(e) => onChange(e.target.value)} />
        <input id={id} className={`sc-input ${error ? "invalid" : ""}`} value={value} aria-describedby={`${id}-desc`} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)} />
      </div>
      {valid && <div className="sc-contrast-row">{badge("On white", onWhite)}{badge("On dark", onDark)}</div>}
    </FieldFrame>
  );
}

type Asset = { id: number; kind: string; url: string; original_name: string };

export function ImageField({ label, help, error, value, kind, onChange }: BaseProps & { value: string; kind: "image" | "icon"; onChange: (v: string) => void }) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const src = resolveAssetUrl(value) ?? "";

  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    try {
      const res = await fetch(apiUrl("/api/v1/admin/site/assets"), { method: "POST", headers: authHeaders(), body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.detail === "string" ? body.detail : "Upload failed.");
      }
      onChange(((await res.json()) as Asset).url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (!libraryOpen) return;
    fetch(apiUrl(`/api/v1/admin/site/assets?kind=${kind}`), { headers: authHeaders(), cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setAssets)
      .catch(() => setAssets([]));
  }, [libraryOpen, kind]);

  return (
    <FieldFrame id={id} label={label} help={help} error={error ?? uploadError ?? undefined}>
      <div className="sc-image-tiles">
        <div className="sc-tile light">{src && <img src={src} alt="" />}</div>
        <div className="sc-tile dark">{src && <img src={src} alt="" />}</div>
      </div>
      <div className="sc-image-actions">
        <label className="sc-btn small">
          {uploading ? "Uploading…" : "Upload"}
          <input type="file" hidden disabled={uploading} accept={kind === "icon" ? ".ico,.png" : ".png,.jpg,.jpeg,.webp"} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        </label>
        <button type="button" className="sc-btn small" onClick={() => setLibraryOpen(true)}>Choose from library</button>
        <button type="button" className="sc-btn small" onClick={() => onChange("")} disabled={!value}>Remove</button>
      </div>
      <input id={id} className="sc-input" placeholder="Or paste a link: /file.png or https://…" value={value} aria-describedby={`${id}-desc`} onChange={(e) => onChange(e.target.value)} />
      {libraryOpen && (
        <div className="sc-modal" role="dialog" aria-modal="true" aria-label="Choose from library" onClick={(e) => { if (e.target === e.currentTarget) setLibraryOpen(false); }}>
          <div className="sc-modal-card">
            <div className="sc-modal-head"><strong>Library</strong><button type="button" className="sc-btn small" onClick={() => setLibraryOpen(false)}>Close</button></div>
            {assets.length === 0 ? <p className="sc-help">No uploads yet.</p> : (
              <div className="sc-library">
                {assets.map((a) => (
                  <button type="button" key={a.id} className="sc-library-item" onClick={() => { onChange(a.url); setLibraryOpen(false); }}>
                    <img src={resolveAssetUrl(a.url) ?? ""} alt="" /><span>{a.original_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </FieldFrame>
  );
}

export function TagsField({ label, help, error, value, max, onChange }: BaseProps & { value: string[]; max: number; onChange: (v: string[]) => void }) {
  const id = useId();
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (t && !value.includes(t) && value.length < max) onChange([...value, t]);
    setText("");
  };
  return (
    <FieldFrame id={id} label={label} help={help} error={error} count={{ n: value.length, max }}>
      <div className="sc-tags">
        {value.map((t) => (
          <span key={t} className="sc-tag">{t}<button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}>×</button></span>
        ))}
        <input id={id} className="sc-tags-input" value={text} placeholder="Type and press Enter" aria-describedby={`${id}-desc`} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} onBlur={add} />
      </div>
    </FieldFrame>
  );
}

export function UrlField({ label, help, error, value, onChange }: BaseProps & { value: string; onChange: (v: string) => void }) {
  return <TextField label={label} help={help ?? "Full https:// link. Leave empty to hide it."} error={error} value={value} max={300} onChange={onChange} />;
}

export type LinkItem = { label: string; description: string; href: string; icon: string; enabled: boolean };

export function LinkListField({ label, fieldKey, help, errors, value, max, onChange }: { label: string; fieldKey: string; help?: string; errors: Record<string, string>; value: LinkItem[]; max: number; onChange: (v: LinkItem[]) => void }) {
  const update = (i: number, patch: Partial<LinkItem>) => onChange(value.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <fieldset className="sc-list">
      <legend>{label}</legend>
      {help && <p className="sc-help">{help}</p>}
      {value.map((l, i) => {
        const err = (f: string) => errors[`${fieldKey}.${i}.${f}`];
        return (
          <div className="sc-list-item" key={i}>
            <div className="sc-list-row">
              <TextField label="Label" value={l.label} max={40} error={err("label")} onChange={(v) => update(i, { label: v })} />
              <TextField label="Icon name" help="A Google Material Symbols name, such as menu_book." value={l.icon} max={40} error={err("icon")} onChange={(v) => update(i, { icon: v })} />
            </div>
            <TextField label="Description" value={l.description} max={80} error={err("description")} onChange={(v) => update(i, { description: v })} />
            <TextField label="Link" help="A path such as /about, or a full https:// link." value={l.href} max={300} error={err("href")} onChange={(v) => update(i, { href: v })} />
            <div className="sc-list-actions">
              <label className="sc-switch"><input type="checkbox" checked={l.enabled} onChange={(e) => update(i, { enabled: e.target.checked })} /> Show in menus</label>
              <span>
                <button type="button" className="sc-btn small" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>{" "}
                <button type="button" className="sc-btn small" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">↓</button>{" "}
                <button type="button" className="sc-btn small" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>Remove</button>
              </span>
            </div>
          </div>
        );
      })}
      <button type="button" className="sc-btn small" disabled={value.length >= max} onClick={() => onChange([...value, { label: "New link", description: "", href: "/", icon: "link", enabled: true }])}>Add link</button>
    </fieldset>
  );
}

export function ToggleField({ label, help, value, onChange }: { label: string; help?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="sc-field">
      <label className="sc-switch"><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}</label>
      {help && <span className="sc-help">{help}</span>}
    </div>
  );
}

type ListShellProps<T> = { label: string; help?: string; items: T[]; max: number; onChange: (v: T[]) => void; renderItem: (item: T, i: number, update: (patch: Partial<T>) => void) => React.ReactNode; newItem: T; addLabel: string };

function ObjectList<T>({ label, help, items, max, onChange, renderItem, newItem, addLabel }: ListShellProps<T>) {
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <fieldset className="sc-list">
      <legend>{label}</legend>
      {help && <p className="sc-help">{help}</p>}
      {items.map((item, i) => (
        <div className="sc-list-item" key={i}>
          {renderItem(item, i, (patch) => onChange(items.map((x, idx) => (idx === i ? { ...x, ...patch } : x))))}
          <div className="sc-list-actions">
            <span className="sc-help">#{i + 1}</span>
            <span>
              <button type="button" className="sc-btn small" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>{" "}
              <button type="button" className="sc-btn small" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>{" "}
              <button type="button" className="sc-btn small" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>Remove</button>
            </span>
          </div>
        </div>
      ))}
      <button type="button" className="sc-btn small" disabled={items.length >= max} onClick={() => onChange([...items, newItem])}>{addLabel}</button>
    </fieldset>
  );
}

export type JourneyItem = { tab: string; label: string; title: string; icon: string; link_label: string; href: string };

export function JourneyCardsField({ fieldKey, errors, value, onChange }: { fieldKey: string; errors: Record<string, string>; value: JourneyItem[]; onChange: (v: JourneyItem[]) => void }) {
  return (
    <ObjectList
      label="How it works cards"
      help="Cards with the same tab name are grouped under one button. Up to three cards per tab look best."
      items={value}
      max={15}
      onChange={onChange}
      addLabel="Add card"
      newItem={{ tab: "By step", label: "New card", title: "Describe what this does in one line.", icon: "school", link_label: "Learn more", href: "/about" }}
      renderItem={(c, i, up) => {
        const err = (f: string) => errors[`${fieldKey}.${i}.${f}`];
        return (
          <>
            <div className="sc-list-row">
              <TextField label="Tab" value={c.tab} max={24} error={err("tab")} onChange={(v) => up({ tab: v })} />
              <TextField label="Small label" value={c.label} max={32} error={err("label")} onChange={(v) => up({ label: v })} />
            </div>
            <TextArea label="One-line description" value={c.title} max={90} rows={2} error={err("title")} onChange={(v) => up({ title: v })} />
            <div className="sc-list-row">
              <TextField label="Icon name" help="A Google Material Symbols name." value={c.icon} max={40} error={err("icon")} onChange={(v) => up({ icon: v })} />
              <TextField label="Link text" value={c.link_label} max={30} error={err("link_label")} onChange={(v) => up({ link_label: v })} />
            </div>
            <TextField label="Link" help="A path such as /about, or a full https:// link." value={c.href} max={300} error={err("href")} onChange={(v) => up({ href: v })} />
          </>
        );
      }}
    />
  );
}

export type FaqEntry = { q: string; a: string };

export function FaqListField({ fieldKey, errors, value, onChange }: { fieldKey: string; errors: Record<string, string>; value: FaqEntry[]; onChange: (v: FaqEntry[]) => void }) {
  return (
    <ObjectList
      label="Questions and answers"
      items={value}
      max={12}
      onChange={onChange}
      addLabel="Add question"
      newItem={{ q: "New question", a: "Write the answer here." }}
      renderItem={(f, i, up) => (
        <>
          <TextField label="Question" value={f.q} max={120} error={errors[`${fieldKey}.${i}.q`]} onChange={(v) => up({ q: v })} />
          <TextArea label="Answer" value={f.a} max={600} rows={4} error={errors[`${fieldKey}.${i}.a`]} onChange={(v) => up({ a: v })} />
        </>
      )}
    />
  );
}

export type StageEntry = { name: string; code: string; title: string; text: string; tech: string[]; image_url: string | null };

export function StageListField({ fieldKey, errors, value, onChange }: { fieldKey: string; errors: Record<string, string>; value: StageEntry[]; onChange: (v: StageEntry[]) => void }) {
  return (
    <ObjectList
      label="Pipeline stages"
      help="Each stage is shown as its own section, in this order. Add a screenshot to replace the built-in illustration."
      items={value}
      max={12}
      onChange={onChange}
      addLabel="Add stage"
      newItem={{ name: "New", code: "", title: "New stage", text: "Describe what happens in this stage.", tech: [], image_url: null }}
      renderItem={(st, i, up) => {
        const err = (f: string) => errors[`${fieldKey}.${i}.${f}`];
        return (
          <>
            <div className="sc-list-row">
              <TextField label="Short name" value={st.name} max={14} error={err("name")} onChange={(v) => up({ name: v })} />
              <TextField label="System stage name" help="Matches the job stage shown to admins. Separate several with ·" value={st.code} max={60} error={err("code")} onChange={(v) => up({ code: v })} />
            </div>
            <TextField label="Title" value={st.title} max={50} error={err("title")} onChange={(v) => up({ title: v })} />
            <TextArea label="Description" value={st.text} max={320} rows={3} error={err("text")} onChange={(v) => up({ text: v })} />
            <TagsField label="Technology" value={st.tech} max={6} error={err("tech")} onChange={(v) => up({ tech: v })} />
            <ImageField label="Screenshot (optional)" kind="image" value={st.image_url ?? ""} error={err("image_url")} onChange={(v) => up({ image_url: v || null })} />
          </>
        );
      }}
    />
  );
}

export type MemberEntry = { name: string; role: string; level: "supervisor" | "lead" | "member"; bio: string; photo_url: string; linkedin: string; github: string };

export function MemberListField({ fieldKey, errors, value, onChange }: { fieldKey: string; errors: Record<string, string>; value: MemberEntry[]; onChange: (v: MemberEntry[]) => void }) {
  return (
    <ObjectList
      label="People"
      help="Supervisors are shown first in a larger card; members follow in this order."
      items={value}
      max={12}
      onChange={onChange}
      addLabel="Add person"
      newItem={{ name: "New person", role: "Researcher and developer", level: "member", bio: "", photo_url: "", linkedin: "", github: "" }}
      renderItem={(m, i, up) => {
        const err = (f: string) => errors[`${fieldKey}.${i}.${f}`];
        return (
          <>
            <div className="sc-list-row">
              <TextField label="Name" value={m.name} max={60} error={err("name")} onChange={(v) => up({ name: v })} />
              <TextField label="Role" value={m.role} max={80} error={err("role")} onChange={(v) => up({ role: v })} />
            </div>
            <label className="sc-field">Level
              <select className="sc-input" value={m.level} onChange={(e) => up({ level: e.target.value as MemberEntry["level"] })}>
                <option value="member">Member</option>
                <option value="lead">Lead</option>
                <option value="supervisor">Supervisor (featured)</option>
              </select>
            </label>
            <TextArea label="Short bio" value={m.bio} max={300} rows={3} error={err("bio")} onChange={(v) => up({ bio: v })} />
            <ImageField label="Photo" kind="image" value={m.photo_url} error={err("photo_url")} help="Square photos look best. Without one, initials are shown." onChange={(v) => up({ photo_url: v })} />
            <TextField label="LinkedIn link" help="Full https:// link, or leave empty." value={m.linkedin} max={300} error={err("linkedin")} onChange={(v) => up({ linkedin: v })} />
            <TextField label="GitHub link" help="Full https:// link, or leave empty." value={m.github} max={300} error={err("github")} onChange={(v) => up({ github: v })} />
          </>
        );
      }}
    />
  );
}

export function FileField({ label, help, error, value, kind = "document", accept = ".pdf,application/pdf", noun = "PDF", attachedHelp, emptyHelp, onChange }: BaseProps & { value: string; kind?: "document" | "video"; accept?: string; noun?: string; attachedHelp?: string; emptyHelp?: string; onChange: (v: string) => void }) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    try {
      const res = await fetch(apiUrl("/api/v1/admin/site/assets"), { method: "POST", headers: authHeaders(), body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.detail === "string" ? body.detail : "Upload failed.");
      }
      onChange(((await res.json()) as Asset).url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <FieldFrame id={id} label={label} help={help} error={error ?? uploadError ?? undefined}>
      <div className="sc-image-actions">
        <label className="sc-btn small">
          {uploading ? "Uploading…" : value ? `Replace ${noun}` : `Upload ${noun}`}
          <input id={id} type="file" hidden disabled={uploading} accept={accept} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        </label>
        {value && <a className="sc-btn small" href={resolveAssetUrl(value) ?? "#"} target="_blank" rel="noopener noreferrer">View current file</a>}
        {value && <button type="button" className="sc-btn small" onClick={() => onChange("")}>Remove</button>}
      </div>
      <span className="sc-help">{value ? attachedHelp ?? "A file is attached. The Download button shows on the Research page." : emptyHelp ?? "No file attached. The Download button is hidden until you upload one."}</span>
    </FieldFrame>
  );
}

export type StageRow = { when: string; name: string; text: string };

export function ResearchStagesField({ errors, value, onChange }: { errors: Record<string, string>; value: StageRow[]; onChange: (v: StageRow[]) => void }) {
  return (
    <ObjectList
      label="Research stages"
      items={value}
      max={10}
      onChange={onChange}
      addLabel="Add stage"
      newItem={{ when: "", name: "New stage", text: "" }}
      renderItem={(st, i, up) => (
        <>
          <div className="sc-list-row">
            <TextField label="When" value={st.when} max={30} error={errors[`stages.${i}.when`]} onChange={(v) => up({ when: v })} />
            <TextField label="Name" value={st.name} max={50} error={errors[`stages.${i}.name`]} onChange={(v) => up({ name: v })} />
          </div>
          <TextArea label="Description" value={st.text} max={200} rows={2} error={errors[`stages.${i}.text`]} onChange={(v) => up({ text: v })} />
        </>
      )}
    />
  );
}

export type ResultRow = { label: string; value: string };

export function ResearchResultsField({ errors, value, onChange }: { errors: Record<string, string>; value: ResultRow[]; onChange: (v: ResultRow[]) => void }) {
  return (
    <ObjectList
      label="Evaluation results (out of 5)"
      help="The lowest score is highlighted on the page as the main area for future work."
      items={value}
      max={10}
      onChange={onChange}
      addLabel="Add result"
      newItem={{ label: "New measure", value: "4.00" }}
      renderItem={(r, i, up) => (
        <div className="sc-list-row">
          <TextField label="Measure" value={r.label} max={40} error={errors[`results.${i}.label`]} onChange={(v) => up({ label: v })} />
          <TextField label="Score" value={r.value} max={5} error={errors[`results.${i}.value`]} onChange={(v) => up({ value: v })} />
        </div>
      )}
    />
  );
}

function SelectBox({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="sc-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="sc-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

export type StateRow = { year: string; title: string; authors: string; venue: string; url: string; category: string; summary: string; relation: string };

export function StateEntriesField({ errors, value, categories, onChange }: { errors: Record<string, string>; value: StateRow[]; categories: string[]; onChange: (v: StateRow[]) => void }) {
  return (
    <ObjectList
      label="Published work"
      help="Shown newest first. Each entry can link to the paper."
      items={value}
      max={40}
      onChange={onChange}
      addLabel="Add entry"
      newItem={{ year: String(new Date().getFullYear()), title: "New entry", authors: "", venue: "", url: "", category: categories[0], summary: "", relation: "" }}
      renderItem={(en, i, up) => {
        const err = (f: string) => errors[`entries.${i}.${f}`];
        return (
          <>
            <TextField label="Title" value={en.title} max={200} error={err("title")} onChange={(v) => up({ title: v })} />
            <TextField label="Authors" value={en.authors} max={200} error={err("authors")} onChange={(v) => up({ authors: v })} />
            <div className="sc-list-row">
              <TextField label="Year" value={en.year} max={4} error={err("year")} onChange={(v) => up({ year: v })} />
              <TextField label="Venue" value={en.venue} max={120} error={err("venue")} onChange={(v) => up({ venue: v })} />
            </div>
            <TextField label="Link" help="Full https:// link, or leave empty." value={en.url} max={300} error={err("url")} onChange={(v) => up({ url: v })} />
            <SelectBox label="Category" value={en.category} options={categories} onChange={(v) => up({ category: v })} />
            <TextArea label="Summary" value={en.summary} max={400} rows={3} error={err("summary")} onChange={(v) => up({ summary: v })} />
            <TextArea label="How it relates to BaroPlatform" value={en.relation} max={240} rows={2} error={err("relation")} onChange={(v) => up({ relation: v })} />
          </>
        );
      }}
    />
  );
}

export type DocRow = { group: string; title: string; body: string };

export function DocsPagesField({ errors, value, onChange }: { errors: Record<string, string>; value: DocRow[]; onChange: (v: DocRow[]) => void }) {
  return (
    <ObjectList
      label="Pages"
      help="Pages appear in this order, grouped by sidebar group. The web address comes from the title."
      items={value}
      max={30}
      onChange={onChange}
      addLabel="Add page"
      newItem={{ group: "Getting started", title: "New page", body: "" }}
      renderItem={(pg, i, up) => (
        <>
          <div className="sc-list-row">
            <TextField label="Sidebar group" value={pg.group} max={40} error={errors[`pages.${i}.group`]} onChange={(v) => up({ group: v })} />
            <TextField label="Title" value={pg.title} max={60} error={errors[`pages.${i}.title`]} onChange={(v) => up({ title: v })} />
          </div>
          <TextArea label="Content" value={pg.body} max={3000} rows={8} error={errors[`pages.${i}.body`]} help="Blank line between paragraphs. Start lines with - for bullets, 1. for steps, > for a callout, ## for a heading." onChange={(v) => up({ body: v })} />
        </>
      )}
    />
  );
}

export type ReleaseRow = { version: string; date: string; status: "Released" | "Planned"; title: string; notes: string };

export function ReleasesField({ errors, value, onChange }: { errors: Record<string, string>; value: ReleaseRow[]; onChange: (v: ReleaseRow[]) => void }) {
  return (
    <ObjectList
      label="Releases (newest first)"
      items={value}
      max={40}
      onChange={onChange}
      addLabel="Add release"
      newItem={{ version: "v0.0", date: "", status: "Released", title: "New release", notes: "" }}
      renderItem={(r, i, up) => {
        const err = (f: string) => errors[`entries.${i}.${f}`];
        return (
          <>
            <div className="sc-list-row">
              <TextField label="Version" value={r.version} max={12} error={err("version")} onChange={(v) => up({ version: v })} />
              <TextField label="Date" value={r.date} max={20} error={err("date")} onChange={(v) => up({ date: v })} />
            </div>
            <SelectBox label="Status" value={r.status} options={["Released", "Planned"]} onChange={(v) => up({ status: v as ReleaseRow["status"] })} />
            <TextField label="Title" value={r.title} max={80} error={err("title")} onChange={(v) => up({ title: v })} />
            <TextArea label="Notes (one per line)" value={r.notes} max={800} rows={4} error={err("notes")} onChange={(v) => up({ notes: v })} />
          </>
        );
      }}
    />
  );
}

export type FindingRow = { title: string; text: string };

export function FindingsField({ errors, value, onChange }: { errors: Record<string, string>; value: FindingRow[]; onChange: (v: FindingRow[]) => void }) {
  return (
    <ObjectList
      label="Findings"
      items={value}
      max={8}
      onChange={onChange}
      addLabel="Add finding"
      newItem={{ title: "New finding", text: "" }}
      renderItem={(f, i, up) => (
        <>
          <TextField label="Title" value={f.title} max={80} error={errors[`findings.${i}.title`]} onChange={(v) => up({ title: v })} />
          <TextArea label="Text" value={f.text} max={400} rows={3} error={errors[`findings.${i}.text`]} onChange={(v) => up({ text: v })} />
        </>
      )}
    />
  );
}

export type HighlightRow = { value: string; label: string };

export function HighlightsField({ errors, value, onChange }: { errors: Record<string, string>; value: HighlightRow[]; onChange: (v: HighlightRow[]) => void }) {
  return (
    <ObjectList
      label="Headline results"
      help="Up to four tiles shown next to the paper on the carousel slide."
      items={value}
      max={4}
      onChange={onChange}
      addLabel="Add result"
      newItem={{ value: "0", label: "New result" }}
      renderItem={(h, i, up) => (
        <div className="sc-list-row">
          <TextField label="Number" value={h.value} max={20} error={errors[`pub_highlights.${i}.value`]} onChange={(v) => up({ value: v })} />
          <TextField label="Label" value={h.label} max={50} error={errors[`pub_highlights.${i}.label`]} onChange={(v) => up({ label: v })} />
        </div>
      )}
    />
  );
}

export type MilestoneRow = { date: string; title: string; text: string; highlight: boolean };

export function MilestonesField({ errors, value, onChange }: { errors: Record<string, string>; value: MilestoneRow[]; onChange: (v: MilestoneRow[]) => void }) {
  return (
    <ObjectList
      label="Milestones"
      help="Shown in this order. A highlighted milestone gets the large dark card."
      items={value}
      max={10}
      onChange={onChange}
      addLabel="Add milestone"
      newItem={{ date: "", title: "New milestone", text: "", highlight: false }}
      renderItem={(m, i, up) => (
        <>
          <div className="sc-list-row">
            <TextField label="Date" help="For example 18 Jun 2026" value={m.date} max={30} error={errors[`milestones.${i}.date`]} onChange={(v) => up({ date: v })} />
            <TextField label="Title" value={m.title} max={60} error={errors[`milestones.${i}.title`]} onChange={(v) => up({ title: v })} />
          </div>
          <TextArea label="Description" value={m.text} max={180} rows={2} error={errors[`milestones.${i}.text`]} onChange={(v) => up({ text: v })} />
          <ToggleField label="Highlight this milestone" value={m.highlight} onChange={(v) => up({ highlight: v })} />
        </>
      )}
    />
  );
}
