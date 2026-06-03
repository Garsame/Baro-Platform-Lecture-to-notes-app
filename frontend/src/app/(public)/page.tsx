import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdCloudUpload,
  MdAccountTree,
  MdAutoFixHigh,
  MdAutoAwesome,
  MdAnalytics,
  MdCoPresent,
  MdFactCheck,
  MdTranslate,
  MdLibraryBooks,
  MdMenuBook,
  MdOutlineChat,
  MdOutlineVideoSettings,
  MdQuiz,
  MdSpaceDashboard,
  MdTextSnippet,
  MdTune,
  MdUploadFile,
} from "react-icons/md";
import HeroTypewriter from "./HeroTypewriter";
import "./landing.css";

const metrics = [
  {
    icon: MdCloudUpload,
    value: "2 sources",
    title: "Accepted lecture inputs",
    label:
      "Students can begin with a YouTube lecture link or a local audio/video upload.",
  },
  {
    icon: MdAccountTree,
    value: "8 stages",
    title: "Visible processing journey",
    label:
      "Each lecture moves through tracked stages from source validation to saved study material.",
  },
  {
    icon: MdTranslate,
    value: "Somali-first",
    title: "Localized study output",
    label:
      "The final workspace focuses on Somali summaries, notes, quizzes, and revision support.",
  },
];

const stripItems = [
  {
    icon: MdTextSnippet,
    value: "Transcript",
    label:
      "Clean, searchable lecture text students can scan instead of replaying the whole recording.",
  },
  {
    icon: MdLibraryBooks,
    value: "Notes",
    label:
      "Structured Somali study notes with headings, explanations, and revision-friendly organization.",
  },
  {
    icon: MdQuiz,
    value: "Quiz",
    label:
      "Lecture-based questions that help students test recall after reviewing the material.",
  },
  {
    icon: MdOutlineChat,
    value: "Chat",
    label:
      "A lecture-aware chat space for asking follow-up questions from completed lessons.",
  },
];

const workflow = [
  {
    icon: MdUploadFile,
    number: "01",
    title: "Submit a lecture",
    description:
      "Students add a YouTube lecture or upload a local video or audio file into their private dashboard.",
  },
  {
    icon: MdOutlineVideoSettings,
    number: "02",
    title: "Prepare the media",
    description:
      "The system validates the source, captures captions when available, and prepares audio for AI processing.",
  },
  {
    icon: MdAutoFixHigh,
    number: "03",
    title: "Generate learning material",
    description:
      "AI transcription and note generation create Somali summaries, key points, and detailed study notes.",
  },
  {
    icon: MdMenuBook,
    number: "04",
    title: "Study and review",
    description:
      "Students open the lecture page to read notes, search the transcript, ask questions, and take quizzes.",
  },
];

const outputs = [
  {
    icon: MdAutoAwesome,
    title: "Somali summary",
    description:
      "A concise overview that helps students understand the lecture before deep study.",
  },
  {
    icon: MdLibraryBooks,
    title: "Detailed study notes",
    description:
      "Organized markdown notes with headings, explanations, and learning structure.",
  },
  {
    icon: MdFactCheck,
    title: "Key points",
    description:
      "Important ideas separated from the transcript so revision is faster and clearer.",
  },
  {
    icon: MdTune,
    title: "Lecture intelligence",
    description:
      "Subject labels, confidence signals, processing logs, and searchable lecture history.",
  },
];

const audiences = [
  {
    icon: MdSpaceDashboard,
    title: "For students",
    description:
      "Build a personal library of lecture notes, transcripts, summaries, and quizzes for faster revision.",
  },
  {
    icon: MdCoPresent,
    title: "For educators",
    description:
      "Turn recorded lessons into accessible Somali learning material that students can revisit anytime.",
  },
  {
    icon: MdAnalytics,
    title: "For admins",
    description:
      "Monitor users, lecture jobs, logs, job outcomes, and processing health from one admin workspace.",
  },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <section className="home-hero">
        <div className="public-container">
          <div className="hero-copy">
            <HeroTypewriter />
            <h1>BaroBadi AI Lecture Learning Platform</h1>
            <p>
              Transform long lecture videos into Somali transcripts, summaries,
              key points, detailed notes, chat support, and quiz-ready study
              material from one focused learning dashboard.
            </p>
            <div className="hero-actions">
              <Link href="/sign-up" className="public-btn public-btn-secondary">
                Create Account
              </Link>
              <Link href="/about" className="public-btn public-btn-ghost">
                Explore Platform
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src="/public-hero-somali-notes.png"
              alt="Students using BaroBadi AI lecture learning platform"
              width={1200}
              height={800}
              priority
            />
          </div>
        </div>
      </section>

      <section className="system-metrics-section" aria-label="Platform highlights">
        <div className="public-container">
          <div className="section-heading center metrics-heading">
            <span className="eyebrow">Platform snapshot</span>
            <h2>Lecture intake, processing, and study output.</h2>
            <p>
              This snapshot explains the three core parts of BaroBadi: where
              lecture content comes from, how the platform tracks it, and what
              students get back for revision.
            </p>
          </div>
          <div className="system-metrics-grid">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article className="system-metric-card" key={metric.title}>
                  <span className="metric-icon">
                    <Icon />
                  </span>
                  <div>
                    <small>{metric.value}</small>
                    <strong>{metric.title}</strong>
                    <span>{metric.label}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-strip" aria-label="Generated learning outputs">
        <div className="public-container">
          <div className="section-heading center strip-heading">
            <span className="eyebrow">Generated outputs</span>
            <h2>One lecture becomes four connected study tools.</h2>
            <p>
              After processing, every completed lecture becomes a practical
              study workspace with readable text, notes, practice questions,
              and lecture-specific chat support.
            </p>
          </div>
          <div className="output-map">
            {stripItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div className="output-map-item" key={item.value}>
                  <small>{`0${index + 1}`}</small>
                  <span className="strip-icon">
                    <Icon />
                  </span>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="public-section">
        <div className="public-container">
          <div className="section-heading center">
            <span className="eyebrow">Built for lecture-heavy learning</span>
            <h2>From recorded lesson to organized Somali study pack.</h2>
            <p>
              The platform reduces the manual work of watching, pausing,
              translating, summarizing, and rewriting lecture material by moving
              that work through a guided AI pipeline.
            </p>
          </div>
          <div className="workflow-grid">
            {workflow.map((item, index) => {
              const Icon = item.icon;
              return (
                <article className="step-card" key={item.title}>
                  <span className={`step-number ${index % 2 ? "accent" : ""}`}>
                    <Icon />
                  </span>
                  <small className="step-label">{item.number}</small>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="public-section public-section-soft">
        <div className="public-container split-section">
          <div className="section-heading">
            <span className="eyebrow">Learning outputs</span>
            <h2>Every completed lecture becomes a useful revision workspace.</h2>
            <p>
              Students get more than a transcript. They receive Somali material
              designed for review, recall, and follow-up questions.
            </p>
            <div className="section-actions">
              <Link href="/sign-up" className="public-btn public-btn-primary">
                Start Learning
              </Link>
              <Link href="/contact" className="public-btn public-btn-ghost">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="study-pack-shell">
            <div className="study-pack-header">
              <h3>Lecture study pack</h3>
              <span className="output-pill">AI generated</span>
            </div>
            <div className="study-pack-list">
              {outputs.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="study-pack-item" key={item.title}>
                    <span className="study-pack-icon">
                      <Icon />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
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
            <span className="eyebrow">Who it serves</span>
            <h2>A platform for learners, educators, and system managers.</h2>
            <p>
              BaroBadi supports the full learning journey: personal study,
              teaching support, and operational visibility for the people
              managing the system.
            </p>
          </div>
          <div className="audience-rail">
            {audiences.map((item, index) => {
              const Icon = item.icon;
              return (
                <article className="audience-item" key={item.title}>
                  <span className={`audience-icon ${index === 1 ? "accent" : ""}`}>
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

      <section className="public-section cta-band">
        <div className="public-container cta-inner">
          <div>
            <h2>Make every lecture easier to revise in Somali.</h2>
            <p>
              Create an account, add a lecture, and turn long video lessons into
              practical study material your future self can return to quickly.
            </p>
          </div>
          <div className="section-actions">
            <Link href="/sign-up" className="public-btn public-btn-secondary">
              Create Account
            </Link>
            <Link href="/about" className="public-btn public-btn-ghost">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
