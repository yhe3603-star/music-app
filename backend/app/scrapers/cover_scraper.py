from app.scrapers.base import BaseScraper

class CoverScraper(BaseScraper):
    def parse(self, content: str) -> str | None:
        return None

    async def get_cover(self, album: str = None, artist: str = None) -> str | None:
        try:
            query = f"{album} {artist}" if album and artist else album or artist
            if not query:
                return None
            for source in getattr(self, "sources", []):
                try:
                    url = source["search_url"].format(keyword=query)
                    content = await self.fetch(url)
                    result = self.parse(content)
                    if result:
                        return result
                except Exception:
                    continue
            return None
        except Exception:
            return None
