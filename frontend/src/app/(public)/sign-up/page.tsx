"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaGoogle } from "react-icons/fa6";
import MaterialIcon from "@/components/site/MaterialIcon";
import BrandLogo from "@/components/site/BrandLogo";
import { useSiteContent } from "@/components/site/SiteContentProvider";
import { apiUrl } from "@/lib/api";
import { docSlugs } from "@/lib/site-content";
import { persistSession } from "@/lib/session";
import { useGoogleCredential } from "@/lib/useGoogleCredential";
import "./signup.css";

type Data = {
  name: string; email: string; password: string; confirm: string;
  university: string; faculty: string; year: string; programme: string; phone: string; terms: boolean;
};
type Errors = Partial<Record<keyof Data | "code" | "form", string>>;
type Timing = { resend_after: number; expires_in: number };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9 ]{7,16}$/;

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return typeof body.detail === "string" ? body.detail : fallback;
  } catch {
    return fallback;
  }
}

function PasswordRules({ value }: { value: string }) {
  const long = value.length >= 8;
  const mixed = /[a-z]/i.test(value) && /\d/.test(value);
  const rule = (ok: boolean, text: string) => (
    <li className={ok ? "ok" : ""}><MaterialIcon name={ok ? "check_circle" : "radio_button_unchecked"} size={16} />{text}</li>
  );
  return <ul className="pw-rules" aria-label="Password rules">{rule(long, "At least 8 characters")}{rule(mixed, "A letter and a number")}</ul>;
}

export default function SignUpPage() {
  const { signup, docs } = useSiteContent().sections;
  const privacySlug = useMemo(() => docSlugs(docs.pages).find((s) => s === "downloads-and-privacy"), [docs.pages]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [google, setGoogle] = useState<{ token: string } | null>(null);
  const [d, setD] = useState<Data>({
    name: "", email: "", password: "", confirm: "",
    university: signup.universities[0] ?? "", faculty: signup.faculties[0] ?? "", year: signup.year_levels[0] ?? "",
    programme: "", phone: "", terms: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const set = <K extends keyof Data>(key: K, value: Data[K]) => {
    setD((cur) => ({ ...cur, [key]: value }));
    setErrors((cur) => (cur[key] ? { ...cur, [key]: undefined } : cur));
  };

  // Countdown for the resend button.
  useEffect(() => {
    if (step !== 3 || resendAt <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [step, resendAt]);

  useEffect(() => {
    if (step === 3) otpRefs.current[0]?.focus();
  }, [step]);

  const wait = Math.max(0, Math.ceil((resendAt - now) / 1000));

  const onGoogleToken = useCallback(async (token: string) => {
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch(apiUrl("/api/v1/auth/google/verify"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      if (!res.ok) throw new Error(await readError(res, "Google sign-up failed. Try again."));
      const info = (await res.json()) as { email: string; name: string; registered: boolean };
      if (info.registered) {
        // Already has an account: sign in instead of asking for studies again.
        const login = await fetch(apiUrl("/api/v1/auth/google-login"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
        if (!login.ok) throw new Error(await readError(login, "Google sign-in failed."));
        persistSession(((await login.json()) as { access_token: string }).access_token);
        window.location.href = "/dashboard";
        return;
      }
      setGoogle({ token });
      setD((cur) => ({ ...cur, name: info.name, email: info.email }));
      setStep(2);
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : "Google sign-up failed." });
    } finally {
      setBusy(false);
    }
  }, []);
  const { slotRef, hasClientId, openPopup } = useGoogleCredential(onGoogleToken);

  function submitAccount(e: React.FormEvent) {
    e.preventDefault();
    const er: Errors = {};
    if (d.name.trim().split(/\s+/).filter(Boolean).length < 2) er.name = "Enter your first and last name.";
    if (!EMAIL_RE.test(d.email.trim())) er.email = "Enter an email address like name@example.com.";
    if (d.password.length < 8 || !(/[a-z]/i.test(d.password) && /\d/.test(d.password))) er.password = "Use at least 8 characters with a letter and a number.";
    if (d.confirm !== d.password) er.confirm = "The passwords do not match.";
    setErrors(er);
    if (!Object.keys(er).length) setStep(2);
  }

  function checkStudies(): boolean {
    const er: Errors = {};
    if (d.programme.trim().length < 2) er.programme = "Enter your programme, for example Bachelor of Computer Science.";
    if (d.phone && !PHONE_RE.test(d.phone.trim())) er.phone = "Enter a phone number like +252 61 234 5678, or leave it empty.";
    if (!d.terms) er.terms = "Accept the terms to create your account.";
    setErrors(er);
    return !Object.keys(er).length;
  }

  function applyTiming(t: Timing) {
    setNow(Date.now());
    setResendAt(Date.now() + t.resend_after * 1000);
  }

  async function submitStudies(e: React.FormEvent) {
    e.preventDefault();
    if (!checkStudies()) return;
    setBusy(true);
    setErrors({});
    try {
      if (google) {
        const res = await fetch(apiUrl("/api/v1/auth/google-signup"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: google.token, university: d.university, faculty: d.faculty, programme: d.programme, year: d.year, phone: d.phone, terms: d.terms }),
        });
        if (!res.ok) throw new Error(await readError(res, "We could not create your account."));
        persistSession(((await res.json()) as { access_token: string }).access_token);
        setStep(4);
        return;
      }
      const res = await fetch(apiUrl("/api/v1/auth/signup/start"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: d.name, email: d.email, password: d.password, university: d.university, faculty: d.faculty, programme: d.programme, year: d.year, phone: d.phone, terms: d.terms }),
      });
      if (!res.ok) throw new Error(await readError(res, "We could not send the code. Try again."));
      applyTiming((await res.json()) as Timing);
      setDigits(["", "", "", "", "", ""]);
      setStep(3);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      setErrors({ code: "Enter all 6 digits of the code." });
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch(apiUrl("/api/v1/auth/signup/verify"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: d.email, code }) });
      if (!res.ok) throw new Error(await readError(res, "That code is not right."));
      persistSession(((await res.json()) as { access_token: string }).access_token);
      setStep(4);
    } catch (err) {
      setErrors({ code: err instanceof Error ? err.message : "That code is not right." });
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch(apiUrl("/api/v1/auth/signup/resend"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: d.email }) });
      if (!res.ok) throw new Error(await readError(res, "We could not send a new code."));
      applyTiming((await res.json()) as Timing);
      setDigits(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setErrors({ code: err instanceof Error ? err.message : "We could not send a new code." });
    } finally {
      setBusy(false);
    }
  }

  function onDigit(i: number, value: string) {
    const v = value.replace(/\D/g, "").slice(-1);
    setDigits((cur) => cur.map((x, idx) => (idx === i ? v : x)));
    setErrors((cur) => (cur.code ? { ...cur, code: undefined } : cur));
    if (v) otpRefs.current[i + 1]?.focus();
  }

  function onDigitKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      setDigits((cur) => cur.map((x, idx) => (idx === i - 1 ? "" : x)));
      otpRefs.current[i - 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setDigits(Array.from({ length: 6 }, (_, i) => pasted[i] ?? ""));
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  function back() {
    setErrors({});
    if (step === 2 && google) {
      setGoogle(null);
      setStep(1);
      return;
    }
    setStep((s) => (Math.max(1, s - 1) as 1 | 2 | 3 | 4));
  }

  const steps: [string, string][] = [["Your account", "person"], ["Your studies", "school"], ["Verify email", "mark_email_read"]];
  const field = (id: string, label: string, control: React.ReactNode, err?: string, help?: string) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {control}
      {help && !err && <span className="help">{help}</span>}
      {err && <span className="err">{err}</span>}
    </div>
  );
  const select = (id: string, value: string, options: string[], onChange: (v: string) => void) => (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select>
  );
  const firstName = d.name.trim().split(/\s+/)[0] ?? "";

  return (
    <section className="su-wrap ruled">
      <div className="home-wrap su-center">
        <div className="su-card">
          <Link href="/" aria-label="Home" className="su-brand"><BrandLogo height={38} /></Link>
          {step <= 3 && (
            <ol className="stepper" aria-label="Sign-up progress">
              {steps.map(([t, ic], i) => {
                const hidden = google && i === 2;
                if (hidden) return null;
                return (
                  <li key={t} className={step > i + 1 ? "done" : step === i + 1 ? "on" : ""} aria-current={step === i + 1 ? "step" : undefined}>
                    <span className="sdot">{step > i + 1 ? <MaterialIcon name="check" size={15} /> : i + 1}</span>{t}
                    <span className="sr-only">{ic}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {errors.form && <div className="su-error" role="alert">{errors.form}</div>}

          {step === 1 && (
            <form onSubmit={submitAccount} noValidate className="su-body">
              <div><h1>Create your account</h1><p className="muted">Turn your lectures into Somali study notes. It takes about two minutes.</p></div>
              <div className="google-slot-wrap">
                <div ref={slotRef} className="google-slot" hidden={!hasClientId} />
                {!hasClientId && (
                  <button type="button" className="public-btn public-btn-ghost google-btn" onClick={openPopup} disabled={busy}><FaGoogle aria-hidden="true" /> Sign up with Google</button>
                )}
              </div>
              <div className="or"><span>or with your email</span></div>
              {field("su-name", "Full name", <input id="su-name" className={errors.name ? "invalid" : ""} value={d.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />, errors.name)}
              {field("su-email", "Email address", <input id="su-email" type="email" className={errors.email ? "invalid" : ""} value={d.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />, errors.email, "We send a 6-digit code to this address to verify it.")}
              {field("su-pass", "Password", (
                <div className="pw-field">
                  <input id="su-pass" type={showPw ? "text" : "password"} className={errors.password ? "invalid" : ""} value={d.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"}><MaterialIcon name={showPw ? "visibility_off" : "visibility"} size={20} /></button>
                </div>
              ), errors.password)}
              <PasswordRules value={d.password} />
              {field("su-pass2", "Confirm password", <input id="su-pass2" type={showPw ? "text" : "password"} className={errors.confirm ? "invalid" : ""} value={d.confirm} onChange={(e) => set("confirm", e.target.value)} autoComplete="new-password" />, errors.confirm)}
              <button className="public-btn public-btn-primary" type="submit">Continue <MaterialIcon name="arrow_forward" size={18} /></button>
              <p className="su-switch">Already have an account? <Link href="/sign-in">Sign in</Link></p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={submitStudies} noValidate className="su-body">
              <div><h1>Tell us about your studies</h1><p className="muted">This helps us label your lectures and improve notes for your subject.</p></div>
              {google && <div className="su-note"><MaterialIcon name="verified" size={20} /><span>Signed in with Google as <b>{d.email}</b>. Your email is already verified, so there is no code to enter.</span></div>}
              {field("su-uni", "University", select("su-uni", d.university, signup.universities, (v) => set("university", v)))}
              <div className="form-row">
                {field("su-fac", "Faculty", select("su-fac", d.faculty, signup.faculties, (v) => set("faculty", v)))}
                {field("su-year", "Year of study", select("su-year", d.year, signup.year_levels, (v) => set("year", v)))}
              </div>
              {field("su-prog", "Programme", <input id="su-prog" className={errors.programme ? "invalid" : ""} value={d.programme} onChange={(e) => set("programme", e.target.value)} placeholder="e.g. Bachelor of Computer Science" />, errors.programme)}
              {field("su-phone", "Phone or WhatsApp (optional)", <input id="su-phone" type="tel" className={errors.phone ? "invalid" : ""} value={d.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+252 61 234 5678" autoComplete="tel" />, errors.phone, "Only used if we need to reach you about your account.")}
              <label className="check">
                <input type="checkbox" checked={d.terms} onChange={(e) => set("terms", e.target.checked)} />
                <span>I agree to the {privacySlug ? <Link href={`/resources/docs/${privacySlug}`} target="_blank">terms and privacy notice</Link> : "terms and privacy notice"}.</span>
              </label>
              {errors.terms && <span className="err">{errors.terms}</span>}
              <div className="su-actions">
                <button type="button" className="public-btn public-btn-ghost" onClick={back}><MaterialIcon name="arrow_back" size={18} />Back</button>
                <button type="submit" className="public-btn public-btn-primary" disabled={busy}>{busy ? "Please wait…" : google ? "Create account" : "Create account and send code"}</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={verify} noValidate className="su-body">
              <div>
                <span className="su-ic"><MaterialIcon name="mark_email_read" size={28} /></span>
                <h1>Check your email</h1>
                <p className="muted">We sent a 6-digit code to <b>{d.email}</b>. Enter it below to verify your email and finish creating your account. The code expires in 15 minutes.</p>
              </div>
              <div className="otp" role="group" aria-label="6-digit code">
                {digits.map((v, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    className={`otp-box${errors.code ? " invalid" : ""}`}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={v}
                    aria-label={`Digit ${i + 1}`}
                    onChange={(e) => onDigit(i, e.target.value)}
                    onKeyDown={(e) => onDigitKey(i, e)}
                    onPaste={onPaste}
                  />
                ))}
              </div>
              {errors.code && <span className="err" role="alert">{errors.code}</span>}
              <button className="public-btn public-btn-primary" type="submit" disabled={busy}>{busy ? "Checking…" : "Verify email"}</button>
              <div className="su-actions su-split">
                <button type="button" className="public-btn public-btn-ghost small" onClick={() => { setStep(1); setErrors({}); }}><MaterialIcon name="edit" size={16} />Change email</button>
                <button type="button" className="public-btn public-btn-ghost small" onClick={resend} disabled={busy || wait > 0}>{wait > 0 ? `Resend code in ${wait}s` : "Resend code"}</button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="su-body">
              <span className="su-ic good"><MaterialIcon name="verified" size={28} /></span>
              <h1>You are all set, {firstName}</h1>
              <p className="muted">{google ? "Your Google email is already verified." : `Your email ${d.email} is verified.`} Your account is ready.</p>
              <div className="su-summary">
                <div><span>University</span><b>{d.university}</b></div>
                <div><span>Programme</span><b>{d.programme}</b></div>
                <div><span>Year</span><b>{d.year}</b></div>
              </div>
              <div className="su-actions">
                <a className="public-btn public-btn-primary" href="/dashboard/new-lecture"><MaterialIcon name="add_circle" size={18} />Add your first lecture</a>
                <a className="public-btn public-btn-ghost" href="/dashboard">Go to dashboard</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
