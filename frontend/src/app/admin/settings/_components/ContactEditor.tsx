"use client";

import type { ContactSettings } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { TagsField, TextArea, TextField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

export default function ContactEditor() {
  const ed = useSectionEditor<ContactSettings>("contact");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;
  const set = ed.setField;

  const form = (
    <>
      <TextField label="Headline" value={d.headline} max={80} error={e.headline} onChange={(v) => set("headline", v)} />
      <TextArea label="Intro" value={d.intro} max={300} rows={3} error={e.intro} onChange={(v) => set("intro", v)} />
      <TextField label="Contact name" value={d.contact_name} max={60} error={e.contact_name} help="Shown as the person or team visitors write to." onChange={(v) => set("contact_name", v)} />
      <TextField label="Public email" value={d.email} max={120} error={e.email} help="Shown on the page. Leave empty to hide it. Messages go to the inbox in Email settings." onChange={(v) => set("email", v)} />
      <TextField label="Phone" value={d.phone} max={40} error={e.phone} help="Leave empty to hide it." onChange={(v) => set("phone", v)} />
      <TextField label="WhatsApp" value={d.whatsapp} max={40} error={e.whatsapp} help="With country code, for example +252 61 000 0000. Leave empty to hide it." onChange={(v) => set("whatsapp", v)} />
      <TextField label="Opening hours" value={d.hours} max={80} error={e.hours} onChange={(v) => set("hours", v)} />
      <TagsField label="Topics in the form" value={d.topics} max={10} error={e.topics} help="Visitors pick one of these. Leave empty for a free-text topic." onChange={(v) => set("topics", v)} />
    </>
  );

  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-home-mock">
        <div className="h">{d.headline}</div>
        <p className="sc-help">{d.intro}</p>
      </div>
      <div className="sc-home-mock">
        {d.contact_name && <span>Contact: <strong>{d.contact_name}</strong></span>}
        {d.email && <span>Email: {d.email}</span>}
        {d.phone && <span>Phone: {d.phone}</span>}
        {d.whatsapp && <span>WhatsApp: {d.whatsapp}</span>}
        {d.hours && <span>Hours: {d.hours}</span>}
        {!d.contact_name && !d.email && !d.phone && !d.whatsapp && !d.hours && <span className="sc-help">No contact details shown. Only the form appears.</span>}
      </div>
      <div className="sc-home-mock">
        <strong>Form topics</strong>
        <div>{d.topics.map((t) => <span key={t} className="sc-badge">{t}</span>)}</div>
      </div>
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
