import type { Metadata } from "next";
import Link from "next/link";
import MaterialIcon from "@/components/site/MaterialIcon";
import { getSiteContent } from "@/lib/site-content.server";
import ResourcesSubnav from "./ResourcesSubnav";
import "../home.css";
import "./resources.css";

export const metadata: Metadata = { title: "Resources" };

export default async function ResourcesPage() {
  const { navigation } = (await getSiteContent()).sections;
  const links = navigation.resources_links.filter((l) => l.enabled);

  return (
    <div className="home-page">
      <ResourcesSubnav links={navigation.resources_links} current="/resources" />
      <section className="res-hero">
        <div className="home-wrap">
          <span className="home-eyebrow">Resources</span>
          <h1>Resources</h1>
          <p className="home-lede">{navigation.resources_tagline}</p>
        </div>
      </section>
      <div className="home-wrap res-grid">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="res-card">
            <span className="res-ic"><MaterialIcon name={l.icon} size={22} /></span>
            <span className="home-eyebrow">{/docs|releases/.test(l.href) ? "Platform" : "Research"}</span>
            <h3>{l.label}</h3>
            <p>{l.description}</p>
            <span className="go">Open <MaterialIcon name="arrow_forward" size={16} /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
