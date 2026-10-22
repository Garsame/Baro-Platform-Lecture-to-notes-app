"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import BrandingEditor from "../_components/BrandingEditor";
import SeoEditor from "../_components/SeoEditor";
import "../site-content.css";

export default function SectionEditorPage() {
  const { section } = useParams<{ section: string }>();
  if (section === "branding") return <BrandingEditor />;
  if (section === "seo") return <SeoEditor />;
  return (
    <div className="sc-editor">
      <h1>This section is not available yet</h1>
      <p className="sc-help">It will be added in a later phase.</p>
      <Link href="/admin/settings" className="sc-btn">Back to Site Content</Link>
    </div>
  );
}
