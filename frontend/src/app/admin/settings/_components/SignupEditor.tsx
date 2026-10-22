"use client";

import type { SignupSettings } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { TagsField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

export default function SignupEditor() {
  const ed = useSectionEditor<SignupSettings>("signup");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;
  const set = ed.setField;

  const form = (
    <>
      <p className="sc-help">These are the choices on the sign-up form and the student Profile page. The server only accepts values from these lists.</p>
      <TagsField label="Universities" value={d.universities} max={40} error={e.universities} help="Keep “Other” for people whose university is not listed." onChange={(v) => set("universities", v)} />
      <TagsField label="Faculties" value={d.faculties} max={30} error={e.faculties} onChange={(v) => set("faculties", v)} />
      <TagsField label="Year of study" value={d.year_levels} max={12} error={e.year_levels} onChange={(v) => set("year_levels", v)} />
    </>
  );

  const preview = (
    <div className="sc-preview-stack">
      {([["University", d.universities], ["Faculty", d.faculties], ["Year of study", d.year_levels]] as const).map(([label, items]) => (
        <div className="sc-home-mock" key={label}>
          <strong>{label}</strong>
          {items.map((x) => <span className="sc-help" key={x}>{x}</span>)}
        </div>
      ))}
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
