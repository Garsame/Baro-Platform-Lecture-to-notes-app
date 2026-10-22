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
