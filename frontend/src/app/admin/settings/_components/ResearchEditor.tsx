"use client";

import type { ResearchSettings } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { FileField, ResearchResultsField, ResearchStagesField, TextArea, TextField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

export default function ResearchEditor() {
  const ed = useSectionEditor<ResearchSettings>("research");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;
  const set = ed.setField;

  const form = (
    <>
      <TextArea label="Thesis title" value={d.title} max={160} rows={2} error={e.title} onChange={(v) => set("title", v)} />
      <TextField label="Subtitle" value={d.subtitle} max={120} error={e.subtitle} onChange={(v) => set("subtitle", v)} />
      <TextField label="Authors" value={d.authors} max={200} error={e.authors} onChange={(v) => set("authors", v)} />
      <TextField label="Supervisor" value={d.supervisor} max={80} error={e.supervisor} onChange={(v) => set("supervisor", v)} />
      <TextArea label="Abstract" value={d.abstract} max={1400} rows={8} error={e.abstract} onChange={(v) => set("abstract", v)} />
      <ResearchStagesField errors={e} value={d.stages} onChange={(v) => set("stages", v)} />
      <ResearchResultsField errors={e} value={d.results} onChange={(v) => set("results", v)} />
      <TextField label="Participants" value={d.participants} max={6} error={e.participants} onChange={(v) => set("participants", v)} />
      <TextField label="Questionnaire items" value={d.questions} max={6} error={e.questions} onChange={(v) => set("questions", v)} />
      <TextField label="Pipeline success rate" value={d.success_rate} max={8} error={e.success_rate} onChange={(v) => set("success_rate", v)} />
      <TextField label="Average processing time" value={d.avg_time} max={10} error={e.avg_time} onChange={(v) => set("avg_time", v)} />
      <TextField label="Paper venue" value={d.paper_venue} max={140} error={e.paper_venue} onChange={(v) => set("paper_venue", v)} />
      <TextArea label="Paper details" value={d.paper_detail} max={220} rows={2} error={e.paper_detail} onChange={(v) => set("paper_detail", v)} />
      <TextField label="Thesis file name" value={d.thesis_file} max={80} error={e.thesis_file} help="Shown under the thesis title." onChange={(v) => set("thesis_file", v)} />
      <FileField label="Thesis PDF" value={d.thesis_url} error={e.thesis_url} help="Up to 25 MB." onChange={(v) => set("thesis_url", v)} />
    </>
  );

  const results = d.results.map((r) => ({ ...r, n: parseFloat(r.value) || 0 }));
  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-home-mock">
        <div className="h" style={{ fontFamily: "Georgia, serif" }}>{d.title}</div>
        <span className="sc-help">{d.subtitle}</span>
        <span className="sc-help">Authors: {d.authors}</span>
        <span className="sc-help">Supervisor: {d.supervisor}</span>
      </div>
      <div className="sc-home-mock"><strong>Abstract</strong><span className="sc-help">{d.abstract}</span></div>
      <div className="sc-home-mock">
        <strong>Research stages</strong>
        {d.stages.map((s, i) => <span className="sc-help" key={i}>{s.when} · {s.name}</span>)}
      </div>
      <div className="sc-home-mock">
        <strong>Evaluation results</strong>
        {results.map((r, i) => (
          <div key={i} className="sc-help">{r.label}: {r.n.toFixed(2)}
            <div style={{ height: 8, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (r.n / 5) * 100)}%`, height: "100%", background: "var(--primary-color)" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="sc-home-mock"><strong>Publication</strong><span className="sc-help">{d.paper_venue}</span><span className="sc-help">Thesis: {d.thesis_file} {d.thesis_url ? "(PDF attached)" : "(no PDF yet)"}</span></div>
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
