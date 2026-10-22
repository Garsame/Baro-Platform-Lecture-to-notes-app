"use client";

import Link from "next/link";
import { FaFacebookF, FaGithub, FaLinkedinIn, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
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
  const { navigation, contact } = useSiteContent().sections;
  const about = navigation.about_links.filter((l) => l.enabled);
  const resources = navigation.resources_links.filter((l) => l.enabled);
  const socials = SOCIALS.filter((s) => navigation[s.key]);

  const accountLink = { href: "/sign-up", label: "Create an account", icon: "person_add" };
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
          {(
            <div>
              <h2>About</h2>
              <nav aria-label="About">{[...about, accountLink].map(linkItem)}</nav>
            </div>
          )}
          {resources.length > 0 && (
            <div>
              <h2>Resources</h2>
              <nav aria-label="Resources">{resources.map(linkItem)}</nav>
            </div>
          )}
          {(contact.email || contact.phone || contact.whatsapp || contact.hours) && (
            <div>
              <h2>Contact</h2>
              <nav aria-label="Contact">
                {contact.email && <a href={`mailto:${contact.email}`}><MaterialIcon name="mail" /><span>{contact.email}</span></a>}
                {contact.phone && <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}><MaterialIcon name="call" /><span>{contact.phone}</span></a>}
                {contact.whatsapp && <a href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp aria-hidden="true" /><span>WhatsApp {contact.whatsapp}</span></a>}
                {contact.hours && <span className="footer-hours"><MaterialIcon name="schedule" /><span>{contact.hours}</span></span>}
              </nav>
            </div>
          )}
        </div>
        <div className="footer-legal">
          <span>© {new Date().getFullYear()} {branding.site_name}. All rights reserved. {branding.footer_note}</span>
          <nav aria-label="Legal"><Link href="/contact">Support</Link></nav>
        </div>
      </div>
    </footer>
  );
}
