"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaFileAudio,
  FaYoutube,
  FaRedoAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { apiUrl, authHeaders } from "@/lib/api";

interface AdminLecture {
  id: number;
  title?: string | null;
  owner_name?: string | null;
  owner_email?: string | null;
  source_type?: string | null;
  source_url?: string | null;
  source_link?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
  duration_seconds?: number | null;
  file_size_bytes?: number | null;
  job_progress_percent?: number | null;
  job_completed_at?: string | null;
  job_status?: string | null;
  job_stage?: string | null;
  job_error_message?: string | null;
  valuation_score?: number | null;
  valuation_label?: string | null;
  valuation_summary?: string | null;
  genre_label?: string | null;
  genre_explanation?: string | null;
}

function formatDuration(seconds?: number | null): string {
  if (seconds == null || Number.isNaN(seconds)) return "Unknown";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatFileSize(bytes?: number | null): string {
  if (bytes == null || Number.isNaN(bytes)) return "Unknown";
  const mb = bytes / (1024 * 1024);
  if (mb >= 100) return `${mb.toFixed(0)} MB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

const headerCellStyle: React.CSSProperties = {
  padding: "0.8rem 0.95rem",
  color: "var(--text-muted)",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const bodyCellStyle: React.CSSProperties = {
  padding: "0.82rem 0.95rem",
  color: "var(--text)",
  fontSize: "0.82rem",
  verticalAlign: "middle",
  borderTop: "1px solid var(--border)",
};

const truncateStyle: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

function formatDate(value?: string | null): string {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleString();
}

function formatScore(score?: number | null): string {
  return typeof score === "number" ? `${Math.round(score)}%` : "Pending";
}

function formatStatus(status: string): string {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function compactGenre(label?: string | null): string {
  const cleanLabel = (label || "").trim();
  if (!cleanLabel) return "Pending";
  return cleanLabel
    .split(/\s-\s|:|\./)[0]
    .trim() || cleanLabel;
}

function sourceLabel(sourceType?: string | null): "YouTube" | "Uploaded" {
  return sourceType === "youtube" ? "YouTube" : "Uploaded";
}

function sourceTone(sourceType?: string | null): {
  icon: React.ReactNode;
  background: string;
  color: string;
} {
  if (sourceType === "youtube") {
    return {
      icon: <FaYoutube size={15} />,
      background: "var(--primary-hover-translucent)",
      color: "var(--primary-hover)",
    };
  }

  return {
    icon: <FaFileAudio size={14} />,
    background: "var(--primary-translucent)",
    color: "var(--primary-color)",
  };
}

function statusTone(status: string): { background: string; color: string; border: string } {
  const normalized = status.toLowerCase();
  if (normalized === "completed") {
    return {
      background: "var(--primary-translucent)",
      color: "var(--primary-color)",
      border: "color-mix(in srgb, var(--primary-color) 24%, var(--border))",
    };
  }
  if (normalized.includes("fail") || normalized.includes("error")) {
    return {
      background: "var(--primary-hover-translucent)",
      color: "var(--primary-hover)",
      border: "color-mix(in srgb, var(--primary-hover) 24%, var(--border))",
    };
  }
  if (normalized.includes("cancel")) {
    return {
      background: "var(--admin-surface-soft)",
      color: "var(--text-muted)",
      border: "var(--border)",
    };
  }
  return {
    background: "var(--primary-hover-translucent)",
    color: "var(--primary-hover)",
    border: "color-mix(in srgb, var(--primary-hover) 24%, var(--border))",
  };
}

function scoreTone(score?: number | null): string {
  if (typeof score !== "number") return "var(--text-muted)";
  if (score >= 85) return "var(--primary-color)";
  if (score >= 65) return "var(--primary-hover)";
  return "var(--text-muted)";
}

function buildSourceHref(lecture: AdminLecture): string | null {
  if (lecture.source_type !== "youtube" || !lecture.source_link) return null;
  if (/^https?:\/\//i.test(lecture.source_link)) return lecture.source_link;
  return apiUrl(lecture.source_link);
}

export default function LecturesPage() {
  const [lectures, setLectures] = useState<AdminLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [reprocessingIds, setReprocessingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleReprocess = async (lectureId: number) => {
    if (reprocessingIds.has(lectureId)) return;
    
    setReprocessingIds((current) => {
      const next = new Set(current);
      next.add(lectureId);
      return next;
    });

    try {
      const res = await fetch(apiUrl(`/api/v1/admin/lectures/${lectureId}/reprocess`), {
        method: "POST",
        headers: authHeaders(),
      });
      if (res.ok) {
        const updated = await res.json();
        setLectures((current) =>
          current.map((lec) =>
            lec.id === lectureId ? { ...lec, status: updated.status, job_progress_percent: 0, job_stage: "validating_input", job_error_message: null } : lec
          )
        );
        showToast("Reprocessing triggered successfully!", "success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.detail || "Failed to trigger reprocessing.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while connecting to the server.", "error");
    } finally {
      setReprocessingIds((current) => {
        const next = new Set(current);
        next.delete(lectureId);
        return next;
      });
    }
  };

  const executeDelete = async (lectureId: number) => {
    setDeletingIds((current) => {
      const next = new Set(current);
      next.add(lectureId);
      return next;
    });

    try {
      const res = await fetch(apiUrl(`/api/v1/admin/lectures/${lectureId}`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setLectures((current) => current.filter((lec) => lec.id !== lectureId));
        setExpandedRows((current) => {
          const next = new Set(current);
          next.delete(lectureId);
          return next;
        });
        showToast("Lecture deleted successfully!", "success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.detail || "Failed to delete lecture.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while connecting to the server.", "error");
    } finally {
      setDeletingIds((current) => {
        const next = new Set(current);
        next.delete(lectureId);
        return next;
      });
      setDeleteConfirmId(null);
    }
  };

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const res = await fetch(apiUrl("/api/v1/admin/recent-lectures?limit=100"), {
          headers: authHeaders(),
          cache: "no-store",
        });
        if (res.ok) setLectures((await res.json()) as AdminLecture[]);
      } catch {
        console.error("Failed to load lecture oversight data");
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  const summary = useMemo(() => {
    const completed = lectures.filter((lecture) => lecture.status === "completed").length;
    const youtube = lectures.filter((lecture) => lecture.source_type === "youtube").length;
    const averageScoreValues = lectures
      .map((lecture) => lecture.valuation_score)
      .filter((score): score is number => typeof score === "number");
    const averageScore = averageScoreValues.length
      ? averageScoreValues.reduce((sum, score) => sum + score, 0) / averageScoreValues.length
      : null;

    return { completed, youtube, averageScore };
  }, [lectures]);

  const toggleRow = (lectureId: number) => {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(lectureId)) {
        next.delete(lectureId);
      } else {
        next.add(lectureId);
      }
      return next;
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Lecture Oversight</h1>
          <p style={{ margin: "0.35rem 0 0", color: "var(--text-muted)" }}>
            Compact lecture rows with source, owner, genre, status, correctness, link, and date.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <div className="admin-card card-lift" style={{ padding: "0.8rem 1rem", borderRadius: "8px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Total</div>
          <div style={{ marginTop: "0.25rem", fontSize: "1.3rem", fontWeight: 700, color: "var(--primary-color)" }}>{lectures.length}</div>
        </div>
        <div className="admin-card card-lift" style={{ padding: "0.8rem 1rem", borderRadius: "8px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Completed</div>
          <div style={{ marginTop: "0.25rem", fontSize: "1.3rem", fontWeight: 700, color: "var(--primary-color)" }}>{summary.completed}</div>
        </div>
        <div className="admin-card card-lift" style={{ padding: "0.8rem 1rem", borderRadius: "8px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>YouTube</div>
          <div style={{ marginTop: "0.25rem", fontSize: "1.3rem", fontWeight: 700, color: "var(--primary-hover)" }}>{summary.youtube}</div>
        </div>
        <div className="admin-card card-lift" style={{ padding: "0.8rem 1rem", borderRadius: "8px" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Avg Correctness</div>
          <div style={{ marginTop: "0.25rem", fontSize: "1.3rem", fontWeight: 700, color: scoreTone(summary.averageScore) }}>{formatScore(summary.averageScore)}</div>
        </div>
      </div>

      <section className="admin-card" style={{ overflow: "hidden", borderRadius: "8px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            padding: "0.9rem 1rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Showing {lectures.length} of {lectures.length} lectures
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "1.5rem", color: "var(--text-muted)" }}>Loading lectures...</div>
        ) : lectures.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No lectures have been submitted yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: "820px",
                borderCollapse: "collapse",
                tableLayout: "fixed",
                textAlign: "left",
              }}
            >
              <colgroup>
                <col style={{ width: "6%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "27%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "11%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={headerCellStyle} aria-label="More details" />
                  <th style={headerCellStyle}>Source</th>
                  <th style={headerCellStyle}>Lecture Title</th>
                  <th style={headerCellStyle}>Owner Name</th>
                  <th style={headerCellStyle}>Genre</th>
                  <th style={headerCellStyle}>Status</th>
                  <th style={headerCellStyle}>Correctness</th>
                </tr>
              </thead>
              <tbody>
                {lectures.map((lecture) => {
                  const source = sourceTone(lecture.source_type);
                  const status = statusTone(lecture.status);
                  const sourceHref = buildSourceHref(lecture);
                  const date = lecture.job_completed_at || lecture.updated_at || lecture.created_at;
                  const isExpanded = expandedRows.has(lecture.id);

                  return (
                    <React.Fragment key={lecture.id}>
                      <tr>
                        <td style={{ ...bodyCellStyle, paddingRight: 0 }}>
                          <button
                            type="button"
                            onClick={() => toggleRow(lecture.id)}
                            aria-label={isExpanded ? "Hide source link and date" : "Show source link and date"}
                            style={{
                              width: "30px",
                              height: "30px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              background: "transparent",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                            }}
                          >
                            {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                          </button>
                        </td>
                        <td style={bodyCellStyle}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.45rem",
                              maxWidth: "100%",
                              padding: "0.38rem 0.55rem",
                              borderRadius: "999px",
                              background: source.background,
                              color: source.color,
                              fontSize: "0.8rem",
                              fontWeight: 900,
                            }}
                          >
                            {source.icon}
                            {sourceLabel(lecture.source_type)}
                          </span>
                        </td>
                        <td style={{ ...bodyCellStyle, fontWeight: 600 }}>
                          <div title={lecture.title || "Untitled lecture"} style={truncateStyle}>
                            {lecture.title || "Untitled lecture"}
                          </div>
                        </td>
                        <td style={bodyCellStyle}>
                          <div title={lecture.owner_name || "Unknown"} style={{ ...truncateStyle, fontWeight: 500 }}>
                            {lecture.owner_name || "Unknown"}
                          </div>
                        </td>
                        <td style={bodyCellStyle}>
                          <div title={compactGenre(lecture.genre_label)} style={truncateStyle}>
                            {compactGenre(lecture.genre_label)}
                          </div>
                        </td>
                        <td style={bodyCellStyle}>
                          <span
                            style={{
                              display: "inline-flex",
                              padding: "0.35rem 0.55rem",
                              borderRadius: "999px",
                              border: `1px solid ${status.border}`,
                              background: status.background,
                              color: status.color,
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatStatus(lecture.status)}
                          </span>
                        </td>
                        <td style={{ ...bodyCellStyle, color: scoreTone(lecture.valuation_score), fontWeight: 700 }}>
                          {formatScore(lecture.valuation_score)}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={7}
                            style={{
                              padding: "1.2rem 1.5rem",
                              borderTop: "1px solid var(--border)",
                              background: "rgba(148, 163, 184, 0.05)",
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                gap: "1.5rem",
                                color: "var(--text)",
                                fontSize: "0.85rem",
                                marginBottom: "1rem",
                              }}
                            >
                              {/* Group 1: General Info */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>General Info</h3>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>LECTURE ID</div>
                                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text)" }}>{lecture.id}</div>
                                </div>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>SOURCE LINK</div>
                                  <div>
                                    {sourceHref ? (
                                      <a
                                        href={sourceHref}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: "var(--primary-color)", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                                      >
                                        Link <FaExternalLinkAlt size={10} />
                                      </a>
                                    ) : (
                                      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Uploaded File</span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>DATE CREATED</div>
                                  <div style={{ color: "var(--text)" }}>{formatDate(lecture.created_at)}</div>
                                </div>
                              </div>

                              {/* Group 2: Owner & Media */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Owner & Media Details</h3>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>OWNER</div>
                                  <div style={{ fontWeight: 600 }}>{lecture.owner_name || "Unknown"}</div>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{lecture.owner_email || "No email"}</div>
                                </div>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>DURATION</div>
                                  <div>{formatDuration(lecture.duration_seconds)}</div>
                                </div>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>FILE SIZE</div>
                                  <div>{formatFileSize(lecture.file_size_bytes)}</div>
                                </div>
                              </div>

                              {/* Group 3: Job Pipeline Status */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Pipeline Oversight</h3>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>STAGE</div>
                                  <div style={{ fontWeight: 600 }}>{lecture.job_stage ? formatStatus(lecture.job_stage) : "None"}</div>
                                </div>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>JOB STATUS</div>
                                  <div style={{ fontWeight: 600 }}>{lecture.job_status ? formatStatus(lecture.job_status) : "None"}</div>
                                </div>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>PROGRESS</div>
                                  <div>{lecture.job_progress_percent != null ? `${lecture.job_progress_percent}%` : "0%"}</div>
                                </div>
                              </div>

                              {/* Group 4: AI Valuation / Sentiment */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>AI Evaluation</h3>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>LABEL</div>
                                  <div style={{ fontWeight: 600, color: scoreTone(lecture.valuation_score) }}>{lecture.valuation_label || "No label"}</div>
                                </div>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>CORRECTNESS</div>
                                  <div style={{ fontWeight: 700 }}>{formatScore(lecture.valuation_score)}</div>
                                </div>
                                <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: "0.75rem" }}>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", fontWeight: 700 }}>EXPLANATION</div>
                                  <div title={lecture.valuation_summary || lecture.genre_explanation || ""} style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {lecture.valuation_summary || lecture.genre_explanation || "No AI evaluation summary generated."}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Job Error Message if failed */}
                            {lecture.job_error_message && (
                              <div
                                style={{
                                  padding: "0.75rem 1rem",
                                  borderRadius: "6px",
                                  background: "rgba(239, 68, 68, 0.08)",
                                  border: "1px solid rgba(239, 68, 68, 0.2)",
                                  color: "var(--primary-hover)",
                                  fontSize: "0.8rem",
                                  marginBottom: "1rem",
                                  fontWeight: 500,
                                }}
                              >
                                <strong style={{ textTransform: "uppercase", display: "block", marginBottom: "0.2rem", fontSize: "0.7rem", color: "var(--primary-hover)" }}>Pipeline Error Details</strong>
                                {lecture.job_error_message}
                              </div>
                            )}

                            {/* Administrative Controls */}
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.75rem",
                                borderTop: "1px solid var(--border)",
                                paddingTop: "1rem",
                                justifyContent: "flex-end",
                              }}
                            >
                              <button
                                type="button"
                                disabled={reprocessingIds.has(lecture.id) || deletingIds.has(lecture.id)}
                                onClick={() => handleReprocess(lecture.id)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                  padding: "0.45rem 0.85rem",
                                  borderRadius: "6px",
                                  border: "1px solid var(--primary-color)",
                                  background: reprocessingIds.has(lecture.id) ? "var(--border)" : "transparent",
                                  color: "var(--primary-color)",
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  cursor: reprocessingIds.has(lecture.id) ? "not-allowed" : "pointer",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <FaRedoAlt size={11} className={reprocessingIds.has(lecture.id) ? "animate-spin" : ""} />
                                {reprocessingIds.has(lecture.id) ? "Reprocessing..." : "Reprocess Lecture"}
                              </button>

                              <button
                                type="button"
                                disabled={reprocessingIds.has(lecture.id) || deletingIds.has(lecture.id)}
                                onClick={() => setDeleteConfirmId(lecture.id)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.4rem",
                                  padding: "0.45rem 0.85rem",
                                  borderRadius: "6px",
                                  border: "1px solid var(--primary-hover)",
                                  background: deletingIds.has(lecture.id) ? "var(--border)" : "var(--primary-hover)",
                                  color: "white",
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  cursor: deletingIds.has(lecture.id) ? "not-allowed" : "pointer",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <FaTrashAlt size={11} />
                                {deletingIds.has(lecture.id) ? "Deleting..." : "Delete Lecture"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Custom Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(6px)",
            padding: "1rem",
            animation: "fadeIn 0.2s ease-out forwards",
          }}
        >
          <div
            className="admin-card"
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "var(--bg-color)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              padding: "1.5rem",
              transform: "translateY(0)",
              animation: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-hover)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaTrashAlt size={18} /> Delete Lecture?
            </h3>
            <p style={{ margin: "1rem 0 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.5" }}>
              Are you sure you want to delete this lecture? This will permanently erase the video, audio files, transcript, notes, quizzes, and all attempts. This action CANNOT be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  padding: "0.55rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingIds.has(deleteConfirmId)}
                onClick={() => executeDelete(deleteConfirmId)}
                style={{
                  padding: "0.55rem 1.2rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--primary-hover)",
                  color: "white",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: deletingIds.has(deleteConfirmId) ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                {deletingIds.has(deleteConfirmId) ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.9rem 1.25rem",
            borderRadius: "12px",
            background: toast.type === "success" ? "rgba(16, 185, 129, 0.95)" : toast.type === "error" ? "rgba(239, 68, 68, 0.95)" : "rgba(59, 130, 246, 0.95)",
            backdropFilter: "blur(8px)",
            color: "white",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            fontSize: "0.9rem",
            fontWeight: 600,
            animation: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          {toast.type === "success" ? (
            <span style={{ fontSize: "1.1rem" }}>✓</span>
          ) : toast.type === "error" ? (
            <span style={{ fontSize: "1.1rem" }}>⚠</span>
          ) : (
            <span style={{ fontSize: "1.1rem" }}>ℹ</span>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
