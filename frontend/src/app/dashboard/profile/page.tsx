"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import MaterialIcon from "@/components/site/MaterialIcon";
import { useSiteContent } from "@/components/site/SiteContentProvider";
import { apiUrl, authHeaders, fetchCurrentUser, type AuthenticatedUser } from "@/lib/api";
import { clearSession } from "@/lib/session";

type Errors = Record<string, string>;

const PHONE_RE = /^\+?[0-9 ]{7,16}$/;

function resolveAvatar(url: string | null | undefined): string | null {
  if (!url || url.includes("next.svg")) return null;
  return /^https?:\/\//i.test(url) ? url : apiUrl(url);
}

async function call(path: string, method: string, body?: unknown): Promise<{ ok: boolean; data: any; message: string }> { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const res = await fetch(apiUrl(path), {
      method,
      headers: { ...authHeaders(), ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    const detail = data?.detail;
    const message = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((d: { msg?: string }) => d.msg).join(" ") : "Something went wrong. Try again.";
    return { ok: res.ok, data, message };
  } catch {
    return { ok: false, data: null, message: "We could not reach the server. Check your connection and try again." };
  }
}

export default function UserProfilePage() {
  const { signup } = useSiteContent().sections;
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", university: "", faculty: "", programme: "", year: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [toast, setToast] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", again: "" });
  const photoRef = useRef<HTMLInputElement>(null);

  const say = useCallback((text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 3200);
  }, []);

  const apply = useCallback((u: AuthenticatedUser) => {
    setUser(u);
    setForm({
      name: u.full_name || "",
      phone: u.phone || "",
      email: u.pending_email || u.email || "",
      university: u.university || "",
      faculty: u.faculty || "",
      programme: u.programme || "",
      year: u.year_of_study || "",
    });
    window.dispatchEvent(new CustomEvent("user-profile-updated", { detail: u }));
  }, []);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      setUser(u);
      setForm({
        name: u.full_name || "", phone: u.phone || "", email: u.pending_email || u.email || "",
        university: u.university || "", faculty: u.faculty || "", programme: u.programme || "", year: u.year_of_study || "",
      });
    }).catch(() => undefined);
  }, []);

  if (!user) return <p style={{ color: "var(--muted)" }}>Loading your profile…</p>;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isAdminLike = user.role === "admin";
  const avatarUrl = resolveAvatar(user.profile_picture_url);
  const emailChanged = form.email.trim().toLowerCase() !== (user.pending_email || user.email).toLowerCase();

  const field = (key: string, label: string, control: React.ReactNode, help?: string) => (
    <div className="sa-field">
      <label htmlFor={`pf-${key}`}>{label}</label>
      {control}
      {help && <span className="sa-help">{help}</span>}
      {errors[key] && <span className="sa-err" role="alert">{errors[key]}</span>}
    </div>
  );
  const input = (key: keyof typeof form, type = "text") => (
    <input id={`pf-${key}`} className={`sa-input${errors[key] ? " invalid" : ""}`} type={type} value={form[key]} onChange={(e) => set(key, e.target.value)} />
  );
  const select = (key: keyof typeof form, options: string[]) => (
    <select id={`pf-${key}`} className={`sa-select${errors[key] ? " invalid" : ""}`} value={form[key]} onChange={(e) => set(key, e.target.value)}>
      {form[key] && !options.includes(form[key]) && <option>{form[key]}</option>}
      {!form[key] && <option value="">Choose…</option>}
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (form.name.trim().split(/\s+/).filter(Boolean).length < 2) er.name = "Enter your first and last name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = "Enter an email address like name@example.com.";
    if (form.phone && !PHONE_RE.test(form.phone.trim())) er.phone = "Enter a phone number like +252 61 234 5678, or leave it empty.";
    if (!isAdminLike && form.programme.trim().length < 2) er.programme = "Enter your programme.";
    setErrors(er);
    if (Object.keys(er).length) return;

    setBusy("details");
    const res = await call("/api/v1/auth/me/profile", "PUT", {
      full_name: form.name.trim(),
      phone: form.phone.trim(),
      ...(isAdminLike ? {} : { university: form.university, faculty: form.faculty, programme: form.programme.trim(), year: form.year }),
    });
    if (!res.ok) { setBusy(""); setErrors({ name: res.message }); return; }
    let latest = res.data as AuthenticatedUser;

    if (emailChanged) {
      const ch = await call("/api/v1/auth/me/email/change", "POST", { new_email: form.email.trim() });
      if (!ch.ok) { setBusy(""); apply(latest); setErrors({ email: ch.message }); return; }
      latest = { ...latest, pending_email: form.email.trim().toLowerCase() };
      say(`Details saved. Check ${form.email.trim()} for a code to confirm the new email.`);
    } else {
      say("Profile saved.");
    }
    setBusy("");
    apply(latest);
  };

  const confirmEmail = async () => {
    if (!/^\d{6}$/.test(code.trim())) { setErrors({ code: "Enter the 6-digit code from the email." }); return; }
    setBusy("code");
    const res = await call("/api/v1/auth/me/email/confirm", "POST", { code: code.trim() });
    setBusy("");
    if (!res.ok) { setErrors({ code: res.message }); return; }
    setErrors({}); setCode("");
    apply(res.data as AuthenticatedUser);
    say("New email verified.");
  };

  const resendCode = async () => {
    if (!user.pending_email) return;
    const res = await call("/api/v1/auth/me/email/change", "POST", { new_email: user.pending_email });
    if (!res.ok) { setErrors({ code: res.message }); return; }
    setErrors({});
    say("A new code is on its way.");
  };

  const cancelEmail = async () => {
    const res = await call("/api/v1/auth/me/email/cancel", "POST");
    if (res.ok) { setErrors({}); setCode(""); apply(res.data as AuthenticatedUser); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (user.has_password && !pw.current) er.current = "Enter your current password.";
    if (pw.next.length < 8 || !(/[a-z]/i.test(pw.next) && /\d/.test(pw.next))) er.newpw = "Use at least 8 characters with a letter and a number.";
    if (pw.again !== pw.next) er.again = "The passwords do not match.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy("password");
    const res = await call("/api/v1/auth/me/password", "POST", { current_password: pw.current || null, new_password: pw.next });
    setBusy("");
    if (!res.ok) { setErrors({ current: res.message }); return; }
    setPw({ current: "", next: "", again: "" });
    apply({ ...user, has_password: true });
    say("Password updated.");
  };

  const uploadPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { say("Use a PNG, JPG or WebP image."); return; }
    if (file.size > 5 * 1024 * 1024) { say("Photos can be up to 5 MB."); return; }
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch(apiUrl("/api/v1/auth/me/avatar"), { method: "POST", headers: authHeaders(), body });
      if (!res.ok) throw new Error();
      apply((await res.json()) as AuthenticatedUser);
      say("Photo updated.");
    } catch {
      say("The photo could not be uploaded. Try a smaller image.");
    }
  };

  const removePhoto = async () => {
    const res = await call("/api/v1/auth/me/avatar", "DELETE");
    if (res.ok) { apply(res.data as AuthenticatedUser); say("Photo removed."); }
  };

  const member = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "";

  return (
    <div className="sa-page">
      <div className="sa-greet">
        <h1>Profile</h1>
        <p>Your details, study information and password.</p>
      </div>

      <div className="sa-panel sa-head">
        <span className="sa-avatar xl">{avatarUrl ? <img src={avatarUrl} alt="" /> : (user.full_name || "U").trim().charAt(0).toUpperCase()}</span>
        <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
          <h2>{user.full_name}</h2>
          <span style={{ color: "var(--muted)", overflowWrap: "anywhere" }}>{user.email}</span>
          <span className="sa-chips">
            {user.is_email_verified
              ? <span className="sa-chip good"><MaterialIcon name="verified" />Email verified</span>
              : <span className="sa-chip warn">Email not verified</span>}
            {member && <span className="sa-chip">Member since {member}</span>}
          </span>
          <span className="sa-btn-row" style={{ marginTop: 4 }}>
            <button type="button" className="sa-btn sm" onClick={() => photoRef.current?.click()}><MaterialIcon name="photo_camera" />Change photo</button>
            <input ref={photoRef} className="sa-sr" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Upload a profile photo" onChange={(e) => { uploadPhoto(e.target.files?.[0]); e.target.value = ""; }} />
            {avatarUrl && <button type="button" className="sa-btn sm" onClick={removePhoto}>Remove</button>}
          </span>
        </div>
      </div>

      <form className="sa-panel" onSubmit={saveDetails} noValidate>
        <h2><MaterialIcon name="badge" />Personal details</h2>
        <div className="sa-form-row">
          {field("name", "Full name", input("name"))}
          {field("phone", "Phone or WhatsApp", input("phone", "tel"), "Optional")}
        </div>
        {field("email", "Email address", input("email", "email"), "Changing your email sends a code to the new address. The old one stays active until you verify it.")}

        {user.pending_email && (
          <>
            <div className="sa-notice warn">
              <MaterialIcon name="mark_email_unread" />
              <span>We sent a 6-digit code to <b>{user.pending_email}</b>. Enter it to confirm the new address.</span>
            </div>
            <div className="sa-otp">
              <input className={`sa-input${errors.code ? " invalid" : ""}`} inputMode="numeric" maxLength={6} placeholder="000000" aria-label="Verification code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
              <button type="button" className="sa-btn primary sm" disabled={busy === "code"} onClick={confirmEmail}>Verify</button>
              <button type="button" className="sa-btn sm" onClick={resendCode}>Resend code</button>
              <button type="button" className="sa-btn sm" onClick={cancelEmail}>Cancel change</button>
            </div>
            {errors.code && <span className="sa-err" role="alert">{errors.code}</span>}
          </>
        )}

        {!isAdminLike && (
          <>
            <h2 style={{ marginTop: 8 }}><MaterialIcon name="school" />Study details</h2>
            <div className="sa-form-row">
              {field("university", "University", select("university", signup.universities))}
              {field("faculty", "Faculty", select("faculty", signup.faculties))}
            </div>
            <div className="sa-form-row">
              {field("programme", "Programme", input("programme"))}
              {field("year", "Year of study", select("year", signup.year_levels))}
            </div>
          </>
        )}
        <div><button type="submit" className="sa-btn primary" disabled={busy === "details"}>Save changes</button></div>
      </form>

      <form className="sa-panel" onSubmit={changePassword} noValidate>
        <h2><MaterialIcon name="lock" />Password</h2>
        {!user.has_password && <div className="sa-notice"><MaterialIcon name="key" /><span>You signed in with Google, so you have no password yet. Set one to also sign in with your email.</span></div>}
        {user.has_password && field("current", "Current password", <input id="pf-current" className={`sa-input${errors.current ? " invalid" : ""}`} type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />)}
        {!user.has_password && errors.current && <span className="sa-err" role="alert">{errors.current}</span>}
        <div className="sa-form-row">
          {field("newpw", "New password", <input id="pf-newpw" className={`sa-input${errors.newpw ? " invalid" : ""}`} type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />, "At least 8 characters with a letter and a number.")}
          {field("again", "Confirm new password", <input id="pf-again" className={`sa-input${errors.again ? " invalid" : ""}`} type="password" autoComplete="new-password" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} />)}
        </div>
        <div><button type="submit" className="sa-btn" disabled={busy === "password"}>{user.has_password ? "Update password" : "Set password"}</button></div>
      </form>

      <div className="sa-panel">
        <h2><MaterialIcon name="logout" />Session</h2>
        <p style={{ color: "var(--muted)", margin: 0 }}>Sign out of this device.</p>
        <div><button type="button" className="sa-btn" onClick={() => { clearSession(); window.location.replace("/sign-in"); }}>Sign out</button></div>
      </div>

      {toast && <div className="sa-toast" role="status">{toast}</div>}
    </div>
  );
}
