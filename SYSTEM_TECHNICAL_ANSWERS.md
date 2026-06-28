# BaroBadi AI Platform - Technical Specifications & Answers

This document provides complete, accurate, and codebase-verified answers to technical questions regarding the system architecture, dependencies, and configuration.

---

## 1. Database
* **Database System:** **PostgreSQL** is the active database engine configured in the environment (`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/somali_notes_db` inside `backend/.env`).
* **Hosting:** It is hosted **locally** on the developer's machine on port 5432.
* **ORM / Database Library:** Managed using **SQLAlchemy** as the Python ORM, and database schema migrations are managed using **Alembic**.
* *Note:* While `sql_app.db` exists in the folder structure, it is a leftover file from an earlier SQLite setup. The active system connects to PostgreSQL.

---

## 2. Background Processing
* **Active Default:** **FastAPI Native `BackgroundTasks`** is the active runner.
* **Configuration:** In `backend/.env`, `USE_CELERY=False` is set.
* **Logic:** When `USE_CELERY` is set to `False`, the backend skips Celery brokers and runs processing jobs inside FastAPI's native, in-process background thread pool. While Celery worker logic is fully written in the code (with SQLite broker queues), it is disabled locally to prevent Windows multiprocessing conflicts.

---

## 3. Media Processing
* **yt-dlp:** Yes, fully integrated and used in `backend/app/services/youtube_service.py` to extract video titles, durations, check for existing subtitles/captions, and download raw video/audio media.
* **FFmpeg:** Yes, wrapped by the Python `ffmpeg-python` library and used in `backend/app/services/media_service.py` to extract audio from video uploads and split large audio files into smaller, speech-optimized WAV files (16kHz, mono-channel).
* **Status:** Both are confirmed working and fully integrated into the ingestion pipeline.

---

## 4. Transcription
* **Model Name:** **OpenAI Whisper (`whisper-1`)** is the primary transcription model.
* **Configuration:** Active via `USE_OPENAI_FOR_TRANSCRIPTION=True` inside `backend/.env`.
* **End-to-End Operation:** Yes. Audio files are split into chunks (configured to 30-minute intervals in `backend/.env` using `TRANSCRIPTION_CHUNK_SECONDS=1800`) to stay within API file size limits. Chunks are sent to the OpenAI API and compiled back into a single cleaned transcript.

---

## 5. Note Generation
* **Gemini Models:** 
  * **Primary:** `gemini-2.5-flash-lite` (defined as `GEMMA_MODEL` in `.env`).
  * **Fallback:** `gemini-2.5-flash` (defined as `GEMINI_CHAT_MODEL` in `.env`).
* **Fallback Logic:** Yes, fully implemented and working. In `note_generation_service.py`, `_generate_content_with_fallback` iterates through the model list. If `gemini-2.5-flash-lite` fails with a transient 503 "High Demand" or 429 "Rate Limit" error, the system automatically falls back to `gemini-2.5-flash` in the background.

---

## 6. Quiz Feature
* **Generation Model:** Google Gemini (`gemini-2.5-flash`), configured to use Structured JSON Output via Pydantic (`QuizPayload`).
* **Operation:** 
  1. The system extracts the lecture transcript and notes, sending them to Gemini to create 5 to 10 Somali questions (Multiple Choice or True/False).
  2. The student takes the quiz in the React frontend, selecting their answers.
  3. The backend grades the answers programmatically by comparing the student's selections with the correct answer key.
  4. The graded answers are sent to Gemini 2.5 Flash to generate a custom, encouraging study feedback summary in Somali.

---

## 7. Audio Playback of Notes
* **Text-to-Speech Engine:** **Azure Cognitive Services Speech SDK** (`azure-cognitiveservices-speech`).
* **Somali Neural Voices:** 
  * `so-SO-UbaxNeural` (Female voice)
  * `so-SO-MuuseNeural` (Male voice)
* **Operation:** In `speech_service.py`, the system cleans notes of markdown syntax, splits the text into chunks of under 3000 characters to bypass Azure's timeout limits, synthesizes each chunk, concatenates the resulting MP3 bytes, and writes them to an audio file on disk.

---

## 8. Notes Library
* **Implementation:** Fully implemented.
* **Subject Categorization:** Automatically determined during note generation by the AI evaluator (`lecture_analysis_service.py`), which assigns the lecture to a broad library category.
* **Available Categories:**
  * `AI & Machine Learning`
  * `Software Development`
  * `Cloud & Infrastructure`
  * `Business & Management`
  * `Health & Medicine`
  * `Science & Engineering`
  * `Education & Learning`
  * `Arts & Humanities`
  * `Social Sciences`
  * `Other Subjects`
* **Frontend Matching:** If the category is missing in the database, the frontend matches keywords in the title or genre label to sort them dynamically.

---

## 9. Security
* **Authentication Method:** JSON Web Tokens (JWT) using the `HS256` signing algorithm, with a token lifetime of 8 days (`ACCESS_TOKEN_EXPIRE_MINUTES = 11520`).
* **Password Policy:** Minimum length of 8 characters enforced on signup and profile forms (both frontend and backend).
* **Brute Force Protection:** Temporary account lockout for **15 minutes** after **4 consecutive failed login attempts** (tracked in `users` table).
* **OTP Verification limits:** A maximum of **5 incorrect OTP attempts** is allowed before the code is permanently deleted from the database.
* **File Upload Validation:** Dual-layer magic-byte checks. The frontend reads file headers using the HTML5 `FileReader` API, and the backend verifies the first 256 bytes signature (MP4, WebM, AVI, FLV, etc.) to prevent extension renaming bypasses. Enforces a **500MB size limit**.
* **Session Management:** Client-side event listeners track activity; if a user remains inactive for **30 minutes**, they are automatically logged out.

---

## 10. Admin Panel Features
The admin panel is fully functional and supports:
* **Dashboard Overview:** Displays metrics for users, active users, roles, lecture processing statistics (completed, failed, canceled, submitted), YouTube vs upload mix, job statuses, average job durations, active stages, and a weekly activity trend.
* **Lecture Monitoring:** View all lectures created by any user, including source URL, owner email, file details, processing progress, and AI evaluation metrics.
* **System logs:** View login events, signups, and successfully generated lectures.
* **User Management:** Search, list, create, edit role, update password, activate/deactivate, or delete user accounts.
* **Support Inquiries:** View contact messages, mark read/unread, delete, or directly send email replies to users via the backend SMTP.

---

## 11. Frontend
* **Framework:** Next.js (React), TypeScript, vanilla CSS/CSS modules, and React Icons.
* **Working Pages:**
  * Public Landing/Home (`/(public)/page.tsx`)
  * About Page (`/(public)/about/page.tsx`)
  * Contact Page (`/(public)/contact/page.tsx`)
  * Login/Signup & Admin Login (`/(public)/sign-in`, `/sign-up`, `/admin-login`)
  * My Lectures Dashboard (`/(user)/dashboard/my-lectures/page.tsx`)
  * New Lecture Submission Page (`/(user)/dashboard/new-lecture/page.tsx`)
  * Lecture Details & Coach Chat (`/(user)/dashboard/lecture/[id]/page.tsx`)
  * Notes Library Page (`/(user)/dashboard/notes/page.tsx`)
  * Quizzes Dashboard (`/(user)/dashboard/quizzes/page.tsx`)
  * Quiz Attempt Page (`/(user)/dashboard/quizzes/[id]/page.tsx`)
  * Student Profile Settings (`/(user)/dashboard/profile/page.tsx`)
  * Admin Dashboard and all sub-management tabs.

---

## 12. Deployment
* **Status:** The system is **currently running locally** for development and has not been deployed to a live cloud platform.
* **Hosts:** Backend runs on `http://127.0.0.1:8000` (FastAPI) and frontend on `http://localhost:3000` (Next.js), connecting to a local PostgreSQL instance.

---

## 13. Planned But NOT Yet Implemented Features
* **Password Reset via Email:** The backend does not have support for password reset links or codes; users must contact an admin to have their passwords updated in the database.
* **Admin System Settings:** The `/admin/settings` route exists, but is a static placeholder page without interactive sliders or configuration inputs.
* **Scale-Out Production Worker Queue:** The Celery framework is implemented, but is disabled locally in favor of native background threads to bypass Windows compatibility issues. Deploying to production at scale would require turning Celery back on and integrating a Redis container.
