"use client";

import { useState } from "react";
import MaterialIcon from "@/components/site/MaterialIcon";
import { apiUrl } from "@/lib/api";

export default function ContactForm({ topics }: { topics: string[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(topics[0] ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/v1/contact/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, topic, message }),
      });
      if (res.status === 422) throw new Error("Please check your details. The message needs at least 10 characters.");
      if (!res.ok) throw new Error("We could not send your message. Please try again in a moment.");
      setSentTo(email);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <div className="contact-sent" role="status">
        <span className="contact-sent-icon"><MaterialIcon name="mark_email_read" size={30} /></span>
        <h2>Message sent</h2>
        <p>Thank you. A confirmation is on its way to <b>{sentTo}</b>, and the team will reply by email.</p>
        <button type="button" className="public-btn public-btn-ghost" onClick={() => setSentTo(null)}>Send another message</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <h2>Send a message</h2>
      {error && <div className="contact-error" role="alert">{error}</div>}
      <label>Full name
        <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={120} autoComplete="name" />
      </label>
      <label>Email address
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </label>
      <label>Topic
        {topics.length > 0 ? (
          <select value={topic} onChange={(e) => setTopic(e.target.value)} required>
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        ) : (
          <input value={topic} onChange={(e) => setTopic(e.target.value)} required minLength={2} maxLength={120} />
        )}
      </label>
      <label>Message
        <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required minLength={10} maxLength={2000} />
        <small>{message.length}/2000</small>
      </label>
      <button type="submit" className="public-btn public-btn-primary" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
        {!busy && <MaterialIcon name="arrow_forward" size={18} />}
      </button>
    </form>
  );
}
