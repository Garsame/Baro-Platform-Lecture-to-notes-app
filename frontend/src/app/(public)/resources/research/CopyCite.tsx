"use client";

import { useState } from "react";

export default function CopyCite({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the citation is selectable text, so it can still be copied by hand.
    }
  }
  return (
    <div className="cite-box">
      <span className="eyebrow-label">Cite this paper</span>
      <p className="cite-text">{text}</p>
      <button type="button" className="public-btn public-btn-ghost cite-btn" onClick={copy}>{copied ? "Copied" : "Copy citation"}</button>
    </div>
  );
}
