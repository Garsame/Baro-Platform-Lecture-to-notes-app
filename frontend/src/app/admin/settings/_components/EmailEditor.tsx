"use client";

import type { EmailSettings } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { TextArea, TextField, ToggleField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

export default function EmailEditor() {
  const ed = useSectionEditor<EmailSettings>("email");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;
  const set = ed.setField;

  const form = (
    <>
      <TextField label="Team inbox" value={d.recipient_email} max={120} error={e.recipient_email} help="Every contact message is sent here. Leave empty to use the inbox already set in the server settings (SMTP_FROM_EMAIL)." onChange={(v) => set("recipient_email", v)} />
      <ToggleField label="Send a confirmation email to every sender" help="The same standard message goes to everyone who uses the contact form. Senders are not asked to verify their email." value={d.auto_reply_enabled} onChange={(v) => set("auto_reply_enabled", v)} />
      <TextField label="Confirmation subject" value={d.auto_reply_subject} max={80} error={e.auto_reply_subject} onChange={(v) => set("auto_reply_subject", v)} />
      <TextArea label="Confirmation message" value={d.auto_reply_body} max={1200} rows={8} error={e.auto_reply_body} help="Use {name} for the sender's name and {topic} for the topic they chose." onChange={(v) => set("auto_reply_body", v)} />
    </>
  );

  const sample = d.auto_reply_body.replace("{name}", "Amina").replace("{topic}", "Lecture processing");
  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-home-mock">
        <span className="sc-help">Messages arrive at</span>
        <strong>{d.recipient_email || "The inbox in the server settings"}</strong>
      </div>
      <div className="sc-home-mock" style={{ whiteSpace: "pre-wrap" }}>
        <span className="sc-help">Confirmation email{d.auto_reply_enabled ? "" : " (switched off)"}</span>
        <strong>{d.auto_reply_subject}</strong>
        <span>{sample}</span>
      </div>
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
