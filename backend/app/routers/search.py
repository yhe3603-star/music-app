import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.song import Song
from app.models.search_cache import SearchCache
from app.scrapers.search_scraper import SearchScraper
from app.schemas.search import SearchResponse, SearchResultItem

router = APIRouter(prefix="/api/search", tags=["search"])

CACHE_TTL_HOURS = 24


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


def _get_cached_results(db: Session, keyword: str) -> list[dict] | None:
    cache = db.query(SearchCache).filter(SearchCache.keyword == keyword).first()
    if not cache:
        return None
    cached_at = cache.cached_at
    if cached_at and datetime.now(timezone.utc) - cached_at.replace(tzinfo=timezone.utc) > timedelta(hours=CACHE_TTL_HOURS):
        db.delete(cache)
        db.commit()
        return None
    try:
        return json.loads(cache.results)
    except (json.JSONDecodeError, TypeError):
        return None


def _cache_results(db: Session, keyword: str, results: list[dict]):
    existing = db.query(SearchCache).filter(SearchCache.keyword == keyword).first()
    if existing:
        existing.results = json.dumps(results)
        existing.cached_at = datetime.now(timezone.utc)
    else:
        db.add(SearchCache(keyword=keyword, results=json.dumps(results)))
    db.commit()


@router.get("", response_model=SearchResponse)
async def search_songs(keyword: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    local_results = _local_search(db, keyword)

    cached = _get_cached_results(db, keyword)
    if cached is not None:
        online_results = [
            SearchResultItem(
                title=r.get("title"), artist=r.get("artist"),
                album=r.get("album"), duration=r.get("duration"),
                cover_url=r.get("cover_url"), source="online",
                source_id=r.get("source_id"),
            )
            for r in cached
        ]
    else:
        try:
            scraper = SearchScraper()
            online_results_raw = await scraper.search(keyword)
            _cache_results(db, keyword, online_results_raw)
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
async def search_online(keyword: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    cached = _get_cached_results(db, keyword)
    if cached is not None:
        results = [
            SearchResultItem(
                title=r.get("title"), artist=r.get("artist"),
                album=r.get("album"), duration=r.get("duration"),
                cover_url=r.get("cover_url"), source="online",
                source_id=r.get("source_id"),
            )
            for r in cached
        ]
        return SearchResponse(keyword=keyword, results=results, source="online")

    try:
        scraper = SearchScraper()
        raw = await scraper.search(keyword)
        _cache_results(db, keyword, raw)
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
