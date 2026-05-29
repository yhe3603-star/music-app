import io
import pytest
from fastapi.testclient import TestClient


def test_create_song(client: TestClient):
    resp = client.post("/api/songs", json={
        "title": "Test Song",
        "artist": "Test Artist",
        "source": "local",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Test Song"
    assert data["artist"] == "Test Artist"
    assert data["source"] == "local"
    assert "id" in data


def test_list_songs(client: TestClient):
    for i in range(2):
        client.post("/api/songs", json={
            "title": f"Song {i}",
            "artist": "Artist",
            "source": "local",
        })
    resp = client.get("/api/songs")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


def test_list_songs_pagination(client: TestClient):
    for i in range(15):
        client.post("/api/songs", json={
            "title": f"Song {i}",
            "artist": "Artist",
            "source": "local",
        })
    resp = client.get("/api/songs", params={"page": 1, "page_size": 10})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 10
    assert data["total"] == 15
    assert data["page"] == 1
    assert data["page_size"] == 10


def test_get_song(client: TestClient):
    create_resp = client.post("/api/songs", json={
        "title": "My Song",
        "artist": "My Artist",
        "source": "local",
    })
    song_id = create_resp.json()["id"]
    resp = client.get(f"/api/songs/{song_id}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "My Song"


def test_get_song_not_found(client: TestClient):
    resp = client.get("/api/songs/999")
    assert resp.status_code == 404


def test_delete_song(client: TestClient):
    create_resp = client.post("/api/songs", json={
        "title": "Delete Me",
        "artist": "Artist",
        "source": "local",
    })
    song_id = create_resp.json()["id"]
    resp = client.delete(f"/api/songs/{song_id}")
    assert resp.status_code == 200
    assert resp.json()["message"] == "Song deleted"

    resp = client.get(f"/api/songs/{song_id}")
    assert resp.status_code == 404


def test_upload_song(client: TestClient):
    file_content = b"fake audio data"
    resp = client.post(
        "/api/songs/upload",
        files={"file": ("test.mp3", io.BytesIO(file_content), "audio/mpeg")},
        data={"title": "Uploaded Song", "artist": "Uploader"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Uploaded Song"
    assert data["artist"] == "Uploader"
    assert data["source"] == "local"
    assert data["file_path"] is not None


def test_stream_song(client: TestClient):
    file_content = b"fake audio content for streaming"
    upload_resp = client.post(
        "/api/songs/upload",
        files={"file": ("stream.mp3", io.BytesIO(file_content), "audio/mpeg")},
    )
    song_id = upload_resp.json()["id"]
    resp = client.get(f"/api/songs/{song_id}/stream")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "audio/mpeg"


def test_download_song(client: TestClient):
    file_content = b"fake audio data for download"
    create_resp = client.post(
        "/api/songs/upload",
        files={"file": ("download.mp3", io.BytesIO(file_content), "audio/mpeg")},
        data={"title": "Download Song", "artist": "Test Artist"},
    )
    song_id = create_resp.json()["id"]
    response = client.get(f"/api/songs/{song_id}/download")
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"
    assert "attachment" in response.headers.get("content-disposition", "")


def test_download_song_not_found(client: TestClient):
    response = client.get("/api/songs/999/download")
    assert response.status_code == 404


def test_stream_song_range(client: TestClient):
    file_content = b"fake audio content for range streaming test"
    upload_resp = client.post(
        "/api/songs/upload",
        files={"file": ("range.mp3", io.BytesIO(file_content), "audio/mpeg")},
    )
    song_id = upload_resp.json()["id"]
    resp = client.get(
        f"/api/songs/{song_id}/stream",
        headers={"Range": "bytes=0-9"},
    )
    assert resp.status_code == 206
    assert "content-range" in resp.headers
    assert resp.headers["content-range"].startswith("bytes 0-9/")


def test_batch_upload(client):
    files = [
        ("files", ("song1.mp3", io.BytesIO(b"audio1"), "audio/mpeg")),
        ("files", ("song2.mp3", io.BytesIO(b"audio2"), "audio/mpeg")),
    ]
    response = client.post("/api/songs/batch-upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["uploaded"] == 2
    assert len(data["results"]) == 2


def test_scan_directory(client, tmp_path):
    from app.config import settings
    settings.storage_path = tmp_path

    # Create test music files
    (tmp_path / "song1.mp3").write_bytes(b"audio1")
    (tmp_path / "song2.flac").write_bytes(b"audio2")
    (tmp_path / "not_music.txt").write_bytes(b"text")
    (tmp_path / "SubDir").mkdir()
    (tmp_path / "SubDir" / "Artist - Title.mp3").write_bytes(b"audio3")

    response = client.post("/api/songs/scan-directory", data={"directory": str(tmp_path)})
    assert response.status_code == 200
    data = response.json()
    assert data["imported"] == 3  # 3 music files
    assert data["total_found"] == 3


def test_auto_tag_not_found(client):
    response = client.post("/api/songs/999/auto-tag")
    assert response.status_code == 404


def test_stream_song_range_out_of_bounds(client: TestClient):
    file_content = b"short"
    upload_resp = client.post(
        "/api/songs/upload",
        files={"file": ("short.mp3", io.BytesIO(file_content), "audio/mpeg")},
    )
    song_id = upload_resp.json()["id"]
    resp = client.get(
        f"/api/songs/{song_id}/stream",
        headers={"Range": "bytes=0-999"},
    )
    assert resp.status_code == 416


def test_stream_song_invalid_range(client: TestClient):
    file_content = b"audio data here"
    upload_resp = client.post(
        "/api/songs/upload",
        files={"file": ("test.mp3", io.BytesIO(file_content), "audio/mpeg")},
    )
    song_id = upload_resp.json()["id"]
    resp = client.get(
        f"/api/songs/{song_id}/stream",
        headers={"Range": "invalid"},
    )
    assert resp.status_code == 416


def test_upload_rejects_unsupported_type(client: TestClient):
    resp = client.post(
        "/api/songs/upload",
        files={"file": ("malware.exe", io.BytesIO(b"MZ..."), "application/octet-stream")},
    )
    assert resp.status_code == 400
    assert "Unsupported file type" in resp.json()["detail"]


def test_scan_directory_rejects_outside_storage(client: TestClient):
    response = client.post("/api/songs/scan-directory", data={"directory": "/etc"})
    assert response.status_code == 403
