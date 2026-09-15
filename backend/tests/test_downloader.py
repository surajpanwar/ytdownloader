import time

import pytest

from downloader import (
    AgeRestrictedError,
    DownloadService,
    InvalidUrlError,
    PrivateVideoError,
    UnsupportedUrlError,
)


def test_fetch_info_returns_metadata(service):
    info = service.fetch_info("https://www.youtube.com/watch?v=abc123")
    assert info.title == "A Fancy Video"
    assert info.thumbnail.startswith("https://")
    assert info.duration == 754
    assert info.channel == "Example Channel"
    assert info.site == "Youtube"


def test_fetch_info_rejects_non_http_string(service):
    with pytest.raises(InvalidUrlError):
        service.fetch_info("not a url at all")


def test_fetch_info_raises_unsupported_url_error(service):
    with pytest.raises(UnsupportedUrlError):
        service.fetch_info("https://example.com/video")


def test_fetch_info_accepts_non_youtube_url(service):
    info = service.fetch_info("https://vimeo.com/123456")
    assert info.title == "A Fancy Video"
    assert info.site == "Vimeo"


def test_fetch_info_accepts_tiktok_url(service):
    info = service.fetch_info("https://www.tiktok.com/@user/video/123")
    assert info.title == "A Fancy Video"
    assert info.site == "TikTok"


def test_fetch_info_accepts_instagram_url(service):
    info = service.fetch_info("https://www.instagram.com/reel/ABC123/")
    assert info.title == "A Fancy Video"
    assert info.site == "Instagram"


def test_fetch_info_raises_private_video_error(service):
    with pytest.raises(PrivateVideoError):
        service.fetch_info("https://youtu.be/private")


def test_fetch_info_raises_age_restricted_error(service):
    with pytest.raises(AgeRestrictedError):
        service.fetch_info("https://youtu.be/age")


def test_download_creates_file_and_reports_progress(service, tmp_path):
    seen = []

    def on_progress(percent):
        seen.append(percent)

    output_dir = tmp_path / "job"
    result = service.download(
        "https://www.youtube.com/watch?v=abc123",
        "mp4",
        "720",
        progress_callback=on_progress,
        output_dir=str(output_dir),
    )

    assert result.path.exists()
    assert result.filename.endswith(".mp4")
    assert result.title == "A Fancy Video"
    assert seen, "progress callback was never called"
    assert seen[-1] == 100


def test_download_mp3_uses_audio_extract_postprocessor(service):
    opts = service._build_options("mp3", "1080")
    assert "FFmpegExtractAudio" in [p.get("key") for p in opts.get("postprocessors", [])]
    assert opts.get("merge_output_format") is None


def test_download_mp4_builds_height_capped_selector(service):
    opts = service._build_options("mp4", "720")
    assert "height<=720" in opts["format"]
    assert opts["merge_output_format"] == "mp4"


def test_download_webm_builds_webm_selector(service):
    opts = service._build_options("webm", "480")
    assert "ext=webm" in opts["format"]
    assert opts["merge_output_format"] == "webm"


def test_invalid_format_is_rejected(service, tmp_path):
    with pytest.raises(ValueError):
        service.download("https://youtu.be/abc123", "avi", "720", output_dir=str(tmp_path))


def test_cleanup_removes_old_files_keeps_fresh(service, tmp_path):
    old = tmp_path / "downloads" / "old.mp4"
    fresh = tmp_path / "downloads" / "fresh.mp4"
    old.parent.mkdir(parents=True, exist_ok=True)
    old.write_bytes(b"x")
    fresh.write_bytes(b"x")
    old_time = time.time() - 3600
    import os

    os.utime(old, (old_time, old_time))

    removed = service.cleanup_old_files(max_age_seconds=1800)

    assert removed == 1
    assert not old.exists()
    assert fresh.exists()