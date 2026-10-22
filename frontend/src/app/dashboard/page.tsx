"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/site/MaterialIcon";
import { apiUrl, authHeaders, fetchCurrentUser, type AuthenticatedUser } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

interface Lecture {
  id: number;
  title: string;
  source_type: string;
  status: string;
  created_at: string;
}

const SOURCE_LABEL: Record<string, string> = { youtube: "YouTube", upload: "Upload", file: "Upload", audio: "Audio", video: "Video" };

function statusView(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "completed") return { label: "Completed", tone: "good", icon: "check_circle" };
  if (s === "failed") return { label: "Failed", tone: "bad", icon: "error" };
  return { label: "Processing", tone: "warn", icon: "progress_activity" };
}

function when(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function UserDashboard() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getSessionToken();
        const [me, res] = await Promise.all([
          token ? fetchCurrentUser(token).catch(() => null) : Promise.resolve(null),
          fetch(apiUrl("/api/v1/lectures/"), { headers: authHeaders(), cache: "no-store" }),
        ]);
        if (me) setUser(me);
        if (res.ok) setLectures(await res.json());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const recent = [...lectures].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const last = recent.find((l) => l.status?.toLowerCase() === "completed") ?? recent[0];
  const first = (user?.full_name || "").split(" ")[0];

  return (
    <div className="sa-page">
      <div className="sa-greet">
        <h1>Subax wanaagsan{first ? `, ${first}` : ""}</h1>
        <p>Pick up where you left off, or turn a new lecture into Somali notes.</p>
      </div>

      <div className="sa-qa-row">
        <Link href="/dashboard/new-lecture" className="sa-qa">
          <MaterialIcon name="add_circle" />
          <b>New lecture</b>
          <span>Paste a YouTube link or upload a file</span>
        </Link>
        {last && (
          <Link href={`/dashboard/lecture/${last.id}`} className="sa-qa">
            <MaterialIcon name="play_circle" />
            <b>Continue studying</b>
            <span>{last.title}</span>
          </Link>
        )}
        <Link href="/dashboard/quizzes" className="sa-qa">
          <MaterialIcon name="quiz" />
          <b>Take a quiz</b>
          <span>Test yourself on any lecture</span>
        </Link>
        <Link href="/#reviews" className="sa-qa">
          <MaterialIcon name="rate_review" />
          <b>Share your experience</b>
          <span>Write a review for the home page</span>
        </Link>
      </div>

      <div className="sa-row">
        <h2>Recent lectures</h2>
        <Link href="/dashboard/my-lectures">See all</Link>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading your lectures…</p>
      ) : recent.length === 0 ? (
        <div className="sa-empty">
          <MaterialIcon name="video_library" size={32} />
          <b>No lectures yet</b>
          <span>Add your first lecture and get Somali notes, a quiz and a lecture chat.</span>
          <Link href="/dashboard/new-lecture" className="sa-btn primary">New lecture</Link>
        </div>
      ) : (
        <div className="sa-grid">
          {recent.slice(0, 6).map((l) => {
            const st = statusView(l.status);
            return (
              <Link key={l.id} href={`/dashboard/lecture/${l.id}`} className="sa-lec">
                <span className="sa-thumb">{SOURCE_LABEL[(l.source_type || "").toLowerCase()] ?? l.source_type}</span>
                <span className="sa-lb">
                  <b>{l.title || "Untitled lecture"}</b>
                  <span>{when(l.created_at)}</span>
                  <span className={`sa-chip ${st.tone}`}><MaterialIcon name={st.icon} />{st.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
