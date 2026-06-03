"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api";
import { 
  MdPeople, 
  MdSchool, 
  MdAdminPanelSettings, 
  MdOutlineOndemandVideo, 
  MdCheckCircle, 
  MdHourglassEmpty, 
  MdQueue, 
  MdErrorOutline, 
  MdLibraryBooks, 
  MdTimer,
  MdCloudUpload
} from 'react-icons/md';
import { FaRocket } from 'react-icons/fa';

interface ChartDatum {
  label: string;
  value: number;
  color: string;
}

interface WeeklyTrend {
  date: string;
  submitted: number;
  completed: number;
  failed: number;
}

interface StageDatum {
  label: string;
  value: number;
}

interface AdminStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  learner_users: number;
  new_users_7d: number;
  total_lectures: number;
  lectures_7d: number;
  total_notes: number;
  completed_processing: number;
  failed_processing: number;
  processing_lectures: number;
  submitted_lectures: number;
  canceled_lectures: number;
  youtube_lectures: number;
  uploaded_lectures: number;
  automation_success_rate: number;
  note_conversion_rate: number;
  total_jobs: number;
  pending_jobs: number;
  running_jobs: number;
  successful_jobs: number;
  errored_jobs: number;
  canceled_jobs: number;
  completed_jobs_7d: number;
  average_job_seconds: number;
  job_status_breakdown: ChartDatum[];
  lecture_source_breakdown: ChartDatum[];
  active_stage_breakdown: StageDatum[];
  weekly_trend: WeeklyTrend[];
}

interface AdminRecentLecture {
  id: number;
  title?: string | null;
  owner_name?: string | null;
  owner_email?: string | null;
  source_type?: string | null;
  status: string;
  created_at: string;
}

interface MetricCard {
  label: string;
  value: string;
  accent: string;
  translucentBg: string;
  icon: React.ReactNode;
  context: string;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function formatPercent(value: number): string {
  return `${value}%`;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "0m";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m ${remainingSeconds}s`;
}

function statusStyle(status: string): { background: string; color: string } {
  const normalized = status.toLowerCase();
  if (normalized === "completed") {
    return { background: "var(--primary-translucent)", color: "var(--primary-color)" };
  }
  if (normalized.includes("fail") || normalized.includes("error")) {
    return { background: "var(--primary-hover-translucent)", color: "var(--primary-hover)" };
  }
  if (normalized.includes("cancel")) {
    return { background: "var(--admin-surface-soft)", color: "var(--text-color)" };
  }
  return { background: "var(--primary-hover-translucent)", color: "var(--primary-hover)" };
}

function labelFromStage(label: string): string {
  return label.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sourceLabel(sourceType?: string | null): string {
  if (!sourceType) return "Unknown";
  return sourceType.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function HorizontalBarChart({ data }: { data: ChartDatum[] }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const palette = ["var(--primary-color)", "var(--primary-hover)", "var(--text-color)"];

  return (
    <div className="admin-outcome-chart">
      <div className="admin-outcome-stack" aria-hidden="true">
        {data.map((item, index) => {
          const share = total > 0 ? Math.max(3, (item.value / total) * 100) : 100 / Math.max(data.length, 1);
          return (
            <span
              key={item.label}
              style={{
                flexBasis: `${share}%`,
                background: palette[index % palette.length],
              }}
            />
          );
        })}
      </div>

      <div className="admin-distribution-list">
      {data.map((item, index) => {
        const width = `${Math.max(4, (item.value / maxValue) * 100)}%`;
        const share = total > 0 ? Math.round((item.value / total) * 100) : 0;
        const fill = palette[index % palette.length];

        return (
          <div
            className="admin-distribution-row"
            key={item.label}
            style={{ "--row-color": fill } as React.CSSProperties}
          >
            <header>
              <span className="admin-distribution-label">
                <i />
                <strong>{item.label}</strong>
              </span>
              <span style={{ color: "var(--text-color)", whiteSpace: "nowrap" }}>
                {formatNumber(item.value)} - {share}%
              </span>
            </header>
            <div className="admin-progress-track">
              <div className="admin-progress-fill" style={{ width, background: fill }} />
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function WeeklyTrendChart({ data }: { data: WeeklyTrend[] }) {
  const series: Array<{
    key: keyof Pick<WeeklyTrend, "submitted" | "completed" | "failed">;
    label: string;
    color: string;
  }> = [
    { key: "submitted", label: "Submitted", color: "var(--primary-hover)" },
    { key: "completed", label: "Completed", color: "var(--primary-color)" },
    { key: "failed", label: "Failed", color: "var(--text-color)" },
  ];
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.submitted, item.completed, item.failed]),
  );
  const totals = series.map((item) => ({
    ...item,
    value: data.reduce((sum, day) => sum + day[item.key], 0),
  }));

  return (
    <div className="admin-workload-chart" role="img" aria-label="Seven day lecture and job trend">
      <div className="admin-workload-summary">
        {totals.map((item) => (
          <span key={item.key} style={{ "--series-color": item.color } as React.CSSProperties}>
            <i />
            <strong>{formatNumber(item.value)}</strong>
            {item.label}
          </span>
        ))}
      </div>

      <div className="admin-workload-plot">
        {data.map((day) => (
          <div className="admin-workload-day" key={day.date}>
            <div className="admin-workload-bars">
              {series.map((item) => {
                const value = day[item.key];
                const height = value > 0 ? Math.max(8, (value / maxValue) * 100) : 2;
                return (
                  <span
                    className="admin-workload-bar"
                    key={item.key}
                    title={`${item.label}: ${value}`}
                    style={{
                      height: `${height}%`,
                      background: item.color,
                      opacity: value > 0 ? 1 : 0.28,
                    }}
                  />
                );
              })}
            </div>
            <time>
              {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </time>
          </div>
        ))}
      </div>

      <div className="admin-chart-legend">
        {series.map((item) => (
          <span key={item.key}>
            <i className="admin-legend-dot" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [lectures, setLectures] = useState<AdminRecentLecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, lecturesRes] = await Promise.all([
          fetch(apiUrl("/api/v1/admin/stats"), { headers: authHeaders(), cache: "no-store" }),
          fetch(apiUrl("/api/v1/admin/recent-lectures?limit=10"), { headers: authHeaders(), cache: "no-store" }),
        ]);

        if (statsRes.ok) {
          setStats((await statsRes.json()) as AdminStats);
        }
        if (lecturesRes.ok) {
          setLectures((await lecturesRes.json()) as AdminRecentLecture[]);
        }
      } catch {
        console.error("Failed to load admin dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const metrics = useMemo<MetricCard[]>(() => {
    if (!stats) return [];

    return [
      { label: "Total Users", value: formatNumber(stats.total_users), accent: "var(--primary-color)", translucentBg: "var(--primary-translucent)", icon: <MdPeople size={22} />, context: `${formatNumber(stats.active_users)} active accounts` },
      { label: "Learners", value: formatNumber(stats.learner_users), accent: "var(--primary-hover)", translucentBg: "var(--primary-hover-translucent)", icon: <MdSchool size={22} />, context: `${formatNumber(stats.new_users_7d)} joined in 7 days` },
      { label: "Administrators", value: formatNumber(stats.admin_users), accent: "var(--primary-color)", translucentBg: "var(--primary-translucent)", icon: <MdAdminPanelSettings size={22} />, context: "Portal operators" },
      { label: "Total Lectures", value: formatNumber(stats.total_lectures), accent: "var(--primary-hover)", translucentBg: "var(--primary-hover-translucent)", icon: <MdOutlineOndemandVideo size={22} />, context: `${formatNumber(stats.lectures_7d)} submitted in 7 days` },
      { label: "Completed Lectures", value: formatNumber(stats.completed_processing), accent: "var(--primary-color)", translucentBg: "var(--primary-translucent)", icon: <MdCheckCircle size={22} />, context: "Ready for users" },
      { label: "Currently Processing", value: formatNumber(stats.processing_lectures), accent: "var(--primary-hover)", translucentBg: "var(--primary-hover-translucent)", icon: <MdHourglassEmpty size={22} />, context: `${formatNumber(stats.running_jobs)} active jobs` },
      { label: "Pending Lectures", value: formatNumber(stats.submitted_lectures), accent: "var(--primary-hover)", translucentBg: "var(--primary-hover-translucent)", icon: <MdQueue size={22} />, context: `${formatNumber(stats.pending_jobs)} jobs waiting` },
      { label: "Failed Lectures", value: formatNumber(stats.failed_processing), accent: "var(--primary-color)", translucentBg: "var(--primary-translucent)", icon: <MdErrorOutline size={22} />, context: "Need admin review" },
      { label: "Notes Generated", value: formatNumber(stats.total_notes), accent: "var(--primary-color)", translucentBg: "var(--primary-translucent)", icon: <MdLibraryBooks size={22} />, context: `${formatPercent(stats.note_conversion_rate)} note conversion` },
      { label: "Pipeline Success", value: formatPercent(stats.automation_success_rate), accent: "var(--primary-hover)", translucentBg: "var(--primary-hover-translucent)", icon: <FaRocket size={20} />, context: `${formatNumber(stats.completed_jobs_7d)} jobs completed in 7 days` },
      { label: "Average Job Time", value: formatDuration(stats.average_job_seconds), accent: "var(--primary-hover)", translucentBg: "var(--primary-hover-translucent)", icon: <MdTimer size={22} />, context: "Completed job average" },
      { label: "Source Mix", value: `${formatNumber(stats.youtube_lectures)} / ${formatNumber(stats.uploaded_lectures)}`, accent: "var(--primary-color)", translucentBg: "var(--primary-translucent)", icon: <MdCloudUpload size={22} />, context: "YouTube / uploads" },
    ];
  }, [stats]);

  if (loading || !stats) {
    return <div style={{ opacity: 0.5 }}>Loading system intelligence...</div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <span className="admin-page-kicker">Admin intelligence</span>
          <h1 className="admin-page-title">System Overview</h1>
          <p className="admin-page-lede">
            Operational health, workload, users, lecture generation, and job performance.
          </p>
        </div>
        <div className="admin-chart-pill">
          Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "0.95rem", marginBottom: "1.35rem" }}>
        {metrics.map((metric) => (
          <div 
            key={metric.label} 
            className="admin-card admin-stat-card card-lift"
            style={{
              "--stat-accent": metric.accent,
              "--stat-bg": metric.translucentBg,
            } as React.CSSProperties}
          >
            <div className="admin-stat-main">
              <div>
                <div className="admin-stat-value">{metric.value}</div>
                <div className="admin-stat-title">{metric.label}</div>
              </div>
              <div className="admin-stat-icon">
                {metric.icon}
              </div>
            </div>

            <div className="admin-stat-divider" />

            <div className="admin-stat-footer">
              <span>{metric.context}</span>
              <span className="admin-stat-action">View</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <section className="admin-card admin-chart-card">
          <div className="admin-chart-head">
            <div>
              <h2 className="admin-panel-title">7-Day Workload Trend</h2>
              <p className="admin-panel-copy">Submitted lectures versus completed and failed jobs.</p>
            </div>
            <span className="admin-chart-pill">7 days</span>
          </div>
          <WeeklyTrendChart data={stats.weekly_trend} />
        </section>

        <section className="admin-card admin-chart-card">
          <div className="admin-chart-head">
            <div>
              <h2 className="admin-panel-title">Job Outcome Distribution</h2>
              <p className="admin-panel-copy">Cleared jobs, active work, and failure risk.</p>
            </div>
            <span className="admin-chart-pill">{formatNumber(stats.total_jobs)} jobs</span>
          </div>
          <HorizontalBarChart data={stats.job_status_breakdown} />
        </section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        <section className="admin-card admin-chart-card">
          <div className="admin-chart-head">
            <div>
              <h2 className="admin-panel-title">Processing Signals</h2>
              <p className="admin-panel-copy">Source mix and currently active pipeline stages.</p>
            </div>
          </div>
          <div className="admin-signal-list">
            <div className="admin-signal-row">
              <header>
                <strong>YouTube lectures</strong>
                <span>{formatNumber(stats.youtube_lectures)}</span>
              </header>
              <div className="admin-progress-track">
                <div className="admin-progress-fill" style={{ width: `${stats.total_lectures ? (stats.youtube_lectures / stats.total_lectures) * 100 : 0}%`, background: "var(--primary-color)" }} />
              </div>
            </div>
            <div className="admin-signal-row">
              <header>
                <strong>Uploaded lectures</strong>
                <span>{formatNumber(stats.uploaded_lectures)}</span>
              </header>
              <div className="admin-progress-track">
                <div className="admin-progress-fill" style={{ width: `${stats.total_lectures ? (stats.uploaded_lectures / stats.total_lectures) * 100 : 0}%` }} />
              </div>
            </div>
            <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.75rem" }}>Active Job Stages</div>
              {stats.active_stage_breakdown.length === 0 ? (
                <div style={{ color: "var(--text-muted)" }}>No jobs are running right now.</div>
              ) : (
                stats.active_stage_breakdown.map((stage) => (
                  <div key={stage.label} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.5rem 0", color: "var(--text)" }}>
                    <span>{labelFromStage(stage.label)}</span>
                    <strong>{formatNumber(stage.value)}</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="admin-card admin-lecture-panel">
          <div className="admin-lecture-head">
            <div>
              <h2 className="admin-panel-title">Lecture Overview</h2>
              <p className="admin-panel-copy">Latest generated and submitted lectures with owner and status.</p>
            </div>
            <span className="admin-chart-pill">{lectures.length} recent</span>
          </div>

          <div className="admin-lecture-list">
            {lectures.map((lecture, index) => {
              const tone = statusStyle(lecture.status);
              return (
                <article className="admin-lecture-row" key={lecture.id}>
                  <span className="admin-lecture-index">{String(index + 1).padStart(2, "0")}</span>
                  <div className="admin-lecture-main">
                    <strong>{lecture.title || "Untitled lecture"}</strong>
                    <span>
                      {lecture.owner_name || "Unknown owner"} · {lecture.owner_email || "No email"}
                    </span>
                  </div>
                  <div className="admin-lecture-meta">
                    <span className="admin-source-pill">{sourceLabel(lecture.source_type)}</span>
                    <span className="admin-badge" style={{ background: tone.background, color: tone.color }}>
                      {lecture.status}
                    </span>
                    <time>{new Date(lecture.created_at).toLocaleString()}</time>
                  </div>
                </article>
              );
            })}
            {lectures.length === 0 && (
              <div className="admin-lecture-empty">No lectures have been submitted yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
