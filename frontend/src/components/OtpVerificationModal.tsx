"use client";

import React, { useEffect, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api";
import { MdClose, MdEmail, MdRefresh } from "react-icons/md";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void;
}

export default function OtpVerificationModal({
  isOpen,
  onClose,
  email,
  onSuccess,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // If modal is closed, reset state
  useEffect(() => {
    if (!isOpen) {
      setOtp("");
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl("/api/v1/auth/verify-email"), {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: otp }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Invalid code. Please try again.");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(apiUrl("/api/v1/auth/verify-email"), {
        method: "POST",
        headers: authHeaders(),
      });

      if (!res.ok) {
        throw new Error("Failed to send code. Please try again.");
      }

      setCooldown(60);
      setError(null);
      alert("A new verification code has been sent to your email!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(9, 14, 26, 0.65)",
      backdropFilter: "blur(6px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "var(--public-surface, #ffffff)",
        border: "1px solid var(--public-border, #e3e8f2)",
        borderRadius: "24px",
        padding: "2.5rem 2rem",
        maxWidth: "460px",
        width: "100%",
        boxShadow: "0 20px 48px rgba(9, 14, 26, 0.25)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center"
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--public-muted, #65728a)",
            padding: "4px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "var(--public-surface-soft, #f1f5fb)"}
          onMouseOut={(e) => e.currentTarget.style.background = "none"}
          aria-label="Close modal"
        >
          <MdClose size={22} />
        </button>

        {/* Icon Header */}
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "rgba(66, 133, 244, 0.08)",
          color: "#4285F4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px"
        }}>
          <MdEmail size={28} />
        </div>

        {/* Header Text */}
        <h2 style={{
          fontSize: "1.5rem",
          fontWeight: "800",
          color: "var(--public-text, #121a2d)",
          margin: "0 0 8px 0"
        }}>
          Verify Your Email
        </h2>
        <p style={{
          fontSize: "0.92rem",
          color: "var(--public-muted, #65728a)",
          lineHeight: "1.5",
          margin: "0 0 24px 0",
          maxWidth: "340px"
        }}>
          We sent a 6-digit verification code to <strong style={{ color: "var(--public-text, #121a2d)" }}>{email}</strong>. Please enter it below.
        </p>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "10px",
            color: "#ef4444",
            padding: "10px 14px",
            fontSize: "0.85rem",
            fontWeight: "600",
            marginBottom: "20px",
            width: "100%",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            placeholder="••••••"
            required
            autoFocus
            disabled={isLoading}
            style={{
              width: "100%",
              maxWidth: "220px",
              minHeight: "54px",
              borderRadius: "14px",
              border: "2px solid #4285F4",
              background: "var(--public-surface-soft, #f1f5fb)",
              color: "var(--public-text, #121a2d)",
              fontSize: "1.8rem",
              fontWeight: "800",
              textAlign: "center",
              letterSpacing: "0.4em",
              outline: "none",
              boxShadow: "0 4px 12px rgba(66, 133, 244, 0.06)",
              transition: "all 0.2s"
            }}
          />

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            style={{
              width: "100%",
              minHeight: "48px",
              borderRadius: "12px",
              border: "none",
              background: "#4285F4",
              color: "#ffffff",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: (isLoading || otp.length !== 6) ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(66, 133, 244, 0.22)",
              opacity: (isLoading || otp.length !== 6) ? 0.65 : 1,
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              if (!isLoading && otp.length === 6) {
                e.currentTarget.style.background = "#1a73e8";
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && otp.length === 6) {
                e.currentTarget.style.background = "#4285F4";
              }
            }}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        {/* Resend Actions */}
        <div style={{ marginTop: "24px", fontSize: "0.88rem" }}>
          {cooldown > 0 ? (
            <span style={{ color: "var(--public-muted, #65728a)", fontWeight: "500" }}>
              Resend code in {cooldown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isLoading}
              style={{
                background: "none",
                border: "none",
                color: "#4285F4",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 8px",
                borderRadius: "6px"
              }}
              onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
            >
              <MdRefresh size={16} />
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
