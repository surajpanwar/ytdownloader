"""yt-dlp wrapper: video info lookup, format selection, downloads, and file cleanup.

The downloader is decoupled from the web layer so it can be unit-tested by
injecting a fake yt-dlp module (see backend/tests/conftest.py).
"""

from __future__ import annotations

import logging
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Optional

import yt_dlp

logger = logging.getLogger(__name__)

DEFAULT_DOWNLOAD_DIR = os.environ.get("YTDL_DOWNLOAD_DIR", "/tmp/downloads")
DEFAULT_TIMEOUT_SECONDS = int(os.environ.get("YTDL_TIMEOUT_SECONDS", "300"))
DEFAULT_FILE_MAX_AGE_SECONDS = int(os.environ.get("YTDL_FILE_MAX_AGE_SECONDS", "1800"))

VALID_FORMATS = ("mp4", "mp3", "webm", "m4a")
VALID_QUALITIES = ("1080", "720", "480", "360")

_HTTP_URL_RE = re.compile(r"^https?://", re.I)


class DownloadError(Exception):
    """Base class for all downloader failures. Subclasses carry a stable `code`."""

    code = "DOWNLOAD_ERROR"


class InvalidUrlError(DownloadError):
    code = "INVALID_URL"


class UnsupportedUrlError(DownloadError):
    code = "NOT_SUPPORTED"


class PrivateVideoError(DownloadError):
    code = "PRIVATE_VIDEO"


class AgeRestrictedError(DownloadError):
    code = "AGE_RESTRICTED"


class DownloadTimeoutError(DownloadError):
    code = "TIMEOUT"


@dataclass
class VideoInfo:
    title: str
    thumbnail: str
    duration: int
    channel: str
    webpage_url: str
    site: str


@dataclass
class VideoFile:
    path: Path
    filename: str
    extension: str
    title: str


_ERROR_HINTS = (
    # Unsupported sites: yt-dlp raises "Unsupported URL: <url>" when no
    # extractor matches, so this must come before the generic DownloadError.
    (UnsupportedUrlError, ("unsupported url",)),
    # Age checks come first: yt-dlp's age-gate message ("Sign in to confirm
    # your age") shares the "sign in to" prefix with the private-video error.
    (AgeRestrictedError, ("confirm your age", "age-restricted", "mature content")),
    (PrivateVideoError, ("private video", "sign in to view", "video unavailable", "not available")),
)


def classify_error(exc: Exception) -> DownloadError:
    """Map an arbitrary yt-dlp error onto a typed DownloadError."""
    message = str(exc)
    lowered = message.lower()
    for err_cls, fragments in _ERROR_HINTS:
        if any(fragment in lowered for fragment in fragments):
            return err_cls(message)
    return DownloadError(message)


class DownloadService:
    """Wraps yt-dlp and manages downloads/cleanup on disk. Pure, no I/O web layer."""

    def __init__(
        self,
        download_dir: Optional[str] = None,
        timeout_seconds: Optional[int] = None,
        ytdlp: object = None,
    ) -> None:
        self.download_dir = Path(download_dir or DEFAULT_DOWNLOAD_DIR)
        self.download_dir.mkdir(parents=True, exist_ok=True)
        self.timeout_seconds = int(timeout_seconds or DEFAULT_TIMEOUT_SECONDS)
        self._ytdlp = ytdlp or yt_dlp
        self._ffmpeg_location = os.environ.get("YTDL_FFMPEG_LOCATION")

    # ------------------------------------------------------------------ info
    def fetch_info(self, url: str) -> VideoInfo:
        """Resolve metadata for `url` without downloading anything."""
        if not url or not isinstance(url, str):
            raise InvalidUrlError("The input is not a valid URL.")
        if not _HTTP_URL_RE.match(url):
            raise InvalidUrlError("The input is not a valid URL.")

        opts = {**self._base_opts(), "skip_download": True}
        try:
            with self._ytdlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=False)
        except DownloadError:
            raise
        except Exception as exc:  # yt-dlp raises RuntimeError for most failures
            raise classify_error(exc)

        title = info.get("title") or "Untitled"
        thumbnail = info.get("thumbnail") or ""
        duration = int(info.get("duration") or 0)
        channel = (
            info.get("channel")
            or info.get("uploader")
            or info.get("uploader_id")
            or "Unknown channel"
        )
        site = info.get("extractor") or info.get("ie_key") or "Unknown"
        return VideoInfo(
            title=title,
            thumbnail=thumbnail,
            duration=duration,
            channel=channel,
            webpage_url=info.get("webpage_url") or url,
            site=site,
        )

    # --------------------------------------------------------------- options
    def _base_opts(self) -> dict:
        opts = {
            "quiet": True,
            "no_warnings": True,
            "noplaylist": True,
            "socket_timeout": 30,
            "retries": 3,
            "fragment_retries": 3,
        }
        if self._ffmpeg_location:
            opts["ffmpeg_location"] = self._ffmpeg_location
        return opts

    def _build_options(self, fmt: str, quality: str) -> dict:
        """Translate a (format, quality) pair into yt-dlp options."""
        fmt = fmt.lower()
        quality = str(quality)
        if fmt not in VALID_FORMATS:
            raise ValueError(f"Unsupported format '{fmt}'. Choose from {', '.join(VALID_FORMATS)}.")
        if quality not in VALID_QUALITIES:
            raise ValueError(f"Unsupported quality '{quality}'. Choose from {', '.join(VALID_QUALITIES)}.")

        if fmt == "mp3":
            return {
                "format": "bestaudio/best",
                "postprocessors": [
                    {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}
                ],
            }
        if fmt == "m4a":
            return {
                "format": "bestaudio[ext=m4a]/bestaudio/best",
                "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "m4a"}],
            }
        if fmt == "webm":
            return {
                "format": (
                    f"bestvideo[ext=webm][height<={quality}]"
                    "+bestaudio[ext=webm]/best[ext=webm]/best"
                ),
                "merge_output_format": "webm",
            }
        # mp4
        return {
            "format": f"bestvideo[height<={quality}]+bestaudio/best[height<={quality}]",
            "merge_output_format": "mp4",
        }

    # -------------------------------------------------------------- download
    def download(
        self,
        url: str,
        fmt: str,
        quality: str,
        progress_callback: Optional[Callable[[float], None]] = None,
        output_dir: Optional[str] = None,
    ) -> VideoFile:
        """Download `url` into `output_dir` and return the resulting file."""
        out = Path(output_dir) if output_dir else self.download_dir
        out.mkdir(parents=True, exist_ok=True)

        opts = {
            **self._base_opts(),
            **self._build_options(fmt, quality),
            "outtmpl": str(out / "%(title).180B [%(id)s].%(ext)s"),
            "paths": {"home": str(out)},
        }
        if progress_callback is not None:
            opts["progress_hooks"] = [self._make_progress_hook(progress_callback)]

        try:
            with self._ytdlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=True)
        except DownloadError:
            raise
        except Exception as exc:
            raise classify_error(exc)

        path = self._newest_file(out)
        if path is None:
            raise DownloadError("The download finished but no file was produced.")
        title = info.get("title") or "Untitled"
        return VideoFile(path=path, filename=path.name, extension=path.suffix.lstrip("."), title=title)

    @staticmethod
    def _make_progress_hook(callback: Callable[[float], None]) -> Callable[[dict], None]:
        def hook(status: dict) -> None:
            if status.get("status") == "downloading":
                total = status.get("total_bytes") or status.get("total_bytes_estimate") or 0
                done = status.get("downloaded_bytes") or 0
                percent = min(100.0, round((done / total) * 100, 1)) if total else 0.0
            elif status.get("status") == "finished":
                percent = 100.0
            else:
                return
            callback(percent)

        return hook

    @staticmethod
    def _newest_file(directory: Path) -> Optional[Path]:
        candidates = [f for f in directory.iterdir() if f.is_file()]
        if not candidates:
            return None
        return max(candidates, key=lambda f: f.stat().st_mtime)

    # --------------------------------------------------------------- cleanup
    def cleanup_old_files(self, max_age_seconds: Optional[int] = None) -> int:
        """Delete downloaded files and empty subdirectories older than `max_age_seconds`."""
        max_age = int(max_age_seconds or DEFAULT_FILE_MAX_AGE_SECONDS)
        now = time.time()
        removed = 0
        for path in self.download_dir.rglob("*"):
            if path.is_file():
                try:
                    age = now - path.stat().st_mtime
                except OSError:
                    continue
                if age > max_age:
                    path.unlink(missing_ok=True)
                    removed += 1
        for path in sorted(self.download_dir.rglob("*"), key=lambda p: len(p.parts), reverse=True):
            if path.is_dir() and not any(path.iterdir()):
                try:
                    path.rmdir()
                except OSError:
                    pass
        return removed