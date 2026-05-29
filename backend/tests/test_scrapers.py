import json
import pytest
from unittest.mock import AsyncMock, patch
from app.scrapers.base import BaseScraper
from app.scrapers.search_scraper import SearchScraper
from app.scrapers.lyrics_scraper import LyricsScraper
from app.scrapers.cover_scraper import CoverScraper


class TestBaseScraper:
    def test_has_fetch_method(self):
        scraper = BaseScraper()
        assert hasattr(scraper, "fetch")
        assert callable(scraper.fetch)

    def test_has_parse_method(self):
        scraper = BaseScraper()
        assert hasattr(scraper, "parse")
        assert callable(scraper.parse)

    def test_parse_raises_not_implemented(self):
        scraper = BaseScraper()
        with pytest.raises(NotImplementedError):
            scraper.parse("some content")


class TestSearchScraper:
    def test_inherits_base_scraper(self):
        scraper = SearchScraper()
        assert isinstance(scraper, BaseScraper)

    def test_has_search_method(self):
        scraper = SearchScraper()
        assert hasattr(scraper, "search")
        assert callable(scraper.search)

    @pytest.mark.asyncio
    async def test_search_returns_empty_on_error(self):
        scraper = SearchScraper()
        scraper.sources = [{"search_url": "https://example.com/search?q={keyword}"}]
        with patch.object(scraper, "fetch", new_callable=AsyncMock, side_effect=Exception("network error")):
            result = await scraper.search("test query")
            assert result == []


class TestSearchScraperParsing:
    def test_parse_musicbrainz_results(self):
        scraper = SearchScraper()
        content = json.dumps({
            "recordings": [{
                "title": "Bohemian Rhapsody",
                "artist-credit": [{"name": "Queen"}],
                "releases": [{"title": "A Night at the Opera", "id": "release-id-123"}],
                "length": 354000,
                "id": "recording-id-456",
            }]
        })
        results = scraper.parse(content)
        assert len(results) == 1
        assert results[0]["title"] == "Bohemian Rhapsody"
        assert results[0]["artist"] == "Queen"
        assert results[0]["album"] == "A Night at the Opera"
        assert results[0]["duration"] == 354000
        assert "coverartarchive.org" in results[0]["cover_url"]

    def test_parse_empty_results(self):
        scraper = SearchScraper()
        assert scraper.parse('{"recordings": []}') == []

    def test_parse_invalid_json(self):
        scraper = SearchScraper()
        assert scraper.parse("not json") == []


class TestLyricsScraper:
    def test_inherits_base_scraper(self):
        scraper = LyricsScraper()
        assert isinstance(scraper, BaseScraper)

    def test_has_search_lyrics_method(self):
        scraper = LyricsScraper()
        assert hasattr(scraper, "search_lyrics")
        assert callable(scraper.search_lyrics)

    @pytest.mark.asyncio
    async def test_search_lyrics_returns_empty_on_error(self):
        scraper = LyricsScraper()
        scraper.sources = [{"search_url": "https://example.com/search?q={keyword}", "name": "test"}]
        with patch.object(scraper, "fetch", new_callable=AsyncMock, side_effect=Exception("network error")):
            result = await scraper.search_lyrics("title", "artist")
            assert result == []


class TestLyricsScraperParsing:
    def test_parse_lrclib_results(self):
        scraper = LyricsScraper()
        content = json.dumps([{
            "syncedLyrics": "[00:01.00]Hello world\n[00:05.00]Test lyrics",
            "plainLyrics": "Hello world\nTest lyrics",
        }])
        result = scraper.parse(content)
        assert result is not None
        assert "[00:01.00]" in result["content"]
        assert result["source"] == "lrclib"

    def test_parse_empty_lyrics(self):
        scraper = LyricsScraper()
        assert scraper.parse("[]") is None

    def test_parse_invalid_json(self):
        scraper = LyricsScraper()
        assert scraper.parse("not json") is None


class TestCoverScraper:
    def test_cover_scraper_inherits_base(self):
        assert issubclass(CoverScraper, BaseScraper)

    def test_cover_scraper_has_get_cover(self):
        assert hasattr(CoverScraper, "get_cover")

    @pytest.mark.asyncio
    async def test_get_cover_returns_none_on_error(self):
        scraper = CoverScraper()
        scraper.sources = [{"search_url": "https://example.com/search?q={keyword}"}]
        with patch.object(scraper, "fetch", new_callable=AsyncMock, side_effect=Exception("network error")):
            result = await scraper.get_cover(album="Test Album", artist="Test Artist")
            assert result is None


class TestCoverScraperParsing:
    def test_parse_cover_art_archive(self):
        scraper = CoverScraper()
        content = json.dumps({"releases": [{"id": "abc-123"}]})
        result = scraper.parse(content)
        assert result is not None
        assert result == "https://coverartarchive.org/release/abc-123/front-250"

    def test_parse_no_releases(self):
        scraper = CoverScraper()
        assert scraper.parse('{"releases": []}') is None
