"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MaterialIcon from "@/components/site/MaterialIcon";

type Props = {
  slides: React.ReactNode[];
  labels: string[];
  autoplay: boolean;
  seconds: number;
};

/** Rotating hero: the original hero stays slide 1; further slides announce news such as the publication. */
export default function HeroCarousel({ slides, labels, autoplay, seconds }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const count = slides.length;

  useEffect(() => {
    // Reading the media query needs the browser, so it is set after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);

  useEffect(() => {
    clearInterval(timer.current);
    if (!autoplay || reduced || paused || count < 2) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), seconds * 1000);
    return () => clearInterval(timer.current);
  }, [autoplay, reduced, paused, count, seconds, index]);

  return (
    <div
      className="hero-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hc-frame">
      {count > 1 && (
        <button type="button" className="hc-arrow hc-prev" onClick={() => go(index - 1)} aria-label="Previous slide"><MaterialIcon name="chevron_left" size={20} /></button>
      )}
      <div className="hc-stage" aria-live={autoplay && !paused && !reduced ? "off" : "polite"}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`hc-slide${i === index ? " on" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${labels[i] ?? ""}`}
            aria-hidden={i !== index}
            // inert keeps hidden slides out of the tab order
            {...(i !== index ? { inert: true } : {})}
          >
            {slide}
          </div>
        ))}
      </div>
      {count > 1 && (
        <button type="button" className="hc-arrow hc-next" onClick={() => go(index + 1)} aria-label="Next slide"><MaterialIcon name="chevron_right" size={20} /></button>
      )}
      </div>
      {count > 1 && (
        <div className="hc-controls">
          <div className="hc-dots" role="tablist" aria-label="Choose slide">
            {slides.map((_, i) => (
              <button key={i} type="button" role="tab" aria-selected={i === index} aria-label={labels[i] ?? `Slide ${i + 1}`} className={i === index ? "on" : ""} onClick={() => go(i)}>
                <span>{labels[i]}</span>
              </button>
            ))}
          </div>
          {autoplay && !reduced && (
            <button type="button" className="hc-btn" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Resume automatic rotation" : "Pause automatic rotation"} title={paused ? "Resume automatic rotation" : "Pause automatic rotation"}>
              <MaterialIcon name={paused ? "play_arrow" : "pause"} size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
