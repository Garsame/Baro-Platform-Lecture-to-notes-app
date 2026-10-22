import type { Metadata } from "next";
import Link from "next/link";
import { getSiteContent } from "@/lib/site-content.server";
import ResourcesSubnav from "../ResourcesSubnav";
import StateList from "./StateList";
import "../../home.css";
import "../resources.css";
import "./state.css";

export const metadata: Metadata = { title: "State of research" };

export default async function StatePage() {
  const { sections } = await getSiteContent();
  const s = sections.state;
  const points = s.contribution.split("\n").map((x) => x.trim()).filter(Boolean);

  return (
    <div className="home-page">
      <ResourcesSubnav links={sections.navigation.resources_links} current="/resources/state-of-research" />
      <section className="state-hero">
        <div className="home-wrap">
          <span className="home-eyebrow">Resources</span>
          <h1>{s.title}</h1>
          {s.intro && <p className="home-lede">{s.intro}</p>}
        </div>
      </section>
      <div className="home-wrap state-split">
        <div style={{ minWidth: 0 }}>
          {s.now_text && <div className="callout"><b>Where the field stands.</b> {s.now_text}</div>}
          <StateList entries={s.entries} />
        </div>
        {points.length > 0 && (
          <aside className="contribution">
            <span className="home-eyebrow">Our contribution</span>
            <h3>What {sections.branding.site_name} adds</h3>
            <ul>{points.map((x) => <li key={x}>{x}</li>)}</ul>
            <Link className="public-btn contribution-btn" href="/resources/research">Read the findings →</Link>
          </aside>
        )}
      </div>
    </div>
  );
}
