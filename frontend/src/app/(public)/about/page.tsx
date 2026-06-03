import Link from "next/link";
import {
  MdAnalytics,
  MdAutoFixHigh,
  MdCollectionsBookmark,
  MdFactCheck,
  MdHub,
  MdLibraryAddCheck,
  MdManageSearch,
  MdOutlineVideoSettings,
  MdSmartToy,
  MdSpaceDashboard,
  MdTextSnippet,
  MdTranslate,
} from "react-icons/md";

const purposeCards = [
  {
    icon: MdTranslate,
    title: "Somali-first learning",
    description:
      "The platform helps students who understand Somali better than English study complex lectures with clearer local-language material.",
  },
  {
    icon: MdAutoFixHigh,
    title: "Less manual rewriting",
    description:
      "Students no longer need to watch, pause, translate, summarize, and organize every lecture by hand.",
  },
  {
    icon: MdCollectionsBookmark,
    title: "Reusable study library",
    description:
      "Processed lectures become searchable study resources with transcripts, notes, summaries, quizzes, and chat history.",
  },
];

const pipeline = [
  { icon: MdFactCheck, title: "Lecture source validation" },
  {
    icon: MdOutlineVideoSettings,
    title: "Media preparation and audio extraction",
  },
  { icon: MdTextSnippet, title: "AI transcription or caption capture" },
  { icon: MdManageSearch, title: "Transcript cleaning and organization" },
  { icon: MdAutoFixHigh, title: "Somali note generation and repair" },
  { icon: MdLibraryAddCheck, title: "Lecture analysis, categorization, and saving" },
];

const capabilities = [
  {
    icon: MdSpaceDashboard,
    title: "Student dashboard",
    description:
      "A private space for submitting lectures, monitoring status, opening notes, reviewing transcripts, and taking quizzes.",
  },
  {
    icon: MdSmartToy,
    title: "Lecture chatbot",
    description:
      "A question-answering layer that helps students revisit completed lecture material without leaving the lecture page.",
  },
  {
    icon: MdAnalytics,
    title: "Admin monitoring",
    description:
      "Operational visibility into users, lectures, jobs, outcomes, logs, and processing health signals.",
  },
  {
    icon: MdHub,
    title: "Local development stack",
    description:
      "FastAPI, Next.js, SQLite, and Celery work together so the platform can be run and demonstrated locally.",
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="public-section public-section-soft">
        <div className="public-container split-section">
          <div className="section-heading">
            <span className="eyebrow">About the platform</span>
            <h1>Built to make lecture revision faster for Somali learners.</h1>
            <p>
              BaroBadi is a full-stack AI learning platform that turns
              YouTube lectures and uploaded lecture files into Somali study
              material. It combines media processing, transcription, note
              generation, lecture chat, quizzes, and admin monitoring in one
              practical system.
            </p>
            <div className="section-actions">
              <Link href="/sign-up" className="public-btn public-btn-primary">
                Create Account
              </Link>
              <Link href="/contact" className="public-btn public-btn-ghost">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="panel process-panel">
            <div className="output-panel-header">
              <h3>System goal</h3>
              <span className="output-pill">Education AI</span>
            </div>
            <div className="feature-list feature-list-spaced">
              {pipeline.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <div className="feature-row" key={item.title}>
                    <span className="feature-check">
                      <Icon />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <span>Part of the lecture-to-notes workflow.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="section-heading center">
            <span className="eyebrow">Why it exists</span>
            <h2>The project solves a real study problem.</h2>
            <p>
              Long lecture videos are difficult to revise from quickly,
              especially when students need written Somali explanations. The
              platform turns those videos into learning material that is easier
              to review, search, organize, and reuse.
            </p>
          </div>
          <div className="purpose-stack">
            {purposeCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <article className="purpose-item" key={card.title}>
                  <span className={`purpose-icon ${index === 1 ? "accent" : ""}`}>
                    <Icon />
                  </span>
                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container split-section">
          <div className="pipeline-track-panel">
            <div className="pipeline-track-header">
              <h3>Processing pipeline</h3>
              <span className="output-pill">Tracked stages</span>
            </div>
            <ol className="pipeline-track">
              {pipeline.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li className="pipeline-stage" key={item.title}>
                    <span className="pipeline-stage-marker">
                      <Icon />
                      <small>{String(index + 1).padStart(2, "0")}</small>
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <span>
                        The system records progress so users and admins can see
                        where lecture processing stands.
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="section-heading">
            <span className="eyebrow">How it works</span>
            <h2>Each lecture moves through a guided AI workflow.</h2>
            <p>
              The backend creates lecture and job records, prepares media,
              captures or generates transcripts, produces Somali notes, analyzes
              the result, and saves the final study material for the student.
            </p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="section-heading center">
            <span className="eyebrow">Inside the system</span>
            <h2>Designed as a complete learning platform, not a single tool.</h2>
          </div>
          <div className="capability-matrix">
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <article className="capability-item" key={item.title}>
                  <span className={`capability-icon ${index === 1 ? "accent" : ""}`}>
                    <Icon />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
