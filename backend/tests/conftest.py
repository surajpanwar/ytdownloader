import time
from pathlib import Path

import pytest

from downloader import DownloadService

VALID_INFO = {
    "id": "abc123",
    "title": "A Fancy Video",
    "thumbnail": "https://i.ytimg.com/vi/abc123/maxresdefault.jpg",
    "duration": 754,
    "channel": "Example Channel",
    "uploader": "Example Channel",
    "webpage_url": "https://www.youtube.com/watch?v=abc123",
    "extractor": "Youtube",
}


class FakeYDL:
    def __init__(self, opts):
        self.opts = opts

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def extract_info(self, url, download=False):
        if "private" in url:
            raise RuntimeError("Private video. Sign in to view.")
        if "age" in url:
            raise RuntimeError("Sign in to confirm your age. This video may be inappropriate for some users.")
        if "broken" in url:
            raise RuntimeError("Unsupported URL: something unexpected blew up.")
        if "example.com" in url:
            raise RuntimeError("Unsupported URL: example.com")
        if download:
            if "slow" in url:
                time.sleep(2)
            home = Path(self.opts["paths"]["home"])
            home.mkdir(parents=True, exist_ok=True)
            outtmpl = self.opts.get("outtmpl", "")
            filename = outtmpl.split("/")[-1].replace("%(title).180B", "A Fancy Video").replace("%(id)s", "abc123").replace("%(ext)s", "mp4")
            (home / filename).write_bytes(b"fake-video-bytes")
            for hook in self.opts.get("progress_hooks", []):
                hook({"status": "downloading", "downloaded_bytes": 50, "total_bytes": 100})
                hook({"status": "finished"})
        # Determine extractor based on URL
        info = dict(VALID_INFO, webpage_url=url)
        if "tiktok.com" in url:
            info["extractor"] = "TikTok"
        elif "instagram.com" in url:
            info["extractor"] = "Instagram"
        elif "vimeo.com" in url:
            info["extractor"] = "Vimeo"
        elif "twitter.com" in url or "x.com" in url:
            info["extractor"] = "Twitter"
        return info


class FakeYtDlp:
    YoutubeDL = FakeYDL


@pytest.fixture
def ytdlp():
    return FakeYtDlp


@pytest.fixture
def download_dir(tmp_path):
    return str(tmp_path / "downloads")


@pytest.fixture
def service(ytdlp, download_dir):
    return DownloadService(download_dir=download_dir, ytdlp=ytdlp)