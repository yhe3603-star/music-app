import pytest
from unittest.mock import AsyncMock, patch
from app.services.tag_service import TagService
from app.models.song import Song
from app.models.lyrics import Lyrics


@pytest.mark.asyncio
async def test_auto_tag_song_not_found(db):
    service = TagService(db)
    result = await service.auto_tag_song(999)
    assert result is None


@pytest.mark.asyncio
async def test_auto_tag_song_updates_fields(db):
    song = Song(title="Test Song", artist="Test Artist", source="local")
    db.add(song)
    db.commit()
    db.refresh(song)

    service = TagService(db)

    mock_search_results = [{
        "title": "Test Song",
        "artist": "Test Artist",
        "album": "Test Album",
        "duration": 180000,
        "cover_url": "http://example.com/cover.jpg",
        "source_id": "ext-123",
    }]
    mock_lyrics_results = [{"content": "[00:01.00]Hello", "source": "lrclib"}]

    with patch("app.scrapers.search_scraper.SearchScraper") as MockSearch, \
         patch("app.scrapers.lyrics_scraper.LyricsScraper") as MockLyrics:
        MockSearch.return_value.search = AsyncMock(return_value=mock_search_results)
        MockLyrics.return_value.search_lyrics = AsyncMock(return_value=mock_lyrics_results)

        result = await service.auto_tag_song(song.id)

    assert result is not None
    assert "album" in result["updated_fields"]
    assert "duration" in result["updated_fields"]
    assert "cover_url" in result["updated_fields"]
    assert "lyrics" in result["updated_fields"]


@pytest.mark.asyncio
async def test_batch_auto_tag(db):
    for i in range(3):
        db.add(Song(title=f"Song {i}", artist="Artist", source="local"))
    db.commit()

    service = TagService(db)

    with patch("app.scrapers.search_scraper.SearchScraper") as MockSearch, \
         patch("app.scrapers.lyrics_scraper.LyricsScraper") as MockLyrics:
        MockSearch.return_value.search = AsyncMock(return_value=[])
        MockLyrics.return_value.search_lyrics = AsyncMock(return_value=[])

        result = await service.batch_auto_tag()

    assert result["processed"] == 3
