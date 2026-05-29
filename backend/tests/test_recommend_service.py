import pytest
from app.services.recommend_service import RecommendService
from app.models.song import Song


def test_get_song_exists(db):
    song = Song(title="Test", artist="Artist", source="local")
    db.add(song)
    db.commit()
    db.refresh(song)

    service = RecommendService(db)
    result = service.get_song(song.id)
    assert result is not None
    assert result.title == "Test"


def test_get_song_not_found(db):
    service = RecommendService(db)
    assert service.get_song(999) is None


def test_recommend_by_artist(db):
    songs = [
        Song(title="Song A", artist="Same", album="X", source="local"),
        Song(title="Song B", artist="Same", album="X", source="local"),
        Song(title="Song C", artist="Other", source="local"),
    ]
    db.add_all(songs)
    db.commit()

    service = RecommendService(db)
    results = service.recommend(songs[0].id)
    assert len(results) >= 1
    titles = [s.title for s in results]
    assert "Song B" in titles


def test_recommend_empty_for_only_song(db):
    song = Song(title="Only", artist="Solo", source="local")
    db.add(song)
    db.commit()

    service = RecommendService(db)
    assert service.recommend(song.id) == []


def test_recommend_not_found(db):
    service = RecommendService(db)
    assert service.recommend(999) == []
