from app.scrapers.base import BaseScraper
from urllib.parse import quote


class CoverScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.sources = [
            {
                "name": "musicbrainz_search",
                "search_url": "https://musicbrainz.org/ws/2/release/?query={keyword}&fmt=json&limit=1",
            }
        ]

    def parse(self, content: str) -> str | None:
        import json
        try:
            data = json.loads(content)
            releases = data.get("releases", [])
            if releases:
                release_id = releases[0].get("id")
                if release_id:
                    return f"https://coverartarchive.org/release/{release_id}/front-250"
            return None
        except (json.JSONDecodeError, KeyError, IndexError):
            return None

    async def get_cover(self, album: str = None, artist: str = None) -> str | None:
        try:
            query = f"{album} {artist}" if album and artist else album or artist
            if not query:
                return None
            for source in self.sources:
                try:
                    url = source["search_url"].format(keyword=quote(query))
                    content = await self.fetch(url)
                    result = self.parse(content)
                    if result:
                        return result
                except Exception:
                    continue
            return None
        except Exception:
            return None
