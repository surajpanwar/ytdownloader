"""FastAPI application for the YT Downloader backend.

Exposes the download task API:
  GET /api/health                    - liveness probe (used by Render)
  POST /api/validate                 - resolve a URL's metadata
  POST /api/download                 - start an async download, returns a taskId
  GET /api/download/{id}/status      - poll task progress
  GET /api/download/{id}/file        - stream the finished file

Design notes
------------
* Downloads run on a background threadpool task so the API keeps answering
  status polls while ffmpeg/yt-dlp are busy.
* Each download runs inside a dedicated worker thread with a hard timeout
  (default 5 minutes); the task is marked failed if it overruns.
* Files are written to a temporary download directory and auto-cleaned by a
  background sweeper thread once they are older than 30 minutes.
* Per-IP rate limiting (default 5 requests/minute), with the health endpoint
  exempted so Render's health checks are never throttled.
"""

from __future__ import annotations

import logging
import os
import re
import threading
import time
import uuid
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field, field_validator

from downloader import (
    VALID_FORMATS,
    VALID_QUALITIES,
    AgeRestrictedError,
    DownloadError,
    DownloadService,
    InvalidUrlError,
    PrivateVideoError,
    UnsupportedUrlError,
    classify_error,
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

DEFAULT_CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]
_CLEANUP_INTERVAL_SECONDS = 60


def _env_cors_origins() -> list[str]:
    raw = os.environ.get("CORS_ORIGINS", "")
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    return origins or DEFAULT_CORS_ORIGINS


# --------------------------------------------------------------- error text


_MESSAGES = {
    "INVALID_URL": "That link isn't a valid URL.",
    "NOT_SUPPORTED": "This URL isn't supported. Try a video from YouTube, TikTok, Instagram, Twitter, Vimeo, or 1000+ other sites.",
    "PRIVATE_VIDEO": "This video is private and can't be downloaded.",
    "AGE_RESTRICTED": "This video is age-restricted and can't be downloaded.",
    "TIMEOUT": "The download timed out. Try a smaller video or a lower quality.",
}

_MEDIA_TYPES = {
    "mp4": "video/mp4",
    "webm": "video/webm",
    "mp3": "audio/mpeg",
    "m4a": "audio/mp4",
}


def _request_id() -> str:
    return uuid.uuid4().hex[:12]


def _error_response(
    code: str,
    message: str,
    http_status: int,
    request_id: Optional[str] = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=http_status,
        content={
            "error": {
                "code": code,
                "message": message,
                "requestId": request_id or _request_id(),
            }
        },
    )


def friendly_error(exc: Exception) -> tuple[str, str]:
    """Map a raised exception onto (stable error code, human-friendly message)."""
    err = exc if isinstance(exc, DownloadError) else classify_error(exc)
    code = getattr(err, "code", "DOWNLOAD_ERROR")
    message = _MESSAGES.get(code)
    if message is None:
        message = (str(err) or "").strip()[:250] or "The download failed for an unknown reason."
    return code, message


# ------------------------------------------------------------------ models


class ValidateRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048, examples=["https://www.youtube.com/watch?v=dQw4w9WgXcQ"])


class DownloadRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048, examples=["https://www.youtube.com/watch?v=dQw4w9WgXcQ"])
    format: str = "mp4"
    quality: str = "1080"

    @field_validator("format")
    @classmethod
    def _format_must_be_supported(cls, v: str) -> str:
        v = v.lower()
        if v not in VALID_FORMATS:
            raise ValueError(f"format must be one of: {', '.join(VALID_FORMATS)}")
        return v

    @field_validator("quality")
    @classmethod
    def _quality_must_be_supported(cls, v) -> str:
        v = str(v)
        if v not in VALID_QUALITIES:
            raise ValueError(f"quality must be one of: {', '.join(VALID_QUALITIES)}")
        return v


# ---------------------------------------------------------------- task store


@dataclass
class DownloadTask:
    id: str
    url: str
    format: str
    quality: str
    status: str = "pending"  # pending | downloading | completed | failed
    progress: float = 0.0
    filename: Optional[str] = None
    file_path: Optional[str] = None
    error: Optional[str] = None
    error_code: Optional[str] = None
    created_at: float = field(default_factory=time.time)


class TaskStore:
    def __init__(self) -> None:
        self._tasks: dict[str, DownloadTask] = {}
        self._lock = threading.Lock()

    def create(self, url: str, fmt: str, quality: str) -> DownloadTask:
        task = DownloadTask(id=uuid.uuid4().hex, url=url, format=fmt, quality=quality)
        with self._lock:
            self._tasks[task.id] = task
        return task

    def get(self, task_id: str) -> Optional[DownloadTask]:
        with self._lock:
            return self._tasks.get(task_id)

    def mark(self, task_id: str, status: str) -> None:
        with self._lock:
            task = self._tasks.get(task_id)
            if task:
                task.status = status

    def update_progress(self, task_id: str, progress: float) -> None:
        with self._lock:
            task = self._tasks.get(task_id)
            if task:
                task.progress = min(100.0, max(task.progress, progress))

    def complete(self, task_id: str, file_path: str, filename: str) -> None:
        with self._lock:
            task = self._tasks.get(task_id)
            if task:
                task.status = "completed"
                task.progress = 100.0
                task.file_path = file_path
                task.filename = filename

    def fail(self, task_id: str, code: str, message: str) -> None:
        with self._lock:
            task = self._tasks.get(task_id)
            if task:
                task.status = "failed"
                task.error_code = code
                task.error = message

    def snapshot(self, task: DownloadTask) -> dict:
        return {
            "taskId": task.id,
            "status": task.status,
            "progress": task.progress,
            "filename": task.filename,
            "error": task.error,
        }


# -------------------------------------------------------------- rate limiter


class RateLimiter:
    def __init__(self, max_requests: int = 5, window_seconds: int = 60) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, list[float]] = {}
        self._lock = threading.Lock()

    def check(self, ip: str) -> tuple[bool, int, int]:
        """Return (allowed, remaining, retry_after_seconds)."""
        now = time.time()
        window_start = now - self.window_seconds
        with self._lock:
            recent = [t for t in self._hits.get(ip, []) if t > window_start]
            if len(recent) >= self.max_requests:
                self._hits[ip] = recent
                retry_after = int(self.window_seconds - (now - min(recent))) + 1
                return False, 0, max(retry_after, 1)
            recent.append(now)
            self._hits[ip] = recent
            return True, self.max_requests - len(recent), 0


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ------------------------------------------------------------ download job


def _run_download(tasks: TaskStore, service: DownloadService, task_id: str) -> None:
    task = tasks.get(task_id)
    if task is None:
        return
    tasks.mark(task_id, "downloading")

    task_dir = service.download_dir / task_id
    try:
        task_dir.mkdir(parents=True, exist_ok=True)
    except OSError:
        pass

    result = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None

    def worker() -> None:
        nonlocal result, error_code, error_message
        try:
            result = service.download(
                task.url,
                task.format,
                task.quality,
                progress_callback=lambda p: tasks.update_progress(task_id, p),
                output_dir=str(task_dir),
            )
        except Exception as exc:  # noqa: BLE001 - surfaced through task status
            error_code, error_message = friendly_error(exc)

    thread = threading.Thread(target=worker, daemon=True)
    thread.start()
    thread.join(service.timeout_seconds)

    if thread.is_alive():
        tasks.fail(task_id, "TIMEOUT", _MESSAGES["TIMEOUT"])
    elif error_message:
        tasks.fail(task_id, error_code or "DOWNLOAD_ERROR", error_message)
    else:
        tasks.complete(task_id, str(result.path), result.filename)

    try:
        service.cleanup_old_files()
    except Exception:  # noqa: BLE001 - never let cleanup break a download
        logger.exception("cleanup after download failed")


# -------------------------------------------------------------------- app


def create_app(
    service: Optional[DownloadService] = None,
    download_dir: Optional[str] = None,
    max_requests: int = 5,
    cors_origins: Optional[list[str]] = None,
) -> FastAPI:
    service = service or DownloadService(download_dir=download_dir)
    tasks = TaskStore()
    limiter = RateLimiter(max_requests=max_requests)
    origins = cors_origins if cors_origins is not None else _env_cors_origins()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        stop_event = threading.Event()

        def sweep() -> None:
            while not stop_event.wait(_CLEANUP_INTERVAL_SECONDS):
                try:
                    removed = service.cleanup_old_files()
                    if removed > 0:
                        logger.info("cleaned up %s old file(s)", removed)
                except Exception:  # noqa: BLE001
                    logger.exception("periodic cleanup failed")

        sweeper = threading.Thread(target=sweep, daemon=True)
        sweeper.start()
        app.state.cleanup_stop = stop_event
        yield
        stop_event.set()

    app = FastAPI(title="YT Downloader API", version="1.0.0", lifespan=lifespan)
    app.state.started_at = time.time()

    @app.exception_handler(RequestValidationError)
    async def _validation_handler(request: Request, exc: RequestValidationError):
        first = exc.errors()[0] if exc.errors() else {}
        loc = ".".join(str(x) for x in first.get("loc", []) if x not in ("body",))
        message = first.get("msg", "Invalid request.")
        return _error_response(
            "VALIDATION_ERROR",
            f"{loc}: {message}" if loc else message,
            422,
            _request_id() if False else None,
        )

    @app.middleware("http")
    async def rate_limit(request: Request, call_next):
        # Only gate the expensive mutating operations. Readers (status, file,
        # health) are exempt so the frontend can poll progress without tripping
        # the 5 req/min budget.
        path = request.url.path
        limited = request.method == "POST" and path in ("/api/validate", "/api/download")
        if not limited:
            return await call_next(request)
        allowed, remaining, retry_after = limiter.check(_client_ip(request))
        if not allowed:
            response = _error_response(
                "RATE_LIMITED",
                "Too many requests. Wait a moment and try again.",
                429,
            )
            response.headers["X-RateLimit-Limit"] = str(limiter.max_requests)
            response.headers["X-RateLimit-Remaining"] = "0"
            response.headers["X-RateLimit-Retry-After"] = str(retry_after)
            return response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limiter.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response

    # Added last so CORSMiddleware wraps (and decorates) the rate-limit layer,
    # guaranteeing CORS headers on every response, including 4xx/429.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ------------------------------------------------------------- endpoints

    @app.get("/api/health")
    def health():
        return {
            "status": "ok",
            "uptime": round(time.time() - app.state.started_at),
        }

    @app.get("/api/supported-sites")
    def supported_sites():
        return {
            "sites": [
                {"name": "YouTube", "domain": "youtube.com"},
                {"name": "TikTok", "domain": "tiktok.com"},
                {"name": "Instagram", "domain": "instagram.com"},
                {"name": "Twitter / X", "domain": "x.com"},
                {"name": "Vimeo", "domain": "vimeo.com"},
                {"name": "Dailymotion", "domain": "dailymotion.com"},
                {"name": "Twitch", "domain": "twitch.tv"},
                {"name": "Facebook", "domain": "facebook.com"},
                {"name": "Reddit", "domain": "reddit.com"},
                {"name": "Twitch Clips", "domain": "clips.twitch.tv"},
                {"name": "SoundCloud", "domain": "soundcloud.com"},
                {"name": "Bandcamp", "domain": "bandcamp.com"},
                {"name": "Flickr", "domain": "flickr.com"},
                {"name": "Streamable", "domain": "streamable.com"},
                {"name": "Rumble", "domain": "rumble.com"},
                {"name": "Odysee", "domain": "odysee.com"},
                {"name": "Bilibili", "domain": "bilibili.com"},
                {"name": "Niconico", "domain": "nicovideo.jp"},
                {"name": "Kick", "domain": "kick.com"},
                {"name": "Patreon", "domain": "patreon.com"},
            ],
            "total_extractors": 1000,
            "extractor_list_url": "https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/_extractors.py",
        }

    @app.post("/api/validate")
    def validate(request: Request, body: ValidateRequest):
        try:
            info = service.fetch_info(body.url)
        except InvalidUrlError:
            return _error_response("INVALID_URL", _MESSAGES["INVALID_URL"], 400)
        except UnsupportedUrlError:
            return _error_response("NOT_SUPPORTED", _MESSAGES["NOT_SUPPORTED"], 400)
        except PrivateVideoError:
            return _error_response("PRIVATE_VIDEO", _MESSAGES["PRIVATE_VIDEO"], 400)
        except AgeRestrictedError:
            return _error_response("AGE_RESTRICTED", _MESSAGES["AGE_RESTRICTED"], 403)
        except DownloadError as exc:
            logger.warning("validate failed for %s: %s", body.url, exc)
            return _error_response(
                "UNREACHABLE",
                "We couldn't reach that video. If the server just woke up, try again in a few seconds.",
                502,
            )
        return {
            "valid": True,
            "title": info.title,
            "thumbnail": info.thumbnail,
            "duration": info.duration,
            "channel": info.channel,
            "webpageUrl": info.webpage_url,
            "site": info.site,
        }

    def _kick_off_download(task_id: str) -> None:
        # Start a detached daemon thread so the join-with-timeout happens off
        # the request path and the API keeps answering status polls throughout.
        threading.Thread(target=_run_download, args=(tasks, service, task_id), daemon=True).start()

    @app.post("/api/download", status_code=202)
    def create_download(body: DownloadRequest, background_tasks: BackgroundTasks):
        task = tasks.create(body.url, body.format, body.quality)
        background_tasks.add_task(_kick_off_download, task.id)
        return {"taskId": task.id}

    @app.get("/api/download/{task_id}/status")
    def download_status(task_id: str):
        task = tasks.get(task_id)
        if task is None:
            return _error_response("NOT_FOUND", "That download task doesn't exist.", 404)
        return tasks.snapshot(task)

    @app.get("/api/download/{task_id}/file")
    def download_file(task_id: str):
        task = tasks.get(task_id)
        if task is None:
            return _error_response("NOT_FOUND", "That download task doesn't exist.", 404)
        if task.status == "failed":
            return _error_response(
                task.error_code or "DOWNLOAD_ERROR",
                task.error or "The download failed.",
                409,
            )
        if task.status != "completed" or not task.file_path or not Path(task.file_path).exists():
            return _error_response(
                "NOT_READY",
                "The download is still processing. Poll /status and try again when it's completed.",
                409,
            )
        extension = Path(task.file_path).suffix.lstrip(".").lower()
        return FileResponse(
            path=task.file_path,
            filename=task.filename,
            media_type=_MEDIA_TYPES.get(extension, "application/octet-stream"),
        )

    return app


app = create_app()