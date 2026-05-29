import asyncio
import random
from typing import Any
import httpx

USER_AGENTS = [
    "MusicApp/1.0 (musicapp@local.dev)",  # Required by MusicBrainz
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
]

class BaseScraper:
    def __init__(self):
        self._last_request_time = 0

    async def fetch(self, url: str, params: dict = None) -> str:
        headers = {"User-Agent": random.choice(USER_AGENTS)}
        async with httpx.AsyncClient(timeout=10.0) as client:
            await self.rate_limit()
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            return response.text

    def parse(self, content: str) -> Any:
        raise NotImplementedError

    async def rate_limit(self):
        now = asyncio.get_event_loop().time()
        elapsed = now - self._last_request_time
        min_delay = 1.0
        if elapsed < min_delay:
            await asyncio.sleep(min_delay - elapsed + random.uniform(0, 2.0))
        self._last_request_time = asyncio.get_event_loop().time()
