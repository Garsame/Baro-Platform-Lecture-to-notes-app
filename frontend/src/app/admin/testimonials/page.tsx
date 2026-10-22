"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api";
import type { Testimonial } from "@/lib/site-content";
import "../settings/site-content.css";
import "./testimonials.css";

type Draft = { id?: number; kind: "review" | "figure"; name: string; role: string; text: string; rating: number | null; big: string; source: string; status: Testimonial["status"] };
const EMPTY: Draft = { kind: "review", name: "", role: "", text: "", rating: 5, big: "", source: "Student questionnaire", status: "approved" };
const FILTERS = ["all", "pending", "approved", "hidden"] as const;

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/v1/admin/site/testimonials"), { headers: authHeaders(), cache: "no-store" });
      if (!res.ok) throw new Error("Could not load testimonials.");
      setItems(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load testimonials.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const body = (t: Draft) => ({
    kind: t.kind,
    name: t.name,
    role: t.role,
    text: t.text,
    rating: t.kind === "review" ? t.rating : null,
    big: t.kind === "figure" ? t.big || null : null,
    source: t.source || null,
    status: t.status,
  });

  async function call(url: string, init: RequestInit, ok: string) {
    setError(null);
    const res = await fetch(apiUrl(url), { ...init, headers: authHeaders({ "Content-Type": "application/json" }) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const first = Array.isArray(data.detail) ? data.detail[0]?.msg : data.detail;
      setError(typeof first === "string" ? first : "That did not work. Check the fields and try again.");
      return false;
    }
    setMessage(ok);
    await load();
    return true;
  }

  async function save() {
    if (!draft) return;
    const done = draft.id
      ? await call(`/api/v1/admin/site/testimonials/${draft.id}`, { method: "PUT", body: JSON.stringify(body(draft)) }, "Saved. Changes are live.")
      : await call("/api/v1/admin/site/testimonials", { method: "POST", body: JSON.stringify(body(draft)) }, "Added.");
    if (done) setDraft(null);
  }

  const setStatus = (t: Testimonial, status: Testimonial["status"]) =>
    call(`/api/v1/admin/site/testimonials/${t.id}`, {
      method: "PUT",
      body: JSON.stringify(body({ ...t, big: t.big ?? "", source: t.source ?? "", status })),
    }, status === "approved" ? "Approved and published." : status === "hidden" ? "Hidden from the site." : "Moved back to pending.");

  async function move(t: Testimonial, dir: number) {
    const order = items.map((i) => i.id);
    const i = order.indexOf(t.id);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    await call("/api/v1/admin/site/testimonials/reorder", { method: "POST", body: JSON.stringify({ ids: order }) }, "Order saved.");
  }

  async function remove(t: Testimonial) {
    if (!window.confirm(`Delete the testimonial from ${t.name}? This cannot be undone.`)) return;
    await call(`/api/v1/admin/site/testimonials/${t.id}`, { method: "DELETE" }, "Deleted.");
  }

  const shown = items.filter((t) => filter === "all" || t.status === filter);
  const count = (s: string) => items.filter((t) => t.status === s).length;

  return (
    <div className="sc-hub">
      <h1>Testimonials</h1>
      <p className="sc-lede">Reviews from students and results from the questionnaire. Approved items appear on the home page, in the order shown here.</p>
      <div className="tm-toolbar">
        <div className="sc-toggle" style={{ display: "flex" }} role="tablist">
          {FILTERS.map((f) => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>
              {f[0].toUpperCase() + f.slice(1)}{f !== "all" ? ` (${count(f)})` : ` (${items.length})`}
            </button>
          ))}
        </div>
        <button type="button" className="sc-btn primary" onClick={() => setDraft({ ...EMPTY })}>Add from questionnaire</button>
      </div>
      {message && <div className="sc-message" role="status">{message}</div>}
      {error && <div className="sc-message" role="alert">{error}</div>}
      {shown.length === 0 && <p className="sc-help">Nothing here yet.</p>}
      <div className="tm-list">
        {shown.map((t) => (
          <article key={t.id} className="sc-card tm-item">
            <div className="sc-card-head">
              <strong>{t.name}</strong>
              <span className="tm-tags">
                <span className="sc-badge">{t.kind === "figure" ? "Result" : "Review"}</span>
                <span className="sc-badge">{t.origin === "user" ? "Written by user" : "Added by admin"}</span>
                <span className={`sc-badge ${t.status === "approved" ? "custom" : ""}`}>{t.status}</span>
              </span>
            </div>
            {t.kind === "figure" && <div className="tm-big">{t.big}</div>}
            <p>{t.text}</p>
            <small>{[t.role, t.rating ? `${t.rating}/5` : null, t.source].filter(Boolean).join(" · ")}</small>
            <div className="tm-actions">
              {t.status !== "approved" && <button type="button" className="sc-btn small primary" onClick={() => setStatus(t, "approved")}>Approve</button>}
              {t.status !== "hidden" && <button type="button" className="sc-btn small" onClick={() => setStatus(t, "hidden")}>Hide</button>}
              {t.status === "hidden" && <button type="button" className="sc-btn small" onClick={() => setStatus(t, "pending")}>Back to pending</button>}
              <button type="button" className="sc-btn small" onClick={() => setDraft({ id: t.id, kind: t.kind, name: t.name, role: t.role, text: t.text, rating: t.rating, big: t.big ?? "", source: t.source ?? "", status: t.status })}>Edit</button>
              <button type="button" className="sc-btn small" onClick={() => move(t, -1)} aria-label="Move up">↑</button>
              <button type="button" className="sc-btn small" onClick={() => move(t, 1)} aria-label="Move down">↓</button>
              <button type="button" className="sc-btn small" onClick={() => remove(t)}>Delete</button>
            </div>
          </article>
        ))}
      </div>

      {draft && (
        <div className="sc-modal" role="dialog" aria-modal="true" aria-label="Testimonial" onClick={(e) => { if (e.target === e.currentTarget) setDraft(null); }}>
          <div className="sc-modal-card tm-form">
            <div className="sc-modal-head"><strong>{draft.id ? "Edit testimonial" : "Add from questionnaire"}</strong><button type="button" className="sc-btn small" onClick={() => setDraft(null)}>Close</button></div>
            <label className="sc-field">Type
              <select className="sc-input" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as Draft["kind"] })}>
                <option value="review">Review (quote with stars)</option>
                <option value="figure">Result (big number)</option>
              </select>
            </label>
            <label className="sc-field">Name or group<input className="sc-input" value={draft.name} maxLength={120} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
            <label className="sc-field">Role, course or caption<input className="sc-input" value={draft.role} maxLength={120} onChange={(e) => setDraft({ ...draft, role: e.target.value })} /></label>
            <label className="sc-field">Text<textarea className="sc-input" rows={4} value={draft.text} maxLength={500} onChange={(e) => setDraft({ ...draft, text: e.target.value })} /></label>
            {draft.kind === "review" ? (
              <label className="sc-field">Rating
                <select className="sc-input" value={draft.rating ?? 5} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} out of 5</option>)}
                </select>
              </label>
            ) : (
              <label className="sc-field">Big number<input className="sc-input" value={draft.big} maxLength={40} placeholder="For example 87%" onChange={(e) => setDraft({ ...draft, big: e.target.value })} /></label>
            )}
            <label className="sc-field">Source label<input className="sc-input" value={draft.source} maxLength={100} onChange={(e) => setDraft({ ...draft, source: e.target.value })} /></label>
            <label className="sc-field">Status
              <select className="sc-input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Draft["status"] })}>
                <option value="approved">Approved (shown)</option>
                <option value="pending">Pending</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
            <div className="sc-top-actions" style={{ marginLeft: 0 }}>
              <button type="button" className="sc-btn" onClick={() => setDraft(null)}>Cancel</button>
              <button type="button" className="sc-btn primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
