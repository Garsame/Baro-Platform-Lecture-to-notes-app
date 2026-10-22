import type { Metadata } from "next";
import { resolveAssetUrl } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-content.server";
import MaterialIcon from "@/components/site/MaterialIcon";
import ResourcesSubnav from "../ResourcesSubnav";
import CopyCite from "./CopyCite";
import "../../home.css";
import "../resources.css";

export const metadata: Metadata = { title: "Research and findings" };

export default async function ResearchPage() {
  const { sections } = await getSiteContent();
  const r = sections.research;
  const results = r.results.map((x) => ({ label: x.label, v: parseFloat(x.value) || 0 }));
  const low = results.length ? results.reduce((a, b) => (b.v < a.v ? b : a)) : null;
  const thesis = resolveAssetUrl(r.thesis_url);
  const pubPdf = resolveAssetUrl(r.pub_pdf_url);
  const lines = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);
  const limitations = lines(r.limitations);
  const future = lines(r.future_work);
  const kpis: [string, string][] = [
    [r.participants, "Participants"],
    [r.questions, "Questionnaire items"],
    [r.success_rate, "Pipeline success rate"],
    [r.avg_time, "Average processing time"],
  ];

  return (
    <div className="home-page">
      <ResourcesSubnav links={sections.navigation.resources_links} current="/resources/research" />
      <div className="narrow paper paper-stack">
        <div style={{ display: "grid", gap: 14 }}>
          <span className="eyebrow-label">Research and findings</span>
          <h1>{r.title}</h1>
          <div className="byline">
            {r.subtitle && <span>{r.subtitle}</span>}
            {r.authors && <span><b>Authors:</b> {r.authors}</span>}
            {r.supervisor && <span><b>Supervisor:</b> {r.supervisor}</span>}
          </div>
        </div>

        {r.pub_title && (
          <section className="pub-card" aria-label="Journal publication">
            <span className="pub-flag"><MaterialIcon name="workspace_premium" size={18} filled />{r.pub_label || "Published"}</span>
            <h2>{r.pub_title}</h2>
            {r.pub_journal && <p className="pub-journal">{r.pub_journal}</p>}
            {r.pub_authors && <p className="pub-meta">{r.pub_authors}</p>}
            {r.pub_details && <p className="pub-meta">{r.pub_details}</p>}
            <div className="pub-actions">
              {r.pub_url && <a className="public-btn public-btn-primary" href={r.pub_url} target="_blank" rel="noopener noreferrer">Read the paper <MaterialIcon name="arrow_outward" size={18} /></a>}
              {pubPdf && <a className="public-btn public-btn-ghost" href={pubPdf} target="_blank" rel="noopener noreferrer">Download PDF</a>}
            </div>
            {r.pub_cite && <CopyCite text={r.pub_cite} />}
          </section>
        )}

        <div className="abstract"><b>Abstract</b>{r.abstract}</div>

        {r.stages.length > 0 && (
          <>
            <h2>Research stages</h2>
            <ol className="timeline">
              {r.stages.map((s, i) => (
                <li key={i}>
                  <div>
                    {s.when && <span className="when">{s.when}</span>}
                    {s.when && <br />}
                    <b>{s.name}</b>
                    {s.text && <div className="muted">{s.text}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}

        {r.findings.length > 0 && (
          <>
            <h2>{r.findings_title || "What the paper found"}</h2>
            <div className="findings">
              {r.findings.map((f) => (
                <div className="finding" key={f.title}><b>{f.title}</b><span>{f.text}</span></div>
              ))}
            </div>
          </>
        )}

        <h2>Evaluation results</h2>
        <div className="kpis">
          {kpis.filter(([v]) => v).map(([v, l]) => (
            <div className="kpi" key={l}><span className="v">{v}</span><span className="l">{l}</span></div>
          ))}
        </div>
        {results.length > 0 && (
          <div className="result-list" role="list">
            {results.map((x) => (
              <div className={`result${low && x === low ? " low" : ""}`} role="listitem" key={x.label}>
                <span>{x.label}</span>
                <span className="bar"><i style={{ width: `${Math.max(0, Math.min(100, (x.v / 5) * 100))}%` }} /></span>
                <span className="val">{x.v.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
        {low && (
          <p className="note">
            Scores are averages on a 1 to 5 scale. The lowest, {low.label.toLowerCase()} at {low.v.toFixed(2)}, is the main area for future work.
          </p>
        )}

        {limitations.length > 0 && (
          <>
            <h2>Limitations</h2>
            <ul className="plain-list">{limitations.map((x) => <li key={x}>{x}</li>)}</ul>
          </>
        )}
        {future.length > 0 && (
          <>
            <h2>Future work</h2>
            <ul className="plain-list">{future.map((x) => <li key={x}>{x}</li>)}</ul>
          </>
        )}

        <h2>Other publications</h2>
        {r.paper_venue && (
          <div className="paper-card">
            <div>
              <span className="eyebrow-label">Conference paper</span>
              <h3>{r.paper_venue}</h3>
              {r.paper_detail && <p>{r.paper_detail}</p>}
            </div>
          </div>
        )}
        <div className="paper-card">
          <div>
            <span className="eyebrow-label">Full thesis</span>
            <h3>{r.title}</h3>
            <p>{r.thesis_file} · PDF</p>
          </div>
          {thesis && (
            <a className="public-btn public-btn-primary" href={thesis} download target="_blank" rel="noopener noreferrer">Download thesis</a>
          )}
        </div>
      </div>
    </div>
  );
}
