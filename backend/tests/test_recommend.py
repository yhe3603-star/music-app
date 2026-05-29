import pytest
from fastapi.testclient import TestClient


def test_recommend_similar_songs(client: TestClient):
    client.post("/api/songs", json={
        "title": "Song A",
        "artist": "Same Artist",
        "album": "Album X",
        "source": "local",
    })
    client.post("/api/songs", json={
        "title": "Song B",
        "artist": "Same Artist",
        "album": "Album X",
        "source": "local",
    })
    client.post("/api/songs", json={
        "title": "Song C",
        "artist": "Other Artist",
        "source": "local",
    })
    resp = client.get("/api/recommend/1")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    titles = [s["title"] for s in data]
    assert "Song B" in titles


def test_recommend_not_found(client: TestClient):
    resp = client.get("/api/recommend/999")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Song not found"


def test_recommend_empty(client: TestClient):
    client.post("/api/songs", json={
        "title": "Only Song",
        "artist": "Solo Artist",
        "source": "local",
    })
    resp = client.get("/api/recommend/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data == []
