import Link from "next/link";
import MaterialIcon from "@/components/site/MaterialIcon";
import type { PublicStats, Testimonial } from "@/lib/site-content";
import { getApprovedTestimonials, getPublicStats, getSiteContent } from "@/lib/site-content.server";
import IntroVideo from "./_home/IntroVideo";
import JourneyBand from "./_home/JourneyBand";
import NoteCard from "./_home/NoteCard";
import ReviewForm from "./_home/ReviewForm";
import TransformCard from "./_home/TransformCard";
import "./home.css";

const num = (n: number) => n.toLocaleString("en-US");
const duration = (secs: number) => `${Math.floor(secs / 60)}m ${String(Math.round(secs % 60)).padStart(2, "0")}s`;

function statTiles(stats: PublicStats, s: Record<string, boolean>) {
  const defs: [string, string, string, string][] = [
    ["stat_lectures", num(stats.lectures), "Lectures processed", "YouTube videos and uploads"],
    ["stat_students", num(stats.students), "Students learning", "Registered accounts"],
    ["stat_hours", num(stats.hours), "Hours of lecture converted", "Audio transcribed end to end"],
    ["stat_notes", num(stats.notes), "Somali notes written", "Summaries, key points and terms"],
    ["stat_quizzes", num(stats.quizzes), "Quizzes completed", "Self-tests taken by students"],
    ["stat_time", duration(stats.avg_seconds), "Average processing time", "From submit to finished notes"],
    ["stat_success", `${stats.success_rate}%`, "Pipeline success rate", "Completed versus failed jobs"],
  ];
  return defs.filter(([k]) => s[k]);
}

function Quote({ t }: { t: Testimonial }) {
  if (t.kind === "figure") {
    return (
      <figure className="quote figure">
        <div>
          {t.source && <span className="home-eyebrow">{t.source}</span>}
          <div className="big">{t.big}</div>
          <b>{t.name}</b>
        </div>
        <blockquote>{t.text}</blockquote>
        {t.role && <figcaption className="home-muted">{t.role}</figcaption>}
      </figure>
    );
  }
  const rating = t.rating ?? 0;
  return (
    <figure className="quote">
      <div className="quote-main">
        {rating > 0 && <span className="stars" aria-label={`${rating} out of 5`}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>}
        <blockquote>{t.text}</blockquote>
      </div>
      <figcaption className="who">
        <span className="home-avatar">{t.name.slice(0, 1).toUpperCase()}</span>
        <span><b>{t.name}</b>{t.role}</span>
      </figcaption>
    </figure>
  );
}

export default async function HomePage() {
  const [content, stats, testimonials] = await Promise.all([getSiteContent(), getPublicStats(), getApprovedTestimonials()]);
  const h = content.sections.home;
  const tiles = stats ? statTiles(stats, h as unknown as Record<string, boolean>) : [];

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-wrap home-hero-grid">
          <div>
            {h.badge_text && (
              <span className="home-badge">{h.badge_label && <b>{h.badge_label}</b>}{h.badge_text}</span>
            )}
            <h1>{h.headline} {h.headline_accent && <em>{h.headline_accent}</em>}</h1>
            <p className="home-lede">{h.subheadline}</p>
            <div className="home-hero-actions">
              <Link href="/sign-up" className="public-btn public-btn-primary">
                {h.primary_cta}
                <MaterialIcon name="arrow_forward" size={18} />
              </Link>
              <Link href="/about" className="public-btn public-btn-ghost">{h.secondary_cta}</Link>
            </div>
            {h.hero_points.length > 0 && (
              <div className="home-meta">
                {h.hero_points.map((p) => (
                  <span key={p}><MaterialIcon name="check" size={16} />{p}</span>
                ))}
              </div>
            )}
          </div>
          <TransformCard />
        </div>
      </section>

      {h.video_title && (
        <section className="home-section-tight" id="intro-video">
          <div className="home-wrap">
            <div className="home-section-head">
              <span className="home-eyebrow">Intro video</span>
              <h2>{h.video_title}</h2>
            </div>
            <IntroVideo title={h.video_title} caption={h.video_caption} />
          </div>
        </section>
      )}

      {tiles.length > 0 && (
        <section className="home-section">
          <div className="home-wrap">
            <div className="home-section-head">
              <span className="home-eyebrow">Live numbers</span>
              <h2>{h.stats_title}</h2>
              {h.stats_intro && <p>{h.stats_intro}</p>}
            </div>
            <div className="stats-grid">
              {tiles.map(([k, v, l, c]) => (
                <div className="stat" key={k}>
                  <span className="v">{v}</span>
                  <span className="l">{l}</span>
                  <span className="c">{c}</span>
                </div>
              ))}
            </div>
            <div className="stats-foot"><span className="live" />Live from the platform, updated every time this page loads.</div>
          </div>
        </section>
      )}

      <JourneyBand titleA={h.journey_title_a} titleB={h.journey_title_b} cards={h.journey_cards} />

      {h.show_note_preview && (
        <section className="home-section home-note-band">
          <div className="home-wrap home-note-split">
            <div className="home-note-text">
              <span className="home-eyebrow">Sample study pack</span>
              <h2>{h.note_title}</h2>
              {h.note_intro && <p>{h.note_intro}</p>}
              <ul className="home-checklist">{h.note_points.map((p) => <li key={p}>{p}</li>)}</ul>
              <div><Link href="/sign-up" className="public-btn public-btn-ghost">{h.primary_cta}</Link></div>
            </div>
            <NoteCard />
          </div>
        </section>
      )}

      {h.show_testimonials && (
        <section className="home-section">
          <div className="home-wrap">
            <div className="home-row-between">
              <div className="home-section-head" style={{ margin: 0 }}>
                <span className="home-eyebrow">Testimonials</span>
                <h2>{h.testimonials_title}</h2>
                {h.testimonials_intro && <p>{h.testimonials_intro}</p>}
              </div>
              <ReviewForm />
            </div>
            {testimonials.length > 0 ? (
              <div className="quote-grid">{testimonials.map((t) => <Quote key={t.id} t={t} />)}</div>
            ) : (
              <p className="home-muted">No reviews yet. Be the first to write one.</p>
            )}
          </div>
        </section>
      )}

      {h.faqs.length > 0 && (
        <section className="home-section">
          <div className="home-narrow">
            <div className="home-section-head center">
              <span className="home-eyebrow">FAQ</span>
              <h2>{h.faq_title}</h2>
            </div>
            <div className="home-faq">
              {h.faqs.map((f) => (
                <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="home-section-tight">
        <div className="home-wrap">
          <div className="home-cta">
            <div>
              <h2>{h.cta_title}</h2>
              {h.cta_text && <p>{h.cta_text}</p>}
            </div>
            <div className="home-cta-actions">
              <Link href="/sign-up" className="public-btn public-btn-white">{h.primary_cta}</Link>
              <Link href="/contact" className="public-btn public-btn-ghost">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
