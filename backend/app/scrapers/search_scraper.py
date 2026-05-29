from app.scrapers.base import BaseScraper

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
