"use client";

import Link from "next/link";
import { useState } from "react";
import { apiUrl, authHeaders, getErrorMessage } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

export default function ReviewForm() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const openDialog = () => {
    setSignedIn(!!getSessionToken());
    setDone(false);
    setError(null);
    setOpen(true);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/v1/site/testimonials"), {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ text, rating, role }),
      });
      if (res.status === 422) throw new Error("Please write at least 20 characters.");
      if (!res.ok) throw new Error(await getErrorMessage(res, "Could not send your review. Try again."));
      setDone(true);
      setText("");
      setRole("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="public-btn public-btn-ghost" onClick={openDialog}>Write a review</button>
      {open && (
        <div className="review-modal" role="dialog" aria-modal="true" aria-label="Write a review" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="review-card">
            {!signedIn ? (
              <>
                <h3>Sign in to write a review</h3>
                <p className="home-muted">Reviews come from people who use BaroPlatform.</p>
                <div className="review-actions">
                  <Link href="/sign-in" className="public-btn public-btn-primary">Sign in</Link>
                  <button type="button" className="public-btn public-btn-ghost" onClick={() => setOpen(false)}>Close</button>
                </div>
              </>
            ) : done ? (
              <>
                <h3>Thank you</h3>
                <p className="home-muted">Your review will appear on the home page after the team approves it.</p>
                <div className="review-actions"><button type="button" className="public-btn public-btn-primary" onClick={() => setOpen(false)}>Close</button></div>
              </>
            ) : (
              <form onSubmit={submit}>
                <h3>Write a review</h3>
                <label className="review-field">Your rating
                  <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} out of 5</option>)}
                  </select>
                </label>
                <label className="review-field">Your review
                  <textarea rows={4} value={text} maxLength={500} required minLength={20} onChange={(e) => setText(e.target.value)} />
                  <small>{text.length}/500</small>
                </label>
                <label className="review-field">Course or year (optional)
                  <input value={role} maxLength={80} onChange={(e) => setRole(e.target.value)} />
                </label>
                {error && <p className="review-error" role="alert">{error}</p>}
                <div className="review-actions">
                  <button type="submit" className="public-btn public-btn-primary" disabled={busy}>{busy ? "Sending…" : "Send review"}</button>
                  <button type="button" className="public-btn public-btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
