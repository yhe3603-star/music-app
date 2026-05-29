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

    async def test_returns_empty_on_error(self):
        scraper = SearchScraper()
        with patch.object(scraper, "fetch", side_effect=Exception("network error")):
            results = await scraper.search("test query")
            assert results == []


class TestLyricsScraper:
    def test_inherits_base_scraper(self):
        scraper = LyricsScraper()
        assert isinstance(scraper, BaseScraper)

    def test_has_search_lyrics_method(self):
        scraper = LyricsScraper()
        assert hasattr(scraper, "search_lyrics")
        assert callable(scraper.search_lyrics)

    async def test_returns_empty_on_error(self):
        scraper = LyricsScraper()
        with patch.object(scraper, "fetch", side_effect=Exception("network error")):
            results = await scraper.search_lyrics("title", "artist")
            assert results == []
