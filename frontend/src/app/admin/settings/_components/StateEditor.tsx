"use client";

import { STATE_CATEGORIES, type StateSettings } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { StateEntriesField, TextArea, TextField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

export default function StateEditor() {
  const ed = useSectionEditor<StateSettings>("state");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;
  const set = ed.setField;

  const form = (
    <>
      <TextField label="Title" value={d.title} max={60} error={e.title} onChange={(v) => set("title", v)} />
      <TextArea label="Intro" value={d.intro} max={320} rows={3} error={e.intro} onChange={(v) => set("intro", v)} />
      <TextArea label="Where the field stands" value={d.now_text} max={600} rows={4} error={e.now_text} onChange={(v) => set("now_text", v)} />
      <TextArea label="Our contribution (one point per line)" value={d.contribution} max={600} rows={5} error={e.contribution} onChange={(v) => set("contribution", v)} />
      <StateEntriesField errors={e} value={d.entries} categories={[...STATE_CATEGORIES]} onChange={(v) => set("entries", v)} />
    </>
  );

  const sorted = [...d.entries].sort((a, b) => Number(b.year) - Number(a.year));
  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-home-mock"><div className="h" style={{ fontFamily: "Georgia, serif" }}>{d.title}</div><p className="sc-help">{d.intro}</p></div>
      <div className="sc-home-mock"><strong>Where the field stands.</strong><span className="sc-help">{d.now_text}</span></div>
      {sorted.map((en, i) => (
        <div className="sc-home-mock" key={i}>
          <span className="sc-help">{en.year} · {en.category}</span>
          <strong>{en.title}</strong>
          <span className="sc-help">{en.authors} · {en.venue}</span>
        </div>
      ))}
      <div className="sc-home-mock dark"><strong>What our work adds</strong>{d.contribution.split("\n").filter(Boolean).map((x) => <span key={x}>{x}</span>)}</div>
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
