import type { Metadata } from "next";
import { resolveAssetUrl } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-content.server";
import ResourcesSubnav from "../ResourcesSubnav";
import "../../home.css";
import "../resources.css";

export const metadata: Metadata = { title: "Research and findings" };

export default async function ResearchPage() {
  const { sections } = await getSiteContent();
  const r = sections.research;
  const results = r.results.map((x) => ({ label: x.label, v: parseFloat(x.value) || 0 }));
  const low = results.length ? results.reduce((a, b) => (b.v < a.v ? b : a)) : null;
  const thesis = resolveAssetUrl(r.thesis_url);
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

        <h2>Publication</h2>
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
