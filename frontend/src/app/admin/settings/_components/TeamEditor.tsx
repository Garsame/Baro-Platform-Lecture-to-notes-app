"use client";

import type { TeamSettings } from "@/lib/site-content";
import { resolveAssetUrl } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { MemberListField, TextArea, TextField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

export default function TeamEditor() {
  const ed = useSectionEditor<TeamSettings>("team");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;
  const set = ed.setField;

  const form = (
    <>
      <TextField label="Section title" value={d.title} max={60} error={e.title} onChange={(v) => set("title", v)} />
      <TextArea label="Intro" value={d.intro} max={300} rows={3} error={e.intro} onChange={(v) => set("intro", v)} />
      <MemberListField fieldKey="members" errors={e} value={d.members} onChange={(v) => set("members", v)} />
    </>
  );

  const ordered = [...d.members.filter((m) => m.level === "supervisor"), ...d.members.filter((m) => m.level !== "supervisor")];
  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-home-mock"><div className="h">{d.title}</div><p className="sc-help">{d.intro}</p></div>
      {ordered.map((m, i) => {
        const photo = resolveAssetUrl(m.photo_url);
        return (
          <div className="sc-home-mock sc-member-mock" key={i}>
            <span className="sc-avatar-mock">{photo ? <img src={photo} alt="" /> : m.name.slice(0, 1)}</span>
            <div><strong>{m.name}</strong> {m.level === "supervisor" && <span className="sc-badge custom">Supervisor</span>}<br /><span className="sc-help">{m.role}</span></div>
          </div>
        );
      })}
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
