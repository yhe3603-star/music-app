from app.scrapers.base import BaseScraper

class SearchResult:
    def __init__(self, title, artist=None, album=None, duration=None, source_id=None, cover_url=None):
        self.title = title
        self.artist = artist
        self.album = album
        self.duration = duration
        self.source_id = source_id
        self.cover_url = cover_url

    def to_dict(self):
        return {
            "title": self.title, "artist": self.artist, "album": self.album,
            "duration": self.duration, "source_id": self.source_id,
            "cover_url": self.cover_url, "source": "online",
        }

class SearchScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.sources = []

    def parse(self, content: str) -> list[dict]:
        return []

    async def search(self, keyword: str) -> list[dict]:
        try:
            results = []
            for source in self.sources:
                try:
                    url = source["search_url"].format(keyword=keyword)
                    content = await self.fetch(url)
                    parsed = self.parse(content)
                    results.extend(parsed)
                except Exception:
                    continue
            return results
        except Exception:
            return []
