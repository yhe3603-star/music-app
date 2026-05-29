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
