"use client";

import { useState } from "react";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";

type Props = {
  label: string;
  isDefault: boolean;
  updatedAt: string | null;
  isDirty: boolean;
  saving: boolean;
  message: string | null;
  onSave: () => void;
  onDiscard: () => void;
  onReset: () => void;
  form: React.ReactNode;
  preview: React.ReactNode;
};

export default function EditorShell({ label, isDefault, updatedAt, isDirty, saving, message, onSave, onDiscard, onReset, form, preview }: Props) {
  const [pane, setPane] = useState<"edit" | "preview">("edit");
  return (
    <div className="sc-editor">
      <div className="sc-topbar">
        <Link href="/admin/settings" className="sc-back"><MdArrowBack /> Site Content</Link>
        <h1>{label}</h1>
        <span className={`sc-badge ${isDefault ? "" : "custom"}`}>{isDefault ? "Default" : "Customized"}</span>
        {updatedAt && <span className="sc-help">Updated {new Date(updatedAt).toLocaleString()}</span>}
        <div className="sc-top-actions">
          <button type="button" className="sc-btn" onClick={onDiscard} disabled={!isDirty || saving}>Discard changes</button>
          <button type="button" className="sc-btn" onClick={onReset} disabled={saving}>Reset to default</button>
          <button type="button" className="sc-btn primary" onClick={onSave} disabled={!isDirty || saving}>{saving ? "Saving…" : "Save and publish"}</button>
        </div>
      </div>
      {message && <div className="sc-message" role="status">{message}</div>}
      <div className="sc-toggle" role="tablist">
        <button type="button" role="tab" aria-selected={pane === "edit"} onClick={() => setPane("edit")}>Edit</button>
        <button type="button" role="tab" aria-selected={pane === "preview"} onClick={() => setPane("preview")}>Preview</button>
      </div>
      <div className="sc-columns" data-pane={pane}>
        <div className="sc-form">{form}</div>
        <aside className="sc-preview">{preview}</aside>
      </div>
    </div>
  );
}
