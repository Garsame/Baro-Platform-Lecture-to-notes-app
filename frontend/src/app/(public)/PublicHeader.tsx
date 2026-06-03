"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MdArrowOutward, MdClose, MdMenu } from "react-icons/md";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="public-header">
      <div
        className={`public-container header-container ${
          isMenuOpen ? "menu-open" : ""
        }`}
      >
        <Link href="/" className="logo" onClick={closeMenu}>
          <Image
            src="/barobadi-logo.png"
            alt="BaroBadi Logo"
            width={140}
            height={44}
            className="logo-light"
            priority
            style={{ height: "auto" }}
          />
          <Image
            src="/barobadi-logo-dark.png"
            alt="BaroBadi Logo"
            width={140}
            height={44}
            className="logo-dark"
            priority
            style={{ height: "auto" }}
          />
        </Link>

        <div className="mobile-header-tools">
          <ThemeToggle />
          <button
            className="mobile-nav-toggle"
            type="button"
            aria-controls="public-navigation"
            aria-expanded={isMenuOpen}
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <MdClose /> : <MdMenu />}
          </button>
        </div>

        <div className="public-menu-content">
          <nav
            id="public-navigation"
            className="public-nav"
            aria-label="Public navigation"
          >
            {navLinks.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <span className="desktop-theme-toggle">
              <ThemeToggle />
            </span>
            <Link
              href="/sign-in"
              className="public-btn public-btn-ghost"
              onClick={closeMenu}
            >
              <span>Sign In</span>
              <MdArrowOutward className="auth-link-icon" aria-hidden="true" />
            </Link>
            <Link
              href="/sign-up"
              className="public-btn public-btn-primary"
              onClick={closeMenu}
            >
              <span>Sign Up</span>
              <MdArrowOutward className="auth-link-icon" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
