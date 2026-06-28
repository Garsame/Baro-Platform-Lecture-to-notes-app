"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiUrl, getErrorMessage } from "@/lib/api";
import { MdArrowForward } from "react-icons/md";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(apiUrl("/api/v1/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res, "Signup failed"));
      }

      setSuccess("Account created successfully. Redirecting to sign in...");
      router.push("/sign-in?registered=true");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      {/* Centered Logo above the card */}
      <div className="auth-logo-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
        <Link href="/">
          <Image
            src="/barobadi-logo.png"
            alt="BaroBadi Logo"
            width={160}
            height={50}
            className="logo-light"
            priority
            style={{ height: "auto" }}
          />
          <Image
            src="/barobadi-logo-dark.png"
            alt="BaroBadi Logo"
            width={160}
            height={50}
            className="logo-dark"
            priority
            style={{ height: "auto" }}
          />
        </Link>
      </div>

      <div className="form-card auth-card" style={{ maxWidth: "480px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem" }}>Create free account</h1>
        <p style={{ color: "var(--public-muted)", fontSize: "0.95rem", marginBottom: "1.75rem" }}>
          Enter your details to open your BaroBadi workspace
        </p>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="public-form">
          <div className="form-field">
            <label style={{ fontSize: "0.9rem", fontWeight: "700" }}>Full Name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ borderRadius: "12px", padding: "0.75rem 1rem" }}
            />
          </div>
          <div className="form-field">
            <label style={{ fontSize: "0.9rem", fontWeight: "700" }}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ borderRadius: "12px", padding: "0.75rem 1rem" }}
            />
          </div>
          <div className="form-field">
            <label style={{ fontSize: "0.9rem", fontWeight: "700" }}>Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ borderRadius: "12px", padding: "0.75rem 1rem" }}
            />
          </div>

          <button
            type="submit"
            className="public-btn public-btn-primary"
            disabled={isLoading}
            style={{
              borderRadius: "12px",
              minHeight: "48px",
              marginTop: "0.5rem",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "var(--public-primary)",
              color: "#ffffff"
            }}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
            {!isLoading && <MdArrowForward size={18} />}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link href="/sign-in" style={{ fontWeight: "700", color: "var(--public-primary)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
