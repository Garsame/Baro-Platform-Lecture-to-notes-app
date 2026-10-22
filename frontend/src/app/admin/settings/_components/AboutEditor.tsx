"use client";

import type { AboutSettings } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { StageListField, TextArea, TextField, ToggleField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

export default function AboutEditor() {
  const ed = useSectionEditor<AboutSettings>("about");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;
  const set = ed.setField;

  const form = (
    <>
      <TextField label="Headline" value={d.headline} max={90} error={e.headline} onChange={(v) => set("headline", v)} />
      <TextArea label="Intro" value={d.intro} max={300} rows={3} error={e.intro} onChange={(v) => set("intro", v)} />
      <TextField label="Mission title" value={d.mission_title} max={40} error={e.mission_title} onChange={(v) => set("mission_title", v)} />
      <TextArea label="Mission" value={d.mission} max={400} rows={4} error={e.mission} onChange={(v) => set("mission", v)} />
      <ToggleField label="Show the intro video on this page" help="Uses the video set in the Home page section." value={d.show_video} onChange={(v) => set("show_video", v)} />
      <TextField label="Pipeline heading (for screen readers)" value={d.stages_title} max={60} error={e.stages_title} onChange={(v) => set("stages_title", v)} />
      <StageListField fieldKey="stages" errors={e} value={d.stages} onChange={(v) => set("stages", v)} />
      <TextField label="Closing banner title" value={d.cta_title} max={60} error={e.cta_title} onChange={(v) => set("cta_title", v)} />
      <TextArea label="Closing banner text" value={d.cta_text} max={200} rows={2} error={e.cta_text} onChange={(v) => set("cta_text", v)} />
    </>
  );

  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-home-mock">
        <div className="h">{d.headline}</div>
        <p className="sc-help">{d.intro}</p>
        <div>{d.stages.map((s, i) => <span key={i} className="sc-badge">{String(i + 1).padStart(2, "0")} {s.name}</span>)}</div>
      </div>
      <div className="sc-home-mock"><strong>{d.mission_title}</strong><span className="sc-help">{d.mission}</span></div>
      {d.stages.map((s, i) => (
        <div className="sc-home-mock" key={i}>
          <span className="sc-help">Stage {String(i + 1).padStart(2, "0")} · {s.name}</span>
          <strong>{s.title}</strong>
          <span className="sc-help">{s.text}</span>
          <div>{s.tech.map((t) => <span key={t} className="sc-badge">{t}</span>)}</div>
        </div>
      ))}
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
