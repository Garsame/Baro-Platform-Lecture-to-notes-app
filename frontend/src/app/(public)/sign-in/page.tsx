"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiUrl, fetchCurrentUser, getErrorMessage } from "@/lib/api";
import { clearSession, persistSession } from "@/lib/session";
import { MdVisibility, MdVisibilityOff, MdArrowForward } from "react-icons/md";

// Declare global google variable for TypeScript compiler
declare global {
  interface Window {
    google?: any;
  }
}

const GoogleIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '12px' }}>
    <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.25h2.9c1.69-1.55 2.69-3.85 2.69-6.58z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.9-2.25c-.8.54-1.83.87-3.06.87-2.35 0-4.34-1.58-5.05-3.72H.93v2.33C2.42 16.02 5.48 18 9 18z"/>
    <path fill="#FBBC05" d="M3.95 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.97H.93A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.93 4.03l3.02-2.33z"/>
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.47.9 11.43 0 9 0 5.48 0 2.42 1.98.93 4.97l3.02 2.33C4.66 5.16 6.65 3.58 9 3.58z"/>
  </svg>
);

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasGoogleClientId, setHasGoogleClientId] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("registered") === "true") {
      setSuccess("Account created successfully. You can sign in now.");
      router.replace("/sign-in");
    }
  }, [router]);

  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Measure the container width
  useEffect(() => {
    if (!hasGoogleClientId) return;
    
    const container = document.getElementById("g_id_signin_btn");
    if (!container) return;

    // Set initial width if available
    const initialWidth = container.getBoundingClientRect().width;
    if (initialWidth > 0) {
      setContainerWidth(Math.min(Math.max(initialWidth, 200), 400));
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const measuredWidth = entry.contentRect.width;
        if (measuredWidth > 0) {
          // Google button width must be between 200px and 400px
          const width = Math.min(Math.max(measuredWidth, 200), 400);
          setContainerWidth(width);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [hasGoogleClientId]);

  // Load Google Identity Services SDK and render/re-render the button when container width or SDK is ready
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setHasGoogleClientId(false);
      return;
    }
    setHasGoogleClientId(true);

    if (!containerWidth) return;

    const initAndRenderGoogleButton = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              handleGoogleLogin(response.credential);
            }
          }
        });

        const btnContainer = document.getElementById("g_id_signin_btn");
        if (btnContainer) {
          btnContainer.innerHTML = ""; // Clear placeholder
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: containerWidth,
            text: "continue_with",
            logo_alignment: "left",
            shape: "pill"
          });
        }
      }
    };

    if (window.google) {
      initAndRenderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initAndRenderGoogleButton;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [containerWidth]);

  // Listen to messages from Google chooser popup window (fallback mode)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === "google-login-success") {
        handleGoogleLogin(event.data.token);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(apiUrl("/api/v1/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res, "Login failed"));
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
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (googleToken: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(apiUrl("/api/v1/auth/google-login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleToken })
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res, "Google login failed"));
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
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openGooglePopup = () => {
    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      "/google-chooser",
      "GoogleSignOn",
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );
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
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.25rem" }}>Welcome back</h1>
        <p style={{ color: "var(--public-muted)", fontSize: "0.95rem", marginBottom: "1.75rem" }}>
          Sign in to your BaroBadi account
        </p>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Continue with Google Action */}
        <div style={{ minHeight: "48px", width: "100%", display: "flex", justifyContent: "center" }}>
          {hasGoogleClientId ? (
            /* Real Google Sign-in Button wrapper with a high-visibility placeholder */
            <div id="g_id_signin_btn" style={{ width: "100%", minHeight: "48px", display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                className="google-signin-btn"
                style={{ width: "100%" }}
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </div>
          ) : (
            /* Custom popup window chooser fallback button */
            <button
              type="button"
              onClick={openGooglePopup}
              className="google-signin-btn"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          )}
        </div>

        <div className="auth-divider" style={{ margin: "1.5rem 0" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>OR</span>
        </div>

        <form onSubmit={handleSubmit} className="public-form">
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "700" }}>Password</label>
              <Link href="/contact" style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--public-primary)" }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ borderRadius: "12px", padding: "0.75rem 3rem 0.75rem 1rem", width: "100%" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--public-muted)",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
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
            {isLoading ? "Signing in..." : "Log In"}
            {!isLoading && <MdArrowForward size={18} />}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" style={{ fontWeight: "700", color: "var(--public-primary)" }}>
            Create one free
          </Link>
        </p>
      </div>
    </section>
  );
}
