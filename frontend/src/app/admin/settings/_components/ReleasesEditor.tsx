"use client";

import type { ReleasesSettings } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { ReleasesField, TextArea } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

export default function ReleasesEditor() {
  const ed = useSectionEditor<ReleasesSettings>("releases");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;

  const form = (
    <>
      <TextArea label="Intro" value={d.intro} max={240} rows={2} error={e.intro} onChange={(v) => ed.setField("intro", v)} />
      <ReleasesField errors={e} value={d.entries} onChange={(v) => ed.setField("entries", v)} />
    </>
  );

  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-home-mock"><div className="h">Releases</div><p className="sc-help">{d.intro}</p></div>
      {d.entries.map((r, i) => (
        <div className="sc-home-mock" key={i}>
          <span><strong>{r.version}</strong> <span className={`sc-badge ${r.status === "Released" ? "custom" : ""}`}>{r.status}</span> <span className="sc-help">{r.date}</span></span>
          <strong>{r.title}</strong>
          {r.notes.split("\n").filter(Boolean).map((n) => <span className="sc-help" key={n}>– {n}</span>)}
        </div>
      ))}
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
