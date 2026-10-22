"use client";

import type { DocsSettings } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { DocsPagesField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

export default function DocsEditor() {
  const ed = useSectionEditor<DocsSettings>("docs");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;

  const form = <DocsPagesField errors={ed.fieldErrors} value={d.pages} onChange={(v) => ed.setField("pages", v)} />;

  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-home-mock">
        <strong>Sidebar</strong>
        {d.pages.map((p, i) => {
          const heading = p.group !== d.pages[i - 1]?.group ? <span className="sc-help" key={`g${i}`}>{p.group.toUpperCase()}</span> : null;
          return <span key={i}>{heading}<br />{p.title}</span>;
        })}
      </div>
      {d.pages[0] && (
        <div className="sc-home-mock" style={{ whiteSpace: "pre-wrap" }}>
          <span className="sc-help">First page</span>
          <div className="h">{d.pages[0].title}</div>
          <span>{d.pages[0].body}</span>
        </div>
      )}
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
