import type { StageItem } from "@/lib/site-content";
import { resolveAssetUrl } from "@/lib/site-content";
import { sampleNotes, sampleTranscript } from "../_home/sample";

// Illustrations of what each pipeline stage produces, shown when no screenshot is uploaded.
// They use the same sample lecture as the home page and are not real data.

function Wave({ n, seed }: { n: number; seed: number }) {
  return (
    <div className="wave" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const h = 18 + Math.abs(Math.sin(i * 0.7 + seed) * 46 + Math.sin(i * 1.9) * 12);
        return <i key={i} style={{ height: Math.round(h) }} />;
      })}
    </div>
  );
}

const Row = ({ children }: { children: React.ReactNode }) => <div className="mock-row">{children}</div>;
const Chip = ({ kind, children }: { kind?: "brand" | "good"; children: React.ReactNode }) => (
  <span className={`home-chip${kind ? ` ${kind}` : ""}`}>{children}</span>
);

const LIBRARY = ["Introduction to Database Systems", "Principles of Microeconomics: Supply and Demand", "Data Structures: Linked Lists"];

export default function StageMedia({ stage }: { stage: StageItem }) {
  const image = resolveAssetUrl(stage.image_url);
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="stage-image" src={image} alt={`${stage.title}: ${stage.name} stage`} />;
  }
  const k = stage.name.toLowerCase();

  if (k.startsWith("submit")) {
    return (
      <>
        <Row><Chip kind="brand">YouTube</Chip><span className="grow num">https://www.youtube.com/watch?v=…</span></Row>
        <Row><Chip>Upload</Chip><span className="grow">lecture_12_audio.webm</span><span className="muted num">38 MB</span></Row>
        <Row><span className="grow">Title: Introduction to Database Systems</span><span className="public-btn public-btn-primary mock-btn">Start processing</span></Row>
      </>
    );
  }
  if (k.startsWith("prepare")) {
    return (
      <>
        <div className="mock-log">
          <span>$ yt-dlp lecture … <b>✓</b> downloaded 52:14</span>
          <span>$ ffmpeg -i lecture.mp4 -vn audio.wav <b>✓</b></span>
          <span>split into 8-minute chunks <b>✓</b> 7 chunks</span>
        </div>
        <div className="chunks">{["0–8", "8–16", "16–24", "24–32", "32–40", "40–48"].map((x) => <span key={x}>{x}m</span>)}</div>
      </>
    );
  }
  if (k.startsWith("transcribe")) {
    return (
      <>
        <Wave n={48} seed={1} />
        {sampleTranscript.slice(1, 4).map(([t, l]) => (
          <Row key={t}><span className="num muted">{t}</span><span className="grow">{l}</span></Row>
        ))}
      </>
    );
  }
  if (k.startsWith("clean")) {
    return (
      <>
        <Row><Chip>chunk 3</Chip><span>+</span><Chip>chunk 4</Chip><span className="grow muted">joined in order</span><Chip kind="good">✓</Chip></Row>
        <Row><span className="grow">Repeated fragment removed: “so so the database”</span><Chip kind="good">✓</Chip></Row>
        <Row><span className="grow">Formatted into 14 readable paragraphs</span><Chip kind="good">✓</Chip></Row>
      </>
    );
  }
  if (k.startsWith("write")) {
    return (
      <div className="note-body">
        <h3>{sampleNotes.title}</h3>
        <p>{sampleNotes.summary}</p>
        <ul>{sampleNotes.points.slice(0, 3).map((p) => <li key={p}>{p}</li>)}</ul>
      </div>
    );
  }
  if (k.startsWith("check")) {
    return (
      <>
        <Row><span className="grow">Subject area</span><Chip kind="brand">Computer Science</Chip></Row>
        <Row><span className="grow">Confidence</span><Chip kind="good">High</Chip></Row>
        <Row><span className="grow">Flag for admin review</span><Chip>No</Chip></Row>
      </>
    );
  }
  if (k.startsWith("study")) {
    return (
      <>
        <div className="quiz-q">
          <b>Waa maxay DBMS?</b>
          <div className="opt right"><span className="k">B</span>Barnaamij maamula kaydka xogta</div>
        </div>
        <Row><Chip>Chat</Chip><span className="grow">Sharax primary key tusaale ahaan</span></Row>
        <Row><Chip>Listen</Chip><span className="grow">Voices: Ubax · Muuse</span><span>▶</span></Row>
      </>
    );
  }
  if (k.startsWith("save")) {
    return (
      <>
        {LIBRARY.map((t) => <Row key={t}><span className="grow">{t}</span><Chip kind="good">Completed</Chip></Row>)}
      </>
    );
  }
  return <Row><span className="grow">{stage.title}</span></Row>;
}
