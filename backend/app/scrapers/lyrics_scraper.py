from app.scrapers.base import BaseScraper
from urllib.parse import quote


class LyricsScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.sources = [
            {
                "name": "lrclib",
                "search_url": "https://lrclib.net/api/search?q={keyword}",
            }
        ]

    def parse(self, content: str) -> dict | None:
        import json
        try:
            data = json.loads(content)
            if isinstance(data, list) and len(data) > 0:
                track = data[0]
                synced = track.get("syncedLyrics")
                plain = track.get("plainLyrics")
                return {
                    "content": synced or plain or "",
                    "source": "lrclib",
                }
            return None
        except (json.JSONDecodeError, IndexError):
            return None

    async def search_lyrics(self, title: str, artist: str = None) -> list[dict]:
        try:
            query = f"{title} {artist}" if artist else title
            results = []
            for source in self.sources:
                try:
                    url = source["search_url"].format(keyword=quote(query))
                    content = await self.fetch(url)
                    parsed = self.parse(content)
                    if parsed:
                        results.append(parsed)
                except Exception:
                    continue
            return results
        except Exception:
            return []
