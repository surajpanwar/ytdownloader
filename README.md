# YT Downloader

A YouTube video downloader web app with a split, fully free deployment:

| Layer    | Stack                                                        | Hosting        | Cost |
| -------- | ------------------------------------------------------------ | -------------- | ---- |
| Frontend | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui patterns  | Vercel (free)  | $0   |
| Backend  | Python FastAPI + yt-dlp + ffmpeg (Docker)                    | Render (free)  | $0   |

No paid services, no API keys, no credit card required.

## How it works

```
Browser ──► Vercel (Next.js UI)
                 │
                 │  POST /api/validate        (resolve title/thumbnail/duration)
                 │  POST /api/download        (starts a download, returns taskId)
                 │  GET  /api/download/{id}/status   (poll every 2s)
                 │  GET  /api/download/{id}/file     (stream the finished file)
                 ▼
             Render (FastAPI + yt-dlp + ffmpeg)
                 │  extracts metadata, downloads, merges/transcodes on demand
                 ▼
             /tmp/downloads/  (temp files auto-deleted after 30 minutes)
```

The frontend calls the backend directly from the browser, so there are no proxy
routes on Vercel. That works because the backend enables CORS for the Vercel
domain (see `CORS_ORIGINS` below).

## Repository layout

```
├── frontend/            → deploy to Vercel
│   ├── src/app/         Next.js App Router (landing page, state orchestration)
│   ├── src/components/  UI: url-form, result-card, progress-bar, recent list
│   ├── src/lib/         API client, localStorage history, utils
│   ├── vercel.json      Next.js build config
│   └── .env.example     NEXT_PUBLIC_API_URL
└── backend/             → deploy to Render (Docker)
    ├── main.py          FastAPI app (endpoints, tasks, rate limit, cleanup)
    ├── downloader.py    yt-dlp wrapper (info + download + format selection)
    ├── tests/           pytest suite (35 tests, uses a fake extractor)
    ├── Dockerfile       python:3.11-slim + ffmpeg + pinned yt-dlp
    ├── render.yaml      Render service definition (free plan)
    └── requirements.txt
```

## API reference

Base URL is the Render service URL (e.g. `https://yt-downloader-api.onrender.com`).

| Method | Path                                    | Body / Params                          | Success                                     | Errors |
| ------ | --------------------------------------- | -------------------------------------- | ------------------------------------------- | ------ |
| GET    | `/api/health`                           | —                                      | `200 {"status":"ok","uptime":N}`            | —      |
| POST   | `/api/validate`                         | `{"url":"https://youtu.be/…"}`         | `200 {valid,title,thumbnail,duration,channel}` | `400` `403` `502` |
| POST   | `/api/download`                         | `{"url","format":"mp4","quality":"720"}` | `202 {"taskId":"…"}`                        | `422` `429` |
| GET    | `/api/download/{taskId}/status`         | —                                      | `200 {taskId,status,progress,filename?,error?}` | `404` |
| GET    | `/api/download/{taskId}/file`           | —                                      | `200` stream + `Content-Disposition: attachment` | `404` `409` |

- `format` ∈ `mp4 | webm | mp3 | m4a`; `quality` ∈ `1080 | 720 | 480 | 360`.
- `status` ∈ `pending | downloading | completed | failed`.
- Errors use a consistent shape: `{"error":{"code","message","requestId"}}`.
- Rules per endpoint:
  - `POST /api/validate` resolves metadata without downloading.
  - `POST /api/download` is async — it returns a `taskId` immediately and the
    download runs in the background. No body means the API never blocks.
  - `GET …/status` and `GET …/file` are cheap readers and are exempt from rate
    limiting so the frontend can poll freely.
  - `GET …/file` returns `409 NOT_READY` while the task is still processing and
    `409` with the task's error code once it has failed.

> **Note on `validate`:** the endpoint is implemented as `POST` (JSON body), not
> `GET` with a body — `GET` requests with bodies are unreliable across proxies
> and caches, and `POST` is the correct verb for a semantics-checking operation.
> The frontend uses the `POST` variant.

### Rate limiting

`POST /api/validate` and `POST /api/download` are limited to 5 requests per
minute per IP (`429 RATE_LIMITED`). Readers and `/api/health` are exempt, and
every limited response carries `X-RateLimit-Limit` / `X-RateLimit-Remaining`.

## Local development

### Backend

```bash
cd backend
python -m venv .venv
uv pip install -r requirements-dev.txt        # or: pip install -r requirements-dev.txt
uvicorn main:app --reload                      # http://localhost:8000
```

Run the test suite (35 tests, a fake yt-dlp — no network, no flakiness):

```bash
cd backend
pytest                                        # or: ../.venv/Scripts/python.exe -m pytest
```

The suite covers the whole contract: health, validate (valid/random/non-YouTube/
private/age-restricted), the async download lifecycle (pending → downloading →
completed/failed), timeout marking, file streaming, `404`/`409` cases, body
validation (`422`), rate limiting, and CORS.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local                    # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                                   # http://localhost:3000
```

Typecheck and build:

```bash
npm run typecheck
npm run build
```

## Deployment

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/<you>/yt-downloader.git
git push -u origin main
```

Both platforms auto-deploy from this one repository — Render builds only the
`backend/` folder, Vercel builds only the `frontend/` folder.

### 2. Backend → Render

Option A — **render.yaml (recommended)**: link your repo and Render reads
`backend/render.yaml`, which sets runtime `docker`, root dir `backend`, the
`/api/health` health check, and env vars. Pick the free instance type.

Option B — manual: **New → Web Service** → connect the repo →

| Setting               | Value                                   |
| --------------------- | --------------------------------------- |
| Environment           | Docker                                  |
| Root directory        | `backend`                               |
| Health Check Path     | `/api/health`                           |
| Instance type         | Free                                    |

Then add the environment variable:

```
CORS_ORIGINS=https://your-app.vercel.app
```

`CORS_ORIGINS` is a comma-separated list of the frontend origin(s) the API will
answer to. `http://localhost:3000` is allowed by default for local dev. If you
forget this, the browser blocks the request with a CORS error.

On free Render instances the server sleeps after ~15 minutes of inactivity.
The first request after a sleep re-wakes it, which is why the UI shows
**"Waking up the server…"** when the first call takes longer than 5 seconds.

### 3. Frontend → Vercel

Import the same repo. Vercel auto-detects Next.js and uses `vercel.json`
(`next build`, standalone output). Add one environment variable:

```
NEXT_PUBLIC_API_URL=https://yt-downloader-api.onrender.com
```

It must be set **at build time** on Vercel so it is baked into the client
bundle — then **redeploy** once the backend is live.

## Troubleshooting

**"The download timed out."** You hit the 5-minute per-download limit
(`YTDL_TIMEOUT_SECONDS`). Pick a lower quality or a shorter video. Reasonable
grain: 720p MP4 is about 100–200 MB in a few minutes; huge 4K sources may not
finish in time on the free tier's CPU limits.

**"Couldn't reach the backend" / network error on first load.** The Render free
instance was asleep. Wait and retry — the UI auto-messages this case. A fresh
visit has a ~1 minute cold start.

**CORS error in the console.** `CORS_ORIGINS` on Render doesn't include your
Vercel domain (or you changed domains). Update the env var and redeploy the
backend. Note the origin must match exactly, including scheme
(`https://`, no trailing slash).

**`ffmpeg` errors / "requested format not available".** ffmpeg is installed in
the Docker image, so on Render manifest errors usually mean YouTube served an
unexpected format combo. Switch to MP4 (the `bestvideo+bestaudio` merge is the
most reliable), lower the quality, or wait for Google to stop A/B-testing
yt-dlp and retry later.

**"This video is private / age-restricted."** yt-dlp cannot authenticate on the
anonymous backend, so private, age-gated, members-only, or region-locked videos
fail with a friendly message. That is expected — point the app at public videos.

**Rate limit (`429`).** Five validation/download starts per minute per IP.
Wait a minute. If you routinely need more, raise `max_requests` in
`create_app(...)` (the README config is a default for the free tier).

**yt-dlp eventually breaks (extraction errors).** YouTube changes frequently.
`pip install -U "yt-dlp>=2024.12.13,<2026"` locally / bump the pin in
`requirements.txt` and redeploy. The read of `requirements.txt` is the only
place `yt-dlp` is pinned — keep it a forward-compatible range.

**Files filling disk?** Downloads live in the container's ephemeral `/tmp`
(`YTDL_DOWNLOAD_DIR`) and a background task deletes anything older than 30
minutes (`YTDL_FILE_MAX_AGE_SECONDS`), including after each download. Free Render
instances have a limited reaped disk, so they never accumulate.

## License & fair use

This tool is for downloading content you own or have permission to keep. Don't
redistribute others' videos. The frontend and backend code are provided under
the MIT License — see the repository LICENSE file.