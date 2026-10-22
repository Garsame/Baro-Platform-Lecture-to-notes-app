"use client";

import Link from "next/link";
import { useState } from "react";
import MaterialIcon from "@/components/site/MaterialIcon";
import type { JourneyCard } from "@/lib/site-content";

const GLOWS = ["var(--accent-raw)", "#7c5cff", "#16b99a"];

export default function JourneyBand({ titleA, titleB, cards, showDocs }: { titleA: string; titleB: string; cards: JourneyCard[]; showDocs: boolean }) {
  const tabs = Array.from(new Set(cards.map((c) => c.tab)));
  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;
  const current = tabs[Math.min(active, tabs.length - 1)];

  return (
    <section className="gh-band">
      <div className="home-wrap">
        <h2 className="gh-head">
          <span>{titleA}</span> {titleB}
        </h2>
        <div className="gh-tabs" role="tablist" aria-label="How it works">
          {tabs.map((t, i) => (
            <button key={t} type="button" role="tab" aria-selected={t === current} onClick={() => setActive(i)}>
              {t}
            </button>
          ))}
        </div>
        <div className="gh-cards" role="tabpanel">
          {cards.filter((c) => c.tab === current).map((card, i) => (
            <Link key={`${card.label}-${card.title}`} href={card.href} className="gh-card" style={{ "--glow": GLOWS[i % 3] } as React.CSSProperties}>
              <span className="gh-ic"><MaterialIcon name={card.icon} size={26} /></span>
              <span className="gh-label">{card.label}</span>
              <span className="gh-title">{card.title}</span>
              <span className="gh-link">{card.link_label} <MaterialIcon name="arrow_forward" size={18} /></span>
            </Link>
          ))}
        </div>
        <div className="gh-more">
          {showDocs && <Link href="/resources/docs">Read the documentation <MaterialIcon name="arrow_forward" size={18} /></Link>}
          <Link href="/about">See the full pipeline <MaterialIcon name="arrow_forward" size={18} /></Link>
        </div>
      </div>
    </section>
  );
}
