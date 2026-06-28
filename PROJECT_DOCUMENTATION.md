# Somali Lecture Platform - Application Documentation

This document gives you a complete overview of the application, how its parts fit together, and a step-by-step guide on how to interact with the platform.

## 1. High-Level Architecture
This application is designed to take video lectures (either YouTube links or direct uploads) and generate Somali notes. It's built with two main components:
- **Frontend**: A modern user interface built using Next.js (React). It runs by default on `http://localhost:3000`.
- **Backend**: An API built with FastAPI (Python) that handles the logic, interacts with a SQLite database, and hands off long-running tasks like audio transcription and note generation to a background worker (Celery). It runs on `http://localhost:8000`.

## 2. Where Everything Is (Folder Structure)

### Frontend (`frontend/src/app`)
The frontend uses the Next.js App Router framework. The UI routes are organized into matching URL structures.
- **`/(public)`**: Contains the landing page (`page.tsx`) and public-facing styling (e.g. `landing.css`, `public.css`). Users see this when they are not logged in.
- **`/(user)/dashboard`**: The core application UI once a user is inside the app.
  - **`/my-lectures`**: The dashboard view that displays a list of all processed or processing lectures.
  - **`/new-lecture`**: The form page where a user can enter a video title and either paste a YouTube link or upload a video file.
  - **`/lecture`**: The detailed view for a single lecture where notes and video playback are shown.
- **`/(admin)`**: Reserved for administrative interfaces (e.g., managing users or system settings).

### Backend (`backend/app`)
The backend is neatly structured around domain-driven design principles.
- **`/api/routers`**: Contains `auth.py` (handles user login/signup) and `lectures.py` (receives requests to add or view lectures).
- **`/models`**: Defines the database schemas (e.g., `lecture.py`, `transcript.py`, `note.py`). This dictates how data is stored in the `sql_app.db` SQLite database.
- **`/schemas`**: Pydantic models (`token.py`, etc.) used to validate the data going in and out of the API.
- **`/services`**: The business logic of the app. This is where the heavy lifting occurs:
  - `youtube_service.py`: Downloads audio/video from YouTube links.
  - `media_service.py`: Processes and compresses uploaded local video files.
  - `transcription_service.py`: Converts the audio files into text transcripts.
  - `note_generation_service.py`: Converts the written text transcript into summarized Somali notes.
- **`/jobs`**: The background task pipeline logic (`celery_app.py`, `worker.py`, `pipeline.py`). Instead of making the user wait hours staring at a loading spinner on the webpage, long tasks are sent here so the user can see a "Processing" status and check back later.

## 3. How to Use the App (Step-by-Step User Guide)

Here is a typical workflow on how a user interacts with the application, one page at a time:

### Step 1: Navigating to the App & Logging In
1. Start both servers (`npm run dev` in the frontend and your python server runner in the backend).
2. Open `http://localhost:3000` in your browser.
3. You will land on the public landing page (`/(public)/page.tsx`) showcasing the app features.
4. Proceed to log in or sign up to gain access to the secure dashboard.

### Step 2: The Dashboard (`/dashboard/my-lectures`)
1. Upon logging in, you will be directed to your dashboard view.
2. Here, you will see a list of all your previously submitted lectures, their titles, and their current processing status (e.g., "Processing", "Completed", "Failed").

### Step 3: Submitting a New Lecture (`/dashboard/new-lecture`)
1. Click the "Add New Lecture" button which will navigate you to the `new-lecture` page.
2. **Lecture Title**: Enter a descriptive and recognizable title for the lecture (e.g., "Introduction to Physics").
3. **Source Type**: 
   - **YouTube Link**: Select this if you have a video from YouTube. Provide the full YouTube URL.
   - **Video Upload**: Select this if you have the video file on your computer. Use the file input button to select your video file.
4. **Submit**: Click the "Submit Lecture for Processing" button.
5. The frontend sends this file or link to the FastAPI server (`http://localhost:8000/api/v1/lectures/`). The server saves the lecture in the database, returns a "Success" message to the frontend, and immediately delegates the heavy media processing to the Celery background worker pipelines (`youtube_service` -> `transcription_service` -> `note_generation_service`).

### Step 4: Monitoring Progress & Viewing Notes (`/dashboard/lecture`)
1. After successfully submitting a lecture, you will automatically be redirected back to the `/dashboard/my-lectures` overview suite.
2. Your newly added lecture will appear at the top of your list with a status indicating it is being processed.
3. Once the background jobs finish transcribing the speech and translating/summarizing it into Somali notes, the status will update to Complete.
4. Click on the completed lecture card to enter the `dashboard/lecture` details page.
5. In this detailed view, you can read the formatted Somali notes, view the raw generated transcript, and possibly reference the original video material alongside the notes.

## 4. Understanding Background Tasks (Native vs Celery)

When you submit a video, the server needs to extract audio, run AI transcription, and translate it to Somali notes. If the webpage waited for all this to finish, your browser would "time out" and freeze. To solve this, the application supports two background processing modes:

### Mode A: FastAPI Native Background Tasks (`USE_CELERY=False`) -- RECOMMENDED FOR LOCAL DEVELOPMENT
Instead of using an external message queue, FastAPI runs the processing job in a background thread inside the same FastAPI server process.
* **Why it's better for Windows**: Celery has known multiprocessing issues on Windows (often leading to silent freezes or database locking). Native background tasks run in-process, meaning you **only need to run the FastAPI server** and the pipeline will work perfectly without starting a separate queue worker.
* **Database Setup**: The app writes and reads straight to `sql_app.db`, bypassing the need for temporary broker databases.

### Mode B: Celery Worker (`USE_CELERY=True`) -- OPTIONAL FOR PRODUCTION
FastAPI sends the task to a message broker, which triggers a separate worker process (`celery -A app.jobs.worker.celery_app worker`).
* **The Message Broker**: Celery uses a database to queue tasks. In production, this is **Redis**. For local SQLite development, this uses `celery_broker.sqlite` and `celery_backend.sqlite`.

---

## 5. Where Is the Database Data?

This application now uses **SQLite** for everything (both the main app data and the background task queues). Because SQLite is file-based, your data sits as files in the `backend` folder.

1. **`backend/sql_app.db`**: This is the main application database. It stores Users, Lectures, Transcripts, and the final Somali Notes.
2. **`backend/celery_broker.sqlite`**: Temp queue file (used only when `USE_CELERY=True`).
3. **`backend/celery_backend.sqlite`**: Temp task status file (used only when `USE_CELERY=True`).

### How to Interact With Your Databases
* **Option 1 (Using VS Code)**: Install the **"SQLite Viewer"** extension. Simply click on `sql_app.db` in your file explorer to view your tables.
* **Option 2 (Standalone App)**: Download **[DB Browser for SQLite](https://sqlitebrowser.org/)** and open `sql_app.db`.

---

## 6. The Fail-Safe AI Pipeline (How the Models Connect)

For the best pipeline reliability, speed, and safety, we have configured a **hybrid AI structure** that combines the strengths of OpenAI and Google Gemini:

```
[User Ingestion] -> Paste YouTube URL / Upload Local Video
                       |
                       v
[Transcription]  -> Check YouTube Captions. If missing:
                       |---> Call OpenAI Whisper (whisper-1)
                       |     (Bypasses Google copyright/safety recitation blocks)
                       v
[Note Generation]-> Try gemini-2.5-flash-lite (10 RPM free limit)
                       |
                       |-- (If hits 503 Busy or 429 Rate Limit)
                       |---> Auto-Fallback to gemini-2.5-flash
                       v
[QA & Repair]    -> Verify Somali text content. If Arabic/non-Somali scripts detected:
                       |---> Send to Gemini for automated translation repair
                       v
[Final Save]     -> Notes, summary, key points saved to sql_app.db
```

### Why this setup guarantees success:
1. **OpenAI Whisper (`whisper-1`) for Transcription**:
   * Google's Gemini models are highly sensitive and will **block transcription** (throwing a `RECITATION` or safety block error) if they detect audio from popular YouTube videos, music, or copy-protected courses.
   * OpenAI Whisper does not block transcription based on content, guaranteeing a 100% success rate on audio-to-text.
2. **Double-Tiered Gemini for Somali Notes**:
   * `gemini-2.5-flash-lite` is the primary model because it has a higher free limit of 10 requests-per-minute (RPM).
   * `gemini-2.5-flash` is configured as the active fallback. If the lite model is busy (returns a `503 Service Unavailable` error), the pipeline catches it automatically and completes the note generation using the standard flash model.
3. **Sequential Concurrency (`max_workers=1`)**:
   * The server runs note generation steps sequentially rather than in parallel. This avoids hitting concurrent rate limits (burst limits) on free API keys.

---

## 7. How to Maintain a Healthy Pipeline
To keep your platform working perfectly:
* **API Keys**: Ensure valid `GEMINI_API_KEY` and `OPENAI_API_KEY` are present in your `backend/.env`.
* **OpenAI Credits**: Ensure your OpenAI account has a pre-paid credit balance (at least $5) in [OpenAI API Billing](https://platform.openai.com/settings/organization/billing/overview). The OpenAI API will not work if the balance is $0, even if a credit card is linked.
* **Google Billing (Optional)**: If you want to increase note-generation capacity, link your Google Cloud project to a credit card to upgrade from the Free Tier limits.

