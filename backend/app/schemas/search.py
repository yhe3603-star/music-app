from pydantic import BaseModel
from typing import Optional


class SearchResultItem(BaseModel):
    title: str
    artist: Optional[str] = None
    album: Optional[str] = None
    duration: Optional[int] = None
    cover_url: Optional[str] = None
    source: str
    source_id: Optional[str] = None


class SearchResponse(BaseModel):
    keyword: str
    results: list[SearchResultItem]
    source: str
