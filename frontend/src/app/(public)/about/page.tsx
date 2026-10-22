import type { Metadata } from "next";
import Link from "next/link";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import MaterialIcon from "@/components/site/MaterialIcon";
import { resolveAssetUrl, type TeamMember } from "@/lib/site-content";
import { getSiteContent } from "@/lib/site-content.server";
import StageMedia from "./StageMedia";
import "../home.css";
import "./about.css";

export const metadata: Metadata = { title: "About" };

const initials = (name: string) =>
  name.replace(/^Dr\.?\s+/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

function Avatar({ m }: { m: TeamMember }) {
  const photo = resolveAssetUrl(m.photo_url);
  return (
    <span className="avatar">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" />
      ) : (
        initials(m.name)
      )}
    </span>
  );
}

function PersonLinks({ m }: { m: TeamMember }) {
  if (!m.linkedin && !m.github) return null;
  return (
    <div className="links">
      {m.linkedin && <a className="plink" href={m.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedinIn aria-hidden="true" />LinkedIn</a>}
      {m.github && <a className="plink" href={m.github} target="_blank" rel="noopener noreferrer"><FaGithub aria-hidden="true" />GitHub</a>}
    </div>
  );
}

const LEVEL_LABEL = { supervisor: "Supervisor", lead: "Lead", member: "Member" } as const;
const RANK = { supervisor: 0, lead: 1, member: 2 } as const;

export default async function AboutPage() {
  const { sections } = await getSiteContent();
  const a = sections.about;
  const t = sections.team;
  const ordered = t.members
    .map((m, i) => ({ m, i }))
    .sort((x, y) => RANK[x.m.level] - RANK[y.m.level] || x.i - y.i)
    .map((x) => x.m);
  const supervisors = ordered.filter((m) => m.level === "supervisor");
  const rest = ordered.filter((m) => m.level !== "supervisor");

  return (
    <div className="home-page about-page">
      <section className="about-hero ruled">
        <div className="home-wrap">
          <span className="home-eyebrow">About {sections.branding.site_name}</span>
          <h1>{a.headline}</h1>
          <p className="home-lede">{a.intro}</p>
          {a.stages.length > 0 && (
            <nav className="stage-index" aria-label="Pipeline stages">
              {a.stages.map((s, i) => (
                <a key={`${s.name}-${i}`} href={`#stage-${i}`}><span className="num muted">{i + 1}</span> {s.name}</a>
              ))}
            </nav>
          )}
        </div>
      </section>

      <section className="home-section-tight about-mission">
        <div className="home-wrap about-mission-grid">
          <h2>{a.mission_title}</h2>
          <p>{a.mission}</p>
        </div>
      </section>

      {a.stages.length > 0 && (
        <div className="home-wrap">
          <h2 className="sr-only">{a.stages_title}</h2>
          {a.stages.map((s, i) => (
            <section className="showcase" id={`stage-${i}`} key={`${s.name}-${i}`}>
              <div className="sc-text">
                <span className="stage-no">Stage {String(i + 1).padStart(2, "0")}{s.code ? ` · ${s.code}` : ""}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                {s.tech.length > 0 && <div className="tech-row">{s.tech.map((x) => <span className="home-chip" key={x}>{x}</span>)}</div>}
              </div>
              <div className="sc-media" aria-hidden="true"><StageMedia stage={s} /></div>
            </section>
          ))}
        </div>
      )}

      {t.members.length > 0 && (
        <section className="home-section about-team" id="team">
          <div className="home-wrap">
            <div className="home-section-head">
              <span className="home-eyebrow">The team</span>
              <h2>{t.title}</h2>
              {t.intro && <p>{t.intro}</p>}
            </div>
            {supervisors.map((m) => (
              <article className="supervisor" key={m.name}>
                <Avatar m={m} />
                <div className="supervisor-body">
                  <span className="home-chip brand">{LEVEL_LABEL[m.level]}</span>
                  <h3>{m.name}</h3>
                  <span className="role">{m.role}</span>
                  {m.bio && <p className="home-muted">{m.bio}</p>}
                  <PersonLinks m={m} />
                </div>
              </article>
            ))}
            {rest.length > 0 && (
              <div className="team-grid">
                {rest.map((m) => (
                  <article className="member" key={m.name}>
                    <Avatar m={m} />
                    <div>
                      <h3>{m.name}</h3>
                      <span className="role">{m.role}{m.level === "lead" ? " · Lead" : ""}</span>
                    </div>
                    {m.bio && <p>{m.bio}</p>}
                    <PersonLinks m={m} />
                  </article>
                ))}
              </div>
            )}
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
              <Link href="/sign-up" className="public-btn public-btn-white">{sections.navigation.cta_label}</Link>
              <Link href="/contact" className="public-btn public-btn-ghost">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
