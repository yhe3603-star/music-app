import asyncio
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.song import Song
from app.scrapers.search_scraper import SearchScraper
from app.schemas.search import SearchResponse, SearchResultItem

router = APIRouter(prefix="/api/search", tags=["search"])


def _local_search(db: Session, keyword: str) -> list[SearchResultItem]:
    songs = (
        db.query(Song)
        .filter((Song.title.contains(keyword)) | (Song.artist.contains(keyword)))
        .limit(20).all()
    )
    return [
        SearchResultItem(
            title=s.title, artist=s.artist, album=s.album,
            duration=s.duration, cover_url=s.cover_url,
            source="local", source_id=str(s.id),
        )
        for s in songs
    ]


@router.get("", response_model=SearchResponse)
async def search_songs(keyword: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    local_results = _local_search(db, keyword)
    try:
        scraper = SearchScraper()
        online_results_raw = await scraper.search(keyword)
        online_results = [
            SearchResultItem(
                title=r.get("title"), artist=r.get("artist"),
                album=r.get("album"), duration=r.get("duration"),
                cover_url=r.get("cover_url"), source="online",
                source_id=r.get("source_id"),
            )
            for r in online_results_raw
        ]
    except Exception:
        online_results = []

    all_results = local_results + online_results
    source = "mixed" if local_results and online_results else ("local" if local_results else "online" if online_results else "mixed")
    return SearchResponse(keyword=keyword, results=all_results, source=source)


@router.get("/online", response_model=SearchResponse)
async def search_online(keyword: str = Query(..., min_length=1)):
    try:
        scraper = SearchScraper()
        raw = await scraper.search(keyword)
        results = [
            SearchResultItem(
                title=r.get("title"), artist=r.get("artist"),
                album=r.get("album"), duration=r.get("duration"),
                cover_url=r.get("cover_url"), source="online",
                source_id=r.get("source_id"),
            )
            for r in raw
        ]
    except Exception:
        results = []
    return SearchResponse(keyword=keyword, results=results, source="online")
