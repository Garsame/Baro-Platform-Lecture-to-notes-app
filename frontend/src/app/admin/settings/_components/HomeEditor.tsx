"use client";

import Link from "next/link";
import type { HomeSettings } from "@/lib/site-content";
import EditorShell from "./EditorShell";
import { FaqListField, JourneyCardsField, TagsField, TextArea, TextField, ToggleField } from "./fields";
import { useSectionEditor } from "./useSectionEditor";

const STATS: [keyof HomeSettings, string][] = [
  ["stat_lectures", "Lectures processed"],
  ["stat_students", "Students learning"],
  ["stat_hours", "Hours of lecture converted"],
  ["stat_notes", "Somali notes written"],
  ["stat_quizzes", "Quizzes completed"],
  ["stat_time", "Average processing time"],
  ["stat_success", "Pipeline success rate"],
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="sc-group"><h2>{title}</h2>{children}</section>;
}

export default function HomeEditor() {
  const ed = useSectionEditor<HomeSettings>("home");
  if (!ed.draft || !ed.meta) return <p>{ed.message ?? "Loading…"}</p>;
  const d = ed.draft;
  const e = ed.fieldErrors;
  const set = ed.setField;

  const form = (
    <>
      <Group title="Hero">
        <TextField label="Badge label" value={d.badge_label} max={14} error={e.badge_label} onChange={(v) => set("badge_label", v)} />
        <TextField label="Badge text" value={d.badge_text} max={60} error={e.badge_text} onChange={(v) => set("badge_text", v)} />
        <TextField label="Headline" value={d.headline} max={50} error={e.headline} onChange={(v) => set("headline", v)} />
        <TextField label="Headline accent" help="Shown in the accent colour." value={d.headline_accent} max={40} error={e.headline_accent} onChange={(v) => set("headline_accent", v)} />
        <TextArea label="Subheadline" value={d.subheadline} max={240} rows={3} error={e.subheadline} onChange={(v) => set("subheadline", v)} />
        <TextField label="Primary button" value={d.primary_cta} max={24} error={e.primary_cta} onChange={(v) => set("primary_cta", v)} />
        <TextField label="Secondary button" value={d.secondary_cta} max={28} error={e.secondary_cta} onChange={(v) => set("secondary_cta", v)} />
        <TagsField label="Hero points" value={d.hero_points} max={5} error={e.hero_points} onChange={(v) => set("hero_points", v)} />
      </Group>
      <Group title="Live numbers">
        <TextField label="Section title" value={d.stats_title} max={60} error={e.stats_title} onChange={(v) => set("stats_title", v)} />
        <TextArea label="Section intro" value={d.stats_intro} max={160} rows={2} error={e.stats_intro} onChange={(v) => set("stats_intro", v)} />
        {STATS.map(([key, label]) => (
          <ToggleField key={key} label={label} value={d[key] as boolean} onChange={(v) => set(key, v as never)} />
        ))}
        <p className="sc-help">Numbers come from the platform itself. Nothing is typed in by hand.</p>
      </Group>
      <Group title="How it works (tabbed cards)">
        <TextField label="Heading, first part" value={d.journey_title_a} max={70} error={e.journey_title_a} onChange={(v) => set("journey_title_a", v)} />
        <TextField label="Heading, second part" help="Shown in a quieter colour after the first part." value={d.journey_title_b} max={80} error={e.journey_title_b} onChange={(v) => set("journey_title_b", v)} />
        <JourneyCardsField fieldKey="journey_cards" errors={e} value={d.journey_cards} onChange={(v) => set("journey_cards", v)} />
      </Group>
      <Group title="Sample notes">
        <ToggleField label="Show sample notes" value={d.show_note_preview} onChange={(v) => set("show_note_preview", v)} />
        <TextField label="Title" value={d.note_title} max={60} error={e.note_title} onChange={(v) => set("note_title", v)} />
        <TextArea label="Intro" value={d.note_intro} max={200} rows={2} error={e.note_intro} onChange={(v) => set("note_intro", v)} />
        <TagsField label="What you get" value={d.note_points} max={8} error={e.note_points} onChange={(v) => set("note_points", v)} />
      </Group>
      <Group title="Testimonials">
        <ToggleField label="Show testimonials" value={d.show_testimonials} help="Reviews are approved on the Testimonials screen." onChange={(v) => set("show_testimonials", v)} />
        <TextField label="Section title" value={d.testimonials_title} max={60} error={e.testimonials_title} onChange={(v) => set("testimonials_title", v)} />
        <TextArea label="Section intro" value={d.testimonials_intro} max={160} rows={2} error={e.testimonials_intro} onChange={(v) => set("testimonials_intro", v)} />
        <Link href="/admin/testimonials" className="sc-btn small">Manage testimonials</Link>
      </Group>
      <Group title="FAQ">
        <TextField label="Section title" value={d.faq_title} max={60} error={e.faq_title} onChange={(v) => set("faq_title", v)} />
        <FaqListField fieldKey="faqs" errors={e} value={d.faqs} onChange={(v) => set("faqs", v)} />
      </Group>
      <Group title="Closing banner">
        <TextField label="Title" value={d.cta_title} max={60} error={e.cta_title} onChange={(v) => set("cta_title", v)} />
        <TextArea label="Text" value={d.cta_text} max={200} rows={2} error={e.cta_text} onChange={(v) => set("cta_text", v)} />
      </Group>
    </>
  );

  const tabs = Array.from(new Set(d.journey_cards.map((c) => c.tab)));
  const preview = (
    <div className="sc-preview-stack">
      <div className="sc-home-mock">
        {d.badge_text && <span className="sc-badge custom">{d.badge_label} {d.badge_text}</span>}
        <div className="h">{d.headline} <span>{d.headline_accent}</span></div>
        <p className="sc-help">{d.subheadline}</p>
        <div><span className="sc-mock-btn" style={{ background: "var(--primary-color)" }}>{d.primary_cta}</span> <span className="sc-badge">{d.secondary_cta}</span></div>
        <div className="sc-help">{d.hero_points.join(" · ")}</div>
      </div>
      <div className="sc-home-mock dark">
        <strong>{d.journey_title_a}</strong> <span>{d.journey_title_b}</span>
        <div>{tabs.map((t) => <span key={t} className="sc-badge">{t}</span>)}</div>
      </div>
      <div className="sc-home-mock">
        <strong>FAQ: {d.faq_title}</strong>
        {d.faqs.map((f) => <div key={f.q} className="sc-help">+ {f.q}</div>)}
      </div>
    </div>
  );

  return (
    <EditorShell label={ed.meta.label} isDefault={ed.meta.is_default} updatedAt={ed.meta.updated_at} isDirty={ed.isDirty} saving={ed.status === "saving"} message={ed.message} onSave={ed.save} onDiscard={ed.discard} onReset={ed.reset} form={form} preview={preview} />
  );
}
