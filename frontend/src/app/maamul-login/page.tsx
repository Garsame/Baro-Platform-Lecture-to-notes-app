"use client";
// Force recompile to refresh CSS variables

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MdDarkMode,
  MdLightMode,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { apiUrl, fetchCurrentUser, getErrorMessage } from "@/lib/api";
import { clearSession, persistSession } from "@/lib/session";
import "../admin-auth.css";

export default function AdminSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("expired") === "true") {
      setError("Session expired due to inactivity. Please sign in again.");
      router.replace("/maamul-login");
    }
  }, [router]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("admin-theme", nextTheme);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(apiUrl("/api/v1/auth/admin-login"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!res.ok) {
        throw new Error(
          await getErrorMessage(res, "Failed to sign in as Admin."),
        );
      }

      const data = (await res.json()) as { access_token: string };
      const currentUser = await fetchCurrentUser(data.access_token);

      persistSession(data.access_token);
      router.replace(
        currentUser.role === "admin" ? "/admin/dashboard" : "/dashboard",
      );
    } catch (err: unknown) {
      clearSession();
      setError(
        err instanceof Error ? err.message : "Failed to sign in as Admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-auth-shell" data-theme={theme}>
      <button
        type="button"
        className="admin-auth-theme"
        onClick={toggleTheme}
        aria-label="Toggle admin auth theme"
      >
        {theme === "dark" ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </button>

      <section className="admin-auth-card">
        <div className="admin-auth-brand" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <img src={theme === "dark" ? "/barobadi-logo-dark.png" : "/barobadi-logo.png"} alt="BaroBadi Logo" style={{ width: '160px', height: 'auto', objectFit: 'contain' }} />
        </div>

        <div className="admin-auth-heading">
          <h1>Welcome Back</h1>
          <p>Sign in to manage users, lectures, jobs, and platform settings.</p>
        </div>

        {error && <div className="admin-auth-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-auth-form">
          <label>
            <span>Email Address</span>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <div className="admin-auth-password">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <MdVisibilityOff size={20} />
                ) : (
                  <MdVisibility size={20} />
                )}
              </button>
            </div>
          </label>

          <div className="admin-auth-row">
            <label className="admin-auth-check">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link href="/contact">Need help?</Link>
          </div>

          <button type="submit" className="admin-auth-submit" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="admin-auth-switch">
          Don&apos;t have admin access?{" "}
          <Link href="/admin-signup">Register here</Link>
        </p>
      </section>
    </main>
  );
}
