import type { Metadata } from "next";
import { getSiteContent } from "@/lib/site-content.server";
import ResourcesSubnav from "../ResourcesSubnav";
import "../../home.css";
import "../resources.css";
import "./releases.css";

export const metadata: Metadata = { title: "Releases" };

export default async function ReleasesPage() {
  const { sections } = await getSiteContent();
  const r = sections.releases;

  return (
    <div className="home-page">
      <ResourcesSubnav links={sections.navigation.resources_links} current="/resources/releases" />
      <section className="rel-hero">
        <div className="narrow">
          <span className="home-eyebrow">Resources</span>
          <h1>Releases</h1>
          {r.intro && <p className="home-lede">{r.intro}</p>}
        </div>
      </section>
      <section className="rel-list-wrap">
        <div className="narrow releases">
          {r.entries.map((e) => (
            <article className="release" key={`${e.version}-${e.title}`}>
              <div className="rmeta">
                <span className="ver">{e.version}</span>
                <span className="date">{e.date}</span>
                <span className={`home-chip ${e.status === "Planned" ? "warn" : "good"}`}>{e.status}</span>
              </div>
              <div>
                <h3>{e.title}</h3>
                <ul>{e.notes.split("\n").map((n) => n.trim()).filter(Boolean).map((n) => <li key={n}>{n}</li>)}</ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
