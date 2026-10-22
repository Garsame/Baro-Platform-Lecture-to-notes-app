"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import BrandingEditor from "../_components/BrandingEditor";
import ContactEditor from "../_components/ContactEditor";
import EmailEditor from "../_components/EmailEditor";
import ResearchEditor from "../_components/ResearchEditor";
import AboutEditor from "../_components/AboutEditor";
import HomeEditor from "../_components/HomeEditor";
import NavigationEditor from "../_components/NavigationEditor";
import SeoEditor from "../_components/SeoEditor";
import TeamEditor from "../_components/TeamEditor";
import "../site-content.css";

export default function SectionEditorPage() {
  const { section } = useParams<{ section: string }>();
  if (section === "branding") return <BrandingEditor />;
  if (section === "seo") return <SeoEditor />;
  if (section === "navigation") return <NavigationEditor />;
  if (section === "home") return <HomeEditor />;
  if (section === "about") return <AboutEditor />;
  if (section === "team") return <TeamEditor />;
  if (section === "contact") return <ContactEditor />;
  if (section === "research") return <ResearchEditor />;
  if (section === "email") return <EmailEditor />;
  return (
    <div className="sc-editor">
      <h1>This section is not available yet</h1>
      <p className="sc-help">It will be added in a later phase.</p>
      <Link href="/admin/settings" className="sc-btn">Back to Site Content</Link>
    </div>
  );
}
