from app.scrapers.base import BaseScraper

class LyricsScraper(BaseScraper):
    def parse(self, content: str) -> str | None:
        return None

    async def search_lyrics(self, title: str, artist: str = None) -> list[dict]:
        try:
            query = f"{title} {artist}" if artist else title
            results = []
            for source in getattr(self, "sources", []):
                try:
                    url = source["search_url"].format(keyword=query)
                    content = await self.fetch(url)
                    parsed = self.parse(content)
                    if parsed:
                        results.append({"content": parsed, "source": source.get("name", "unknown")})
                except Exception:
                    continue
            return results
        except Exception:
            return []
