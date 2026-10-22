import Link from "next/link";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import MaterialIcon from "@/components/site/MaterialIcon";
import { resolveAssetUrl, type StageItem, type TeamMember } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-content.server";
import "../home.css";
import "./about.css";

const initials = (name: string) =>
  name.replace(/^Dr\.?\s+/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

function StageMedia({ stage }: { stage: StageItem }) {
  const image = resolveAssetUrl(stage.image_url);
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="stage-image" src={image} alt={`${stage.title}: ${stage.name} stage`} />;
  }
  const steps = stage.code.split("·").map((c) => c.trim()).filter(Boolean);
  return (
    <div className="stage-mock" aria-hidden="true">
      {steps.length > 0 && (
        <div className="stage-log">
          {steps.map((c) => <span key={c}><b>✓</b> {c}</span>)}
        </div>
      )}
      {stage.tech.length > 0 && (
        <div className="stage-tech">{stage.tech.map((t) => <span className="home-chip" key={t}>{t}</span>)}</div>
      )}
    </div>
  );
}

function Member({ m, featured }: { m: TeamMember; featured?: boolean }) {
  const photo = resolveAssetUrl(m.photo_url);
  return (
    <article className={`member${featured ? " featured" : ""}`}>
      <span className="member-avatar">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={m.name} />
        ) : (
          initials(m.name)
        )}
      </span>
      <div className="member-body">
        <h3>{m.name}</h3>
        <span className="member-role">{m.role}</span>
        {m.bio && <p>{m.bio}</p>}
        {(m.linkedin || m.github) && (
          <div className="member-links">
            {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}><FaLinkedinIn aria-hidden="true" /></a>}
            {m.github && <a href={m.github} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on GitHub`}><FaGithub aria-hidden="true" /></a>}
          </div>
        )}
      </div>
    </article>
  );
}

export default async function AboutPage() {
  const { sections } = await getSiteContent();
  const a = sections.about;
  const t = sections.team;
  const supervisors = t.members.filter((m) => m.level === "supervisor");
  const members = t.members.filter((m) => m.level !== "supervisor");

  return (
    <div className="home-page about-page">
      <section className="about-hero">
        <div className="home-wrap">
          <h1>{a.headline}</h1>
          <p className="home-lede">{a.intro}</p>
          {a.stages.length > 0 && (
            <nav className="stage-index" aria-label="Pipeline stages">
              {a.stages.map((s, i) => <a key={s.name} href={`#stage-${i + 1}`}>{String(i + 1).padStart(2, "0")} {s.name}</a>)}
              {t.members.length > 0 && <a href="#team">Team</a>}
            </nav>
          )}
        </div>
      </section>

      <section className="home-section-tight about-mission">
        <div className="home-wrap">
          <div className="home-section-head">
            <span className="home-eyebrow">Our mission</span>
            <h2>{a.mission_title}</h2>
            <p>{a.mission}</p>
          </div>
        </div>
      </section>

      {a.stages.length > 0 && (
        <section aria-labelledby="stages-title">
          <div className="home-wrap">
            <h2 id="stages-title" className="sr-only">{a.stages_title}</h2>
            {a.stages.map((s, i) => (
              <div className="showcase" id={`stage-${i + 1}`} key={`${s.name}-${i}`}>
                <div className="sc-text">
                  <span className="stage-no">Stage {String(i + 1).padStart(2, "0")} · {s.name}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  {s.tech.length > 0 && <div className="tech-row">{s.tech.map((x) => <span className="home-chip" key={x}>{x}</span>)}</div>}
                </div>
                <div className="sc-media"><StageMedia stage={s} /></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {t.members.length > 0 && (
        <section className="home-section about-team" id="team">
          <div className="home-wrap">
            <div className="home-section-head">
              <span className="home-eyebrow">Team</span>
              <h2>{t.title}</h2>
              {t.intro && <p>{t.intro}</p>}
            </div>
            {supervisors.length > 0 && <div className="team-supervisors">{supervisors.map((m) => <Member key={m.name} m={m} featured />)}</div>}
            {members.length > 0 && <div className="team-grid">{members.map((m) => <Member key={m.name} m={m} />)}</div>}
          </div>
        </section>
      )}

      <section className="home-section-tight">
        <div className="home-wrap">
          <div className="home-cta">
            <div>
              <h2>{a.cta_title}</h2>
              {a.cta_text && <p>{a.cta_text}</p>}
            </div>
            <div className="home-cta-actions">
              <Link href="/sign-up" className="public-btn public-btn-white">
                {sections.navigation.cta_label}
                <MaterialIcon name="arrow_forward" size={18} />
              </Link>
              <Link href="/contact" className="public-btn public-btn-ghost">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
