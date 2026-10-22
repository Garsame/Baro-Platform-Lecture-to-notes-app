"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import MaterialIcon from "@/components/site/MaterialIcon";
import { resolveAssetUrl, youtubeId } from "@/lib/site-content";

const SCENES: [string, string, string[]][] = [
  ["Paste a lecture link", "Any public YouTube lecture or an uploaded recording.", ["youtube.com/watch?v=…", "Title: Introduction to Database Systems"]],
  ["BaroPlatform processes it", "Audio extracted, split into chunks and transcribed.", ["✓ preparing_media", "✓ extracting_audio", "● transcribing · chunk 4 of 7"]],
  ["Somali notes appear", "Summary, key points, detailed notes and key terms.", ["Qodobbada muhiimka ah", "– DBMS waa barnaamijka maamula kaydka xogta"]],
  ["Study with quiz and chat", "Check what you remember, then ask the lecture anything.", ["Q: Waa maxay DBMS?", "Chat: Sharax primary key tusaale ahaan"]],
];
const SCENE_SECONDS = 3;

type Props = { title: string; caption: string; src?: string; poster?: string; youtube?: string };

export default function IntroVideo({ title, caption, src = "", poster = "", youtube = "" }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const file = resolveAssetUrl(src);
  const cover = resolveAssetUrl(poster);
  const ytId = youtubeId(youtube);
  // An uploaded file wins over a YouTube link; with neither, the storyboard plays.
  const real: "file" | "youtube" | null = file ? "file" : ytId ? "youtube" : null;

  const [open, setOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const play = useCallback(() => {
    clearInterval(timer.current);
    const t0 = Date.now();
    setElapsed(0);
    timer.current = setInterval(() => {
      const el = (Date.now() - t0) / 1000;
      setElapsed(Math.min(el, SCENES.length * SCENE_SECONDS));
      if (el >= SCENES.length * SCENE_SECONDS) clearInterval(timer.current);
    }, 100);
  }, []);

  // The "Intro video" menu and footer links open the player with /?play=intro.
  useEffect(() => {
    // Only the home page handles the link; its video section is the target of the scroll.
    if (pathname !== "/" || params.get("play") !== "intro") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
    router.replace("/#intro-video", { scroll: false });
  }, [params, pathname, router]);

  useEffect(() => {
    if (!open || real) return;
    play();
    return () => clearInterval(timer.current);
  }, [open, real, play]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const scene = Math.min(SCENES.length - 1, Math.floor(elapsed / SCENE_SECONDS));

  return (
    <>
      <button
        type="button"
        className={`video-card${cover ? " has-poster" : ""}`}
        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
        onClick={() => setOpen(true)}
        aria-label="Play intro video"
      >
        <span className="vc-scenes" aria-hidden="true" hidden={!!cover}>
          <span className="vc-scene">1 · Paste a link</span>
          <span className="vc-scene">2 · Processing</span>
          <span className="vc-scene">3 · Somali notes</span>
          <span className="vc-scene">4 · Quiz and chat</span>
        </span>
        <span className="vc-play"><i><MaterialIcon name="play_arrow" size={22} filled /></i>Play intro</span>
        <span className="vc-dur">{caption}</span>
      </button>
      <span className="sr-only">{title}</span>
      {open && (
        <div className="video-modal" role="dialog" aria-modal="true" aria-label="Intro video" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="video-modal-card">
            <div className="mc-head">
              <b>{real ? title || "Intro video" : "Intro video · storyboard preview"}</b>
              {!real && <span className="home-muted">A recorded walkthrough is coming soon</span>}
              <button type="button" className="video-close" onClick={() => setOpen(false)} aria-label="Close"><MaterialIcon name="close" size={20} /></button>
            </div>
            {real === "file" && (
              <div className="player player-real">
                <video src={file ?? undefined} poster={cover ?? undefined} controls autoPlay playsInline preload="metadata" />
              </div>
            )}
            {real === "youtube" && (
              <div className="player player-real">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
                  title={title || "Intro video"}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            )}
            {!real && (
              <>
                <div className="player">
                  {SCENES.map(([t, p, box], i) => (
                    <div className={`scene${i === scene ? " on" : ""}`} key={t}>
                      <div>
                        <span className="home-eyebrow" style={{ color: "#9fd8ff" }}>Scene {i + 1} of {SCENES.length}</span>
                        <h3>{t}</h3>
                        <p>{p}</p>
                        <div className="sbox">{box.map((line) => <span key={line}>{line}</span>)}</div>
                      </div>
                    </div>
                  ))}
                  <div className="player-bar"><i style={{ width: `${(elapsed / (SCENES.length * SCENE_SECONDS)) * 100}%` }} /></div>
                </div>
                <div className="mc-head mc-foot">
                  <span className="home-muted">0:00 – 0:12 · auto-plays four scenes</span>
                  <button type="button" className="public-btn public-btn-ghost" onClick={play}>Replay</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
