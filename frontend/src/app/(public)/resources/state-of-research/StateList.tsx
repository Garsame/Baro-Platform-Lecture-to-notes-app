"use client";

import { useState } from "react";
import type { StateEntry } from "@/lib/site-content";

export default function StateList({ entries }: { entries: StateEntry[] }) {
  const cats = ["All", ...Array.from(new Set(entries.map((e) => e.category)))];
  const [filter, setFilter] = useState("All");
  const active = cats.includes(filter) ? filter : "All";
  const list = entries.filter((e) => active === "All" || e.category === active).slice().sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <>
      <div className="filter-row" role="group" aria-label="Filter by topic">
        {cats.map((c) => (
          <button key={c} type="button" aria-pressed={c === active} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>
      {list.map((e) => (
        <article className="entry" key={`${e.year}-${e.title}`}>
          <span className="yr">{e.year}</span>
          <div>
            <h3>
              {e.url ? <a href={e.url} target="_blank" rel="noopener noreferrer">{e.title} ↗</a> : e.title}
            </h3>
            <div className="src">
              {[e.authors, e.venue].filter(Boolean).join(" · ")} {(e.authors || e.venue) && "· "}<span className="home-chip">{e.category}</span>
            </div>
            {e.summary && <p>{e.summary}</p>}
            {e.relation && <p className="rel"><b>For BaroPlatform:</b> {e.relation}</p>}
          </div>
        </article>
      ))}
    </>
  );
}
