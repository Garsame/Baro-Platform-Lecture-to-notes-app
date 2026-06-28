import React from "react";
import Link from "next/link";
import Image from "next/image";
import PublicHeader from "./PublicHeader";
import "./public.css";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-layout">
      <PublicHeader />
      <main className="public-main">{children}</main>
      <footer className="public-footer">
        <div className="public-container footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo footer-logo">
              <Image
                src="/barobadi-logo.png"
                alt="BaroBadi Logo"
                width={140}
                height={44}
                className="logo-light"
                style={{ height: "auto" }}
              />
              <Image
                src="/barobadi-logo-dark.png"
                alt="BaroBadi Logo"
                width={140}
                height={44}
                className="logo-dark"
                style={{ height: "auto" }}
              />
            </Link>
            <p>
              A Somali-first lecture learning platform for students, teachers,
              and teams who need faster study materials from video.
            </p>
          </div>
          <div className="footer-column">
            <h2>Platform</h2>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="footer-column">
            <h2>Access</h2>
            <Link href="/sign-in">Sign In</Link>
          </div>
        </div>
        <div className="public-container footer-bottom">
          <p>(c) 2026 BaroBadi Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
