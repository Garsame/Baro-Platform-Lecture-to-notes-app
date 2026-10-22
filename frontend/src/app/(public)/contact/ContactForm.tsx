"use client";

import { useState } from "react";
import MaterialIcon from "@/components/site/MaterialIcon";
import { apiUrl } from "@/lib/api";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export default function ContactForm({ topics }: { topics: string[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(topics[0] ?? "");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter an email address like name@example.com.";
    if (message.trim().length < 10) next.message = "Write at least 10 characters so the team can help.";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/v1/contact/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, topic: topic || "General", message }),
      });
      if (res.status === 422) throw new Error("Please check your details and try again.");
      if (!res.ok) throw new Error("We could not send your message. Please try again in a moment.");
      setSent({ name: name.trim(), email: email.trim() });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="success" role="status">
        <span className="tick"><MaterialIcon name="check" size={28} /></span>
        <h2>Message received</h2>
        <p className="muted">Thanks, {sent.name}. The team replies by email to {sent.email}.</p>
        <button type="button" className="public-btn public-btn-ghost" onClick={() => setSent(null)}>Send another message</button>
      </div>
    );
  }

  const field = (id: string, label: string, control: React.ReactNode, err?: string) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {control}
      {err && <span className="err">{err}</span>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="contact-form">
      <div>
        <h2>Send a message</h2>
        <p className="muted sub">Every field except phone is required.</p>
      </div>
      {formError && <div className="contact-error" role="alert">{formError}</div>}
      <div className="form-row">
        {field("ct-name", "Full name", <input id="ct-name" className={errors.name ? "invalid" : ""} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} />, errors.name)}
        {field("ct-email", "Email", <input id="ct-email" type="email" className={errors.email ? "invalid" : ""} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />, errors.email)}
      </div>
      <div className="form-row">
        {field("ct-phone", "Phone or WhatsApp (optional)", <input id="ct-phone" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" maxLength={40} />)}
        {field("ct-topic", "Topic", topics.length > 0 ? (
          <select id="ct-topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {topics.map((t) => <option key={t}>{t}</option>)}
          </select>
        ) : (
          <input id="ct-topic" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={120} />
        ))}
      </div>
      {field("ct-msg", "Message", <textarea id="ct-msg" className={errors.message ? "invalid" : ""} rows={6} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} />, errors.message)}
      <button type="submit" className="public-btn public-btn-primary" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
        {!busy && <MaterialIcon name="arrow_forward" size={18} />}
      </button>
    </form>
  );
}
