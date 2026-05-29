import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch


def test_search_local_songs(client: TestClient):
    client.post("/api/songs", json={
        "title": "Summer Breeze",
        "artist": "Seals & Crofts",
        "source": "local",
    })
    client.post("/api/songs", json={
        "title": "Summer Nights",
        "artist": "John Travolta",
        "source": "local",
    })
    with patch("app.routers.search.SearchScraper") as MockScraper:
        mock_instance = MockScraper.return_value
        mock_instance.search = AsyncMock(return_value=[])
        resp = client.get("/api/search", params={"keyword": "Summer"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["keyword"] == "Summer"
    assert len(data["results"]) == 2
    assert data["source"] == "local"
    assert data["results"][0]["source"] == "local"


def test_search_no_results(client: TestClient):
    with patch("app.routers.search.SearchScraper") as MockScraper:
        mock_instance = MockScraper.return_value
        mock_instance.search = AsyncMock(return_value=[])
        resp = client.get("/api/search", params={"keyword": "nonexistent"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["keyword"] == "nonexistent"
    assert len(data["results"]) == 0
    assert data["source"] == "mixed"


def test_search_online_endpoint(client):
    mock_results = [
        {"title": "Online Song", "artist": "Online Artist", "source": "online", "source_id": "123"}
    ]
    with patch("app.routers.search.SearchScraper") as MockScraper:
        instance = MockScraper.return_value
        instance.search = AsyncMock(return_value=mock_results)
        response = client.get("/api/search/online?keyword=test")
        assert response.status_code == 200
        data = response.json()
        assert data["source"] == "online"
        assert len(data["results"]) == 1


def test_search_online(client: TestClient):
    online_results = [
        {
            "title": "Online Song",
            "artist": "Online Artist",
            "album": "Online Album",
            "duration": 180000,
            "source_id": "ext-123",
            "cover_url": None,
        }
    ]
    with patch("app.routers.search.SearchScraper") as MockScraper:
        mock_instance = MockScraper.return_value
        mock_instance.search = AsyncMock(return_value=online_results)
        resp = client.get("/api/search", params={"keyword": "Online"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["results"]) == 1
    assert data["results"][0]["title"] == "Online Song"
    assert data["results"][0]["source"] == "online"
