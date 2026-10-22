"use client";

import { useEffect, useState } from "react";
import { sampleNotes, sampleTranscript } from "./sample";

const transcript = sampleTranscript;

export default function TransformCard() {
  const notePoints = sampleNotes.points;
  const [step, setStep] = useState(transcript.length + notePoints.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const total = transcript.length + notePoints.length + 1;
    let current = total + 1; // first tick wraps to 0, restarting the animation
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        current = (current + 1) % (total + 2);
        setStep(current);
      }, 1100);
    }, 2600);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [notePoints.length]);

  const total = transcript.length + notePoints.length + 1;
  const stage = step < transcript.length ? "Transcribing speech" : step < transcript.length + notePoints.length ? "Writing Somali notes" : "Notes ready";
  const progress = Math.min(100, Math.round((Math.min(step + 1, total) / total) * 100));

  return (
    <div className="transform-card" aria-label="Example: a transcript turning into Somali notes">
      <div className="tc-head">
        <span className="live" />
        <span>Introduction to Database Systems · <span style={{ fontFamily: "var(--mono)" }}>52:14</span></span>
        <span className="home-chip" style={{ marginLeft: "auto" }}>Example</span>
      </div>
      <div className="tc-body">
        <div className="tc-col">
          <span className="tc-label">Transcript · English</span>
          {transcript.map(([t, line], i) => (
            <div className={`tc-line ${i < step ? "on" : ""}`} key={t}>
              <span className="t">{t}</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
        <div className="tc-col tc-note">
          <span className="tc-label">Notes · Somali</span>
          <h4>Qodobbada muhiimka ah</h4>
          <ul>
            {notePoints.map((p, i) => (
              <li className={step >= transcript.length + i + 1 ? "on" : ""} key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="tc-foot">
        <span>{stage}</span>
        <span className="tc-progress"><i style={{ width: `${progress}%` }} /></span>
      </div>
    </div>
  );
}
