"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the value is user-select: all, so it can still be copied by hand.
    }
  }
  return (
    <button type="button" className="public-btn public-btn-ghost copy-btn" onClick={copy} aria-label={`Copy ${text}`}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
