from app.scrapers.base import BaseScraper
from urllib.parse import quote


class SearchScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.sources = [
            {
                "name": "musicbrainz",
                "search_url": "https://musicbrainz.org/ws/2/recording/?query={keyword}&fmt=json&limit=10",
            }
        ]

    def parse(self, content: str) -> list[dict]:
        import json
        try:
            data = json.loads(content)
            results = []
            for recording in data.get("recordings", []):
                title = recording.get("title", "")
                artist = ""
                if recording.get("artist-credit"):
                    artist = recording["artist-credit"][0].get("name", "")
                album = ""
                duration = None
                if recording.get("releases"):
                    album = recording["releases"][0].get("title", "")
                if recording.get("length"):
                    duration = recording["length"]  # milliseconds
                source_id = recording.get("id", "")
                cover_url = None
                if recording.get("releases") and recording["releases"][0].get("id"):
                    release_id = recording["releases"][0]["id"]
                    cover_url = f"https://coverartarchive.org/release/{release_id}/front-250"
                results.append({
                    "title": title,
                    "artist": artist,
                    "album": album,
                    "duration": duration,
                    "source_id": source_id,
                    "cover_url": cover_url,
                })
            return results
        except (json.JSONDecodeError, KeyError, IndexError):
            return []

    async def search(self, keyword: str) -> list[dict]:
        try:
            results = []
            for source in self.sources:
                try:
                    url = source["search_url"].format(keyword=quote(keyword))
                    content = await self.fetch(url)
                    parsed = self.parse(content)
                    results.extend(parsed)
                except Exception:
                    continue
            return results
        except Exception:
            return []
