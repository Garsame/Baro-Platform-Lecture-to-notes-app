"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import MaterialIcon from "./MaterialIcon";
import { useSiteContent } from "./SiteContentProvider";
import type { NavLink } from "@/lib/site-content";

type Props = { signedIn: boolean; onNavigate?: () => void };

function Panel({ id, tagline, overview, links, onNavigate }: { id: string; tagline: string; overview: string; links: NavLink[]; onNavigate: () => void }) {
  return (
    <div className="nav-panel" id={id} role="menu">
      <div className="nav-panel-lead">
        <p>{tagline}</p>
        <Link href={overview} onClick={onNavigate}>See overview →</Link>
      </div>
      <div className="nav-panel-links">
        {links.map((l) => (
          <Link key={`${l.href}-${l.label}`} href={l.href} role="menuitem" onClick={onNavigate}>
            <MaterialIcon name={l.icon} />
            <span><strong>{l.label}</strong><span>{l.description}</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SiteNav({ signedIn, onNavigate }: Props) {
  const { navigation } = useSiteContent().sections;
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const about = navigation.about_links.filter((l) => l.enabled);
  const resources = navigation.resources_links.filter((l) => l.enabled);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleNavigate = () => {
    setOpenId(null);
    onNavigate?.();
  };

  const hoverProps = (id: string) => ({
    onMouseEnter: () => {
      if (!window.matchMedia("(hover: hover)").matches) return;
      clearTimeout(closeTimer.current);
      setOpenId(id);
    },
    onMouseLeave: () => {
      if (!window.matchMedia("(hover: hover)").matches) return;
      closeTimer.current = setTimeout(() => setOpenId(null), 180);
    },
  });

  const group = (id: string, label: string, links: NavLink[], tagline: string, overview: string, active: boolean) => {
    if (links.length === 0) return null;
    const open = openId === id;
    return (
      <div className="nav-item" {...hoverProps(id)}>
        <button
          type="button"
          className="nav-link"
          aria-expanded={open}
          aria-controls={id}
          aria-current={active ? "page" : undefined}
          onClick={() => setOpenId(open ? null : id)}
        >
          {label} <span className="caret"><MaterialIcon name="expand_more" /></span>
        </button>
        <div className={open ? "nav-panel-wrap open" : "nav-panel-wrap"}>
          <Panel id={id} tagline={tagline} overview={overview} links={links} onNavigate={handleNavigate} />
        </div>
      </div>
    );
  };

  const plain = (href: string, label: string) => (
    <div className="nav-item">
      <Link href={href} className="nav-link" aria-current={pathname === href ? "page" : undefined} onClick={handleNavigate}>{label}</Link>
    </div>
  );

  return (
    <nav ref={navRef} id="public-navigation" className="main-nav" aria-label="Main">
      {plain("/", "Home")}
      {group("panel-about", "About", about, navigation.about_tagline, "/about", pathname === "/about")}
      {group("panel-resources", "Resources", resources, navigation.resources_tagline, "/resources", pathname.startsWith("/resources"))}
      {plain("/contact", "Contact")}
      {signedIn && plain("/dashboard", "Dashboard")}
    </nav>
  );
}
