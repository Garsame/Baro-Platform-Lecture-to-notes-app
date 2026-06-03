"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MdCheckCircle,
  MdCloudUpload,
  MdLink,
  MdOutlineOndemandVideo,
  MdUploadFile,
} from "react-icons/md";
import { apiUrl, authHeaders, getErrorMessage } from "@/lib/api";
import "./new-lecture.css";

export default function NewLecturePage() {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<"youtube" | "upload">("youtube");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (sourceType === "youtube") {
        const payload = {
          source_type: "youtube",
          source_url: url || "",
        };

        const res = await fetch(apiUrl("/api/v1/lectures/"), {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(
            await getErrorMessage(res, "Failed to submit YouTube lecture."),
          );
        }
      } else {
        if (!file) {
          throw new Error("Please select a file to upload.");
        }

        if (!title.trim()) {
          throw new Error("Please enter a lecture title for the uploaded video.");
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("file", file);

        const res = await fetch(apiUrl("/api/v1/lectures/upload"), {
          method: "POST",
          headers: authHeaders(),
          body: formData,
        });

        if (!res.ok) {
          throw new Error(
            await getErrorMessage(
              res,
              "Upload failed. Unsupported format or server error.",
            ),
          );
        }
      }

      router.push("/dashboard/my-lectures");
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during submission.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="new-lecture-page">
      <div className="new-lecture-heading">
        <div>
          <h1>Add New Lecture</h1>
          <p>Submit a YouTube lecture or upload a local file for Somali note generation.</p>
        </div>
      </div>

      <div className="new-lecture-layout">
        <aside className="new-lecture-guide">
          <span className="new-lecture-guide-icon">
            <MdOutlineOndemandVideo />
          </span>
          <h2>Lecture processing flow</h2>
          <p>
            BaroBadi validates the source, prepares the media, creates transcript text,
            and generates Somali study notes for your dashboard.
          </p>
          <div className="new-lecture-guide-list">
            <span>
              <MdCheckCircle /> Source validation
            </span>
            <span>
              <MdCheckCircle /> AI transcription
            </span>
            <span>
              <MdCheckCircle /> Somali notes and quiz material
            </span>
          </div>
        </aside>

        <section className="new-lecture-card">
          <div className="new-lecture-card-header">
            <div>
              <h2>Lecture source</h2>
              <p>Choose the input type that matches your lecture material.</p>
            </div>
          </div>

          {error && <div className="new-lecture-error">{error}</div>}

          <form className="new-lecture-form" onSubmit={handleSubmit}>
            <div className="new-lecture-tabs" role="tablist" aria-label="Lecture source type">
              <button
                type="button"
                onClick={() => setSourceType("youtube")}
                className={sourceType === "youtube" ? "active" : ""}
              >
                <MdLink /> YouTube Link
              </button>
              <button
                type="button"
                onClick={() => setSourceType("upload")}
                className={sourceType === "upload" ? "active" : ""}
              >
                <MdCloudUpload /> Video Upload
              </button>
            </div>

            {sourceType === "youtube" ? (
              <div className="new-lecture-fields">
                <label className="new-lecture-field">
                  <span>YouTube URL</span>
                  <input
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </label>
                <div className="new-lecture-note">
                  The lecture title is detected from YouTube automatically.
                </div>
              </div>
            ) : (
              <div className="new-lecture-fields">
                <label className="new-lecture-field">
                  <span>Lecture Title</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Introduction to Physics"
                    required
                  />
                </label>

                <label className="new-lecture-upload">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(event) =>
                      setFile(event.target.files ? event.target.files[0] : null)
                    }
                    required
                  />
                  <span className="new-lecture-upload-icon">
                    <MdUploadFile />
                  </span>
                  <strong>{file ? file.name : "Choose a video file"}</strong>
                  <small>
                    {file
                      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB selected`
                      : "MP4, MOV, WEBM, or any browser-supported video file"}
                  </small>
                </label>
              </div>
            )}

            <button type="submit" className="new-lecture-submit" disabled={isLoading}>
              {isLoading ? "Submitting to Processing Pipeline..." : "Submit Lecture"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
