"use client";

import { useState } from "react";
import { sampleNotes } from "./sample";

const noteTabs = [
  { id: "summary", label: "Soo koobid" },
  { id: "points", label: "Qodobbada muhiimka ah" },
  { id: "terms", label: "Ereybixin" },
];

export default function NoteCard() {
  const [tab, setTab] = useState("summary");
  return (
    <div className="note-card">
      <div className="note-tabs" role="tablist">
        {noteTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            className="note-tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "summary" && (
        <div className="note-body">
          <div className="note-meta">
            <span className="home-chip brand">Computer Science</span>
            <span className="home-chip">52:14 lecture</span>
            <span className="home-chip good">Notes ready</span>
          </div>
          <h3>{sampleNotes.title}</h3>
          <p>{sampleNotes.summary}</p>
          {sampleNotes.detail.map((d, i) => <p key={i}>{d}</p>)}
        </div>
      )}
      {tab === "points" && (
        <div className="note-body">
          <h3>Qodobbada muhiimka ah</h3>
          <ul>{sampleNotes.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
      )}
      {tab === "terms" && (
        <div className="note-body">
          <h3>Ereybixin</h3>
          <table className="term-table">
            <tbody>
              {sampleNotes.terms.map(([a, b]) => (
                <tr key={a}><td>{a}</td><td>{b}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
