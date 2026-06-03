"use client";

import { useEffect, useState } from "react";

const systemMessages = [
  "Lectures become Somali notes",
  "Transcripts, quizzes, and chat",
  "AI workflow for every lesson",
];

const TYPE_DELAY_MS = 45;
const DELETE_DELAY_MS = 28;
const HOLD_DELAY_MS = 3000;

export default function HeroTypewriter() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visibleText, setVisibleText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentMessage = systemMessages[messageIndex];

    if (!isDeleting && visibleText === currentMessage) {
      const holdTimer = window.setTimeout(() => {
        setIsDeleting(true);
      }, HOLD_DELAY_MS);

      return () => window.clearTimeout(holdTimer);
    }

    if (isDeleting && visibleText === "") {
      const nextTimer = window.setTimeout(() => {
        setIsDeleting(false);
        setMessageIndex((current) => (current + 1) % systemMessages.length);
      }, 180);

      return () => window.clearTimeout(nextTimer);
    }

    const timer = window.setTimeout(
      () => {
        setVisibleText((current) =>
          isDeleting
            ? current.slice(0, -1)
            : currentMessage.slice(0, current.length + 1),
        );
      },
      isDeleting ? DELETE_DELAY_MS : TYPE_DELAY_MS,
    );

    return () => window.clearTimeout(timer);
  }, [isDeleting, messageIndex, visibleText]);

  return (
    <span className="eyebrow hero-typewriter" aria-live="polite">
      <span>{visibleText || "\u00a0"}</span>
    </span>
  );
}
