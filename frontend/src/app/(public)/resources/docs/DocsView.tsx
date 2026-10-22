import Link from "next/link";
import { notFound } from "next/navigation";
import { docSlugs } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-content.server";
import Markdown, { headingId } from "../Markdown";
import ResourcesSubnav from "../ResourcesSubnav";
import "../../home.css";
import "../resources.css";
import "./docs.css";

export default async function DocsView({ slug }: { slug?: string }) {
  const { sections } = await getSiteContent();
  const pages = sections.docs.pages;
  const slugs = docSlugs(pages);
  const idx = slug === undefined ? 0 : slugs.indexOf(slug);
  if (idx < 0) notFound();
  const p = pages[idx] ?? { group: "", title: "No pages yet", body: "Add documentation pages in the admin portal." };
  const heads = (p.body.match(/^## .+$/gm) ?? []).map((h) => h.slice(3));

  const side = pages.map((pg, i) => {
    const groupLabel = pg.group !== pages[i - 1]?.group ? <span className="grp" key={`g-${i}`}>{pg.group}</span> : null;
    return (
      <span key={i} className="docs-side-item">
        {groupLabel}
        <Link href={`/resources/docs/${slugs[i]}`} aria-current={i === idx ? "page" : undefined}>{pg.title}</Link>
      </span>
    );
  });

  return (
    <div className="home-page">
      <ResourcesSubnav links={sections.navigation.resources_links} current="/resources/docs" />
      <div className="home-wrap docs">
        <nav className="docs-side" aria-label="Documentation">{side}</nav>
        <article className="docs-article">
          {p.group && <span className="home-eyebrow">{p.group}</span>}
          <h1>{p.title}</h1>
          <Markdown body={p.body} />
          <div className="docs-pager">
            {idx > 0 ? <Link className="public-btn public-btn-ghost" href={`/resources/docs/${slugs[idx - 1]}`}>← {pages[idx - 1].title}</Link> : <span />}
            {idx < pages.length - 1 ? <Link className="public-btn public-btn-ghost" href={`/resources/docs/${slugs[idx + 1]}`}>{pages[idx + 1].title} →</Link> : <span />}
          </div>
        </article>
        <aside className="docs-toc">
          <b>On this page</b>
          <span>{p.title}</span>
          {heads.map((h) => <a key={h} href={`#${headingId(h)}`}>{h}</a>)}
        </aside>
      </div>
    </div>
  );
}
