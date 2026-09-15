import time

import pytest
from fastapi.testclient import TestClient

from downloader import DownloadService
from main import create_app


def make_client(tmp_path, download_dir=None, max_requests=5, cors_origins=None, service=None):
    from conftest import FakeYtDlp

    dd = download_dir or str(tmp_path / "downloads")
    service = service or DownloadService(download_dir=dd, ytdlp=FakeYtDlp)
    app = create_app(
        service=service,
        download_dir=dd,
        max_requests=max_requests,
        cors_origins=cors_origins,
    )
    return TestClient(app)


def wait_for_status(client, task_id, timeout=15):
    deadline = time.time() + timeout
    while time.time() < deadline:
        resp = client.get(f"/api/download/{task_id}/status")
        data = resp.json()
        if data["status"] in ("completed", "failed"):
            return data
        time.sleep(0.05)
    raise AssertionError("task never reached a terminal state")


# --- health ---


def test_health_returns_ok(tmp_path):
    client = make_client(tmp_path)
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


# --- validate ---


def test_validate_valid_url(tmp_path):
    client = make_client(tmp_path)
    resp = client.post(
        "/api/validate",
        json={"url": "https://www.youtube.com/watch?v=abc123"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["valid"] is True
    assert body["title"] == "A Fancy Video"
    assert body["channel"] == "Example Channel"
    assert body["duration"] == 754
    assert body["thumbnail"].startswith("https://")


def test_validate_rejects_random_string(tmp_path):
    client = make_client(tmp_path)
    resp = client.post("/api/validate", json={"url": "totally not a url"})
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "INVALID_URL"


def test_validate_accepts_non_youtube_host(tmp_path):
    client = make_client(tmp_path)
    resp = client.post("/api/validate", json={"url": "https://vimeo.com/123"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["valid"] is True
    assert body["site"] == "Vimeo"


def test_validate_accepts_tiktok_url(tmp_path):
    client = make_client(tmp_path)
    resp = client.post("/api/validate", json={"url": "https://www.tiktok.com/@user/video/123"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["valid"] is True
    assert body["site"] == "TikTok"


def test_validate_accepts_instagram_url(tmp_path):
    client = make_client(tmp_path)
    resp = client.post("/api/validate", json={"url": "https://www.instagram.com/reel/ABC123/"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["valid"] is True
    assert body["site"] == "Instagram"


def test_validate_unsupported_site_returns_error(tmp_path):
    client = make_client(tmp_path)
    resp = client.post("/api/validate", json={"url": "https://example.com/video"})
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "NOT_SUPPORTED"


def test_validate_private_video(tmp_path):
    client = make_client(tmp_path)
    resp = client.post("/api/validate", json={"url": "https://youtu.be/private"})
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "PRIVATE_VIDEO"


def test_validate_age_restricted_video(tmp_path):
    client = make_client(tmp_path)
    resp = client.post("/api/validate", json={"url": "https://youtu.be/age"})
    assert resp.status_code == 403
    assert resp.json()["error"]["code"] == "AGE_RESTRICTED"


def test_error_response_includes_request_id(tmp_path):
    client = make_client(tmp_path)
    resp = client.post("/api/validate", json={"url": "totally not a url"})
    assert "requestId" in resp.json()["error"]
    assert resp.json()["error"]["requestId"]


# --- download lifecycle ---


def test_create_download_returns_task_id(tmp_path):
    client = make_client(tmp_path)
    resp = client.post(
        "/api/download",
        json={"url": "https://youtu.be/abc123", "format": "mp4", "quality": "720"},
    )
    assert resp.status_code == 202
    assert "taskId" in resp.json()


def test_download_completes_and_status_reports_fields(tmp_path):
    client = make_client(tmp_path)
    task_id = client.post(
        "/api/download",
        json={"url": "https://youtu.be/abc123", "format": "mp4", "quality": "480"},
    ).json()["taskId"]

    data = wait_for_status(client, task_id)
    assert data["status"] == "completed"
    assert data["progress"] == 100
    assert data["filename"].endswith(".mp4")


def test_download_reports_intermediate_downloading_state(tmp_path):
    client = make_client(tmp_path)
    task_id = client.post(
        "/api/download",
        json={"url": "https://youtu.be/slow", "format": "mp4", "quality": "360"},
    ).json()["taskId"]

    saw_downloading = False
    deadline = time.time() + 15
    while time.time() < deadline:
        status = client.get(f"/api/download/{task_id}/status").json()
        if status["status"] == "downloading":
            saw_downloading = True
        if status["status"] == "completed":
            break
        time.sleep(0.05)

    assert saw_downloading is True


def test_failed_task_reports_friendly_private_video_error(tmp_path):
    client = make_client(tmp_path)
    task_id = client.post(
        "/api/download",
        json={"url": "https://youtu.be/private", "format": "mp4", "quality": "720"},
    ).json()["taskId"]

    data = wait_for_status(client, task_id)
    assert data["status"] == "failed"
    assert data["error"]


def test_timeout_marks_task_failed(tmp_path):
    from conftest import FakeYtDlp

    service = DownloadService(
        download_dir=str(tmp_path / "downloads"),
        ytdlp=FakeYtDlp,
        timeout_seconds=0.2,
    )
    client = make_client(tmp_path, service=service)
    task_id = client.post(
        "/api/download",
        json={"url": "https://youtu.be/slow", "format": "mp4", "quality": "360"},
    ).json()["taskId"]

    data = wait_for_status(client, task_id)
    assert data["status"] == "failed"
    assert "timed out" in data["error"].lower()


# --- file endpoint ---


def test_file_streams_when_completed(tmp_path):
    client = make_client(tmp_path)
    task_id = client.post(
        "/api/download",
        json={"url": "https://youtu.be/abc123", "format": "mp4", "quality": "720"},
    ).json()["taskId"]
    wait_for_status(client, task_id)

    resp = client.get(f"/api/download/{task_id}/file")
    assert resp.status_code == 200
    assert resp.content == b"fake-video-bytes"
    assert "attachment" in resp.headers["content-disposition"]


def test_file_returns_409_while_still_processing(tmp_path):
    client = make_client(tmp_path)
    task_id = client.post(
        "/api/download",
        json={"url": "https://youtu.be/slow", "format": "mp4", "quality": "360"},
    ).json()["taskId"]

    tries = client.get(f"/api/download/{task_id}/file")
    assert tries.status_code in (200, 409)
    if tries.status_code == 409:
        assert tries.json()["error"]["code"] == "NOT_READY"


def test_file_returns_404_for_unknown_task(tmp_path):
    client = make_client(tmp_path)
    resp = client.get("/api/download/nope/file")
    assert resp.status_code == 404


def test_status_returns_404_for_unknown_task(tmp_path):
    client = make_client(tmp_path)
    assert client.get("/api/download/nope/status").status_code == 404


# --- validation of request body ---


def test_create_download_rejects_unsupported_format(tmp_path):
    client = make_client(tmp_path)
    resp = client.post(
        "/api/download",
        json={"url": "https://youtu.be/abc123", "format": "avi", "quality": "720"},
    )
    assert resp.status_code == 422


def test_create_download_rejects_unsupported_quality(tmp_path):
    client = make_client(tmp_path)
    resp = client.post(
        "/api/download",
        json={"url": "https://youtu.be/abc123", "format": "mp4", "quality": "1337"},
    )
    assert resp.status_code == 422


# --- rate limiting ---


def test_rate_limit_blocks_after_max_requests(tmp_path):
    client = make_client(tmp_path, max_requests=3)
    url = "https://youtu.be/abc123"
    for _ in range(3):
        assert client.post("/api/validate", json={"url": url}).status_code == 200

    resp = client.post("/api/validate", json={"url": url})
    assert resp.status_code == 429
    assert resp.json()["error"]["code"] == "RATE_LIMITED"


def test_rate_limit_headers_present(tmp_path):
    client = make_client(tmp_path, max_requests=5)
    resp = client.post("/api/validate", json={"url": "https://youtu.be/abc123"})
    assert "x-ratelimit-remaining" in resp.headers
    assert "x-ratelimit-limit" in resp.headers


def test_rate_limit_exempts_health_check(tmp_path):
    client = make_client(tmp_path, max_requests=1)
    resp = client.post("/api/validate", json={"url": "https://youtu.be/abc123"})
    assert resp.status_code == 200
    for _ in range(5):
        assert client.get("/api/health").status_code == 200


# --- CORS ---


def test_cors_allows_configured_frontend(tmp_path):
    client = make_client(tmp_path, cors_origins=["http://localhost:3000"])
    resp = client.post(
        "/api/validate",
        json={"url": "https://youtu.be/abc123"},
        headers={"Origin": "http://localhost:3000"},
    )
    assert resp.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_cors_absent_for_unknown_origin(tmp_path):
    client = make_client(tmp_path, cors_origins=["http://localhost:3000"])
    resp = client.post(
        "/api/validate",
        json={"url": "https://youtu.be/abc123"},
        headers={"Origin": "https://evil.example.com"},
    )
    assert "access-control-allow-origin" not in resp.headers


def test_cors_preflight_allowed(tmp_path):
    client = make_client(tmp_path, cors_origins=["http://localhost:3000"])
    resp = client.options(
        "/api/download",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert resp.status_code == 200
    assert resp.headers.get("access-control-allow-origin") == "http://localhost:3000"


# --- supported sites ---


def test_supported_sites_returns_list(tmp_path):
    client = make_client(tmp_path)
    resp = client.get("/api/supported-sites")
    assert resp.status_code == 200
    body = resp.json()
    assert "sites" in body
    assert len(body["sites"]) >= 20
    assert body["total_extractors"] == 1000
    assert "extractor_list_url" in body