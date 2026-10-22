"use client";

import Link from "next/link";
import { FaFacebookF, FaGithub, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { IconType } from "react-icons";
import BrandLogo from "./BrandLogo";
import MaterialIcon from "./MaterialIcon";
import { useBranding, useSiteContent } from "./SiteContentProvider";

const SOCIALS: { key: "social_facebook" | "social_x" | "social_linkedin" | "social_github" | "social_youtube"; label: string; Icon: IconType }[] = [
  { key: "social_facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "social_x", label: "X", Icon: FaXTwitter },
  { key: "social_linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { key: "social_github", label: "GitHub", Icon: FaGithub },
  { key: "social_youtube", label: "YouTube", Icon: FaYoutube },
];

export default function SiteFooter() {
  const branding = useBranding();
  const { navigation } = useSiteContent().sections;
  const about = navigation.about_links.filter((l) => l.enabled);
  const resources = navigation.resources_links.filter((l) => l.enabled);
  const socials = SOCIALS.filter((s) => navigation[s.key]);

  const linkItem = (l: { href: string; label: string; icon: string }) => (
    <Link key={`${l.href}-${l.label}`} href={l.href}>
      <MaterialIcon name={l.icon} />
      <span>{l.label}</span>
    </Link>
  );

  return (
    <footer className="site-footer">
      <div className="footer-wrap">
        <div className="footer-tagline">
          {navigation.footer_tagline_a}
          {navigation.footer_tagline_b && <> <span>{navigation.footer_tagline_b}</span></>}
        </div>
        <div className="footer-grid">
          <div className="footer-about">
            <Link href="/" aria-label={branding.site_name}><BrandLogo height={38} /></Link>
            <p>{navigation.footer_about}</p>
            {socials.length > 0 && (
              <div className="footer-socials">
                {socials.map(({ key, label, Icon }) => (
                  <a key={key} href={navigation[key]} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                    <Icon aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>
          {about.length > 0 && (
            <div>
              <h2>About</h2>
              <nav aria-label="About">{about.map(linkItem)}</nav>
            </div>
          )}
          {resources.length > 0 && (
            <div>
              <h2>Resources</h2>
              <nav aria-label="Resources">{resources.map(linkItem)}</nav>
            </div>
          )}
          <div>
            <h2>Account</h2>
            <nav aria-label="Account">
              {linkItem({ href: "/sign-in", label: "Sign in", icon: "login" })}
              {linkItem({ href: "/sign-up", label: "Create an account", icon: "person_add" })}
              {linkItem({ href: "/contact", label: "Contact", icon: "mail" })}
            </nav>
          </div>
        </div>
        <div className="footer-legal">
          <span>© {new Date().getFullYear()} {branding.site_name}. All rights reserved. {branding.footer_note}</span>
        </div>
      </div>
    </footer>
  );
}
