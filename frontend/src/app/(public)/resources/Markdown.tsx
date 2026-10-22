import { Fragment } from "react";

/** Inline `code` only; everything else is plain text, so admin-written content can never inject markup. */
function inline(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 2 ? <code key={i}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>,
  );
}

export const headingId = (h: string) => "h-" + h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Small block renderer for the documentation pages: ## headings, - bullets, 1. steps, > callouts. */
export default function Markdown({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/);
  return (
    <>
      {blocks.map((b, i) => {
        const ls = b.split("\n").map((l) => l.trim()).filter(Boolean);
        if (!ls.length) return null;
        if (ls[0].startsWith("## ")) {
          const h = ls[0].slice(3);
          return (
            <Fragment key={i}>
              <h2 id={headingId(h)}>{inline(h)}</h2>
              {ls.length > 1 && <p>{inline(ls.slice(1).join(" "))}</p>}
            </Fragment>
          );
        }
        if (ls.every((l) => l.startsWith("- "))) return <ul key={i}>{ls.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
        if (ls.every((l) => /^\d+\.\s/.test(l))) return <ol key={i}>{ls.map((l, j) => <li key={j}>{inline(l.replace(/^\d+\.\s/, ""))}</li>)}</ol>;
        if (ls[0].startsWith("> ")) return <div className="callout" key={i}>{inline(ls.map((l) => l.replace(/^>\s?/, "")).join(" "))}</div>;
        return <p key={i}>{inline(ls.join(" "))}</p>;
      })}
    </>
  );
}
