import pytest
from fastapi.testclient import TestClient


def _create_test_song(client: TestClient) -> int:
    resp = client.post("/api/songs", json={
        "title": "Test Song",
        "artist": "Test Artist",
        "source": "local",
    })
    return resp.json()["id"]


def test_create_playlist(client: TestClient):
    resp = client.post("/api/playlists", json={
        "name": "My Playlist",
        "description": "A test playlist",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "My Playlist"
    assert data["description"] == "A test playlist"
    assert "id" in data


def test_list_playlists(client: TestClient):
    for i in range(2):
        client.post("/api/playlists", json={"name": f"Playlist {i}"})
    resp = client.get("/api/playlists")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2


def test_update_playlist(client: TestClient):
    create_resp = client.post("/api/playlists", json={"name": "Old Name"})
    playlist_id = create_resp.json()["id"]
    resp = client.put(f"/api/playlists/{playlist_id}", json={"name": "New Name"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"


def test_delete_playlist(client: TestClient):
    create_resp = client.post("/api/playlists", json={"name": "Delete Me"})
    playlist_id = create_resp.json()["id"]
    resp = client.delete(f"/api/playlists/{playlist_id}")
    assert resp.status_code == 200
    assert resp.json()["message"] == "Playlist deleted"

    resp = client.get("/api/playlists")
    assert resp.status_code == 200
    assert len(resp.json()) == 0


def test_add_song_to_playlist(client: TestClient):
    song_id = _create_test_song(client)
    playlist_resp = client.post("/api/playlists", json={"name": "My Playlist"})
    playlist_id = playlist_resp.json()["id"]
    resp = client.post(
        f"/api/playlists/{playlist_id}/songs",
        json={"song_id": song_id, "sort_order": 0},
    )
    assert resp.status_code == 200
    assert resp.json()["message"] == "Song added to playlist"


def test_get_playlist_songs(client: TestClient):
    song_id = _create_test_song(client)
    playlist_resp = client.post("/api/playlists", json={"name": "With Songs"})
    playlist_id = playlist_resp.json()["id"]
    client.post(
        f"/api/playlists/{playlist_id}/songs",
        json={"song_id": song_id, "sort_order": 0},
    )
    resp = client.get(f"/api/playlists/{playlist_id}/songs")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["id"] == song_id


def test_remove_song_from_playlist(client: TestClient):
    song_id = _create_test_song(client)
    playlist_resp = client.post("/api/playlists", json={"name": "Remove Test"})
    playlist_id = playlist_resp.json()["id"]
    client.post(
        f"/api/playlists/{playlist_id}/songs",
        json={"song_id": song_id, "sort_order": 0},
    )
    resp = client.delete(f"/api/playlists/{playlist_id}/songs/{song_id}")
    assert resp.status_code == 200
    assert resp.json()["message"] == "Song removed from playlist"

    resp = client.get(f"/api/playlists/{playlist_id}/songs")
    assert resp.status_code == 200
    assert len(resp.json()) == 0
