import logging
from sqlalchemy.orm import Session

from app.models.song import Song
from app.models.lyrics import Lyrics

logger = logging.getLogger(__name__)


class TagService:
    def __init__(self, db: Session):
        self.db = db

    async def auto_tag_song(self, song_id: int) -> dict:
        song = self.db.query(Song).filter(Song.id == song_id).first()
        if not song:
            return None

        updated_fields = []

        try:
            from app.scrapers.search_scraper import SearchScraper
            scraper = SearchScraper()
            query = f"{song.title} {song.artist}" if song.artist else song.title
            results = await scraper.search(query)

            if results:
                best = results[0]
                if best.get("title") and not song.title:
                    song.title = best["title"]
                    updated_fields.append("title")
                if best.get("artist") and not song.artist:
                    song.artist = best["artist"]
                    updated_fields.append("artist")
                if best.get("album") and not song.album:
                    song.album = best["album"]
                    updated_fields.append("album")
                if best.get("duration") and not song.duration:
                    song.duration = best["duration"]
                    updated_fields.append("duration")
                if best.get("cover_url") and not song.cover_url:
                    song.cover_url = best["cover_url"]
                    updated_fields.append("cover_url")
        except Exception as e:
            logger.warning("Failed to fetch metadata for song %d: %s", song_id, e)

        try:
            from app.scrapers.lyrics_scraper import LyricsScraper
            existing_lyrics = self.db.query(Lyrics).filter(Lyrics.song_id == song_id).first()
            if not existing_lyrics:
                lyrics_scraper = LyricsScraper()
                lyrics_results = await lyrics_scraper.search_lyrics(song.title, song.artist)
                if lyrics_results:
                    self.db.add(Lyrics(
                        song_id=song_id,
                        content=lyrics_results[0].get("content", ""),
                        source=lyrics_results[0].get("source", "lrclib"),
                    ))
                    updated_fields.append("lyrics")
        except Exception as e:
            logger.warning("Failed to fetch lyrics for song %d: %s", song_id, e)

        self.db.commit()
        self.db.refresh(song)

        return {
            "song_id": song_id,
            "updated_fields": updated_fields,
            "message": f"Updated {len(updated_fields)} fields" if updated_fields else "No updates needed",
        }

    async def batch_auto_tag(self, limit: int = 50) -> dict:
        from app.scrapers.search_scraper import SearchScraper
        from app.scrapers.lyrics_scraper import LyricsScraper

        songs = self.db.query(Song).limit(limit).all()
        scraper = SearchScraper()
        lyrics_scraper = LyricsScraper()
        results = []

        for song in songs:
            try:
                updated_fields = []

                if not song.cover_url:
                    query = f"{song.title} {song.artist}" if song.artist else song.title
                    search_results = await scraper.search(query)
                    if search_results and search_results[0].get("cover_url"):
                        song.cover_url = search_results[0]["cover_url"]
                        updated_fields.append("cover_url")

                existing_lyrics = self.db.query(Lyrics).filter(Lyrics.song_id == song.id).first()
                if not existing_lyrics:
                    lyrics_results = await lyrics_scraper.search_lyrics(song.title, song.artist)
                    if lyrics_results:
                        self.db.add(Lyrics(
                            song_id=song.id,
                            content=lyrics_results[0].get("content", ""),
                            source=lyrics_results[0].get("source", "lrclib"),
                        ))
                        updated_fields.append("lyrics")

                results.append({"song_id": song.id, "title": song.title, "updated": updated_fields})
            except Exception as e:
                logger.warning("Failed to auto-tag song %d: %s", song.id, e)
                results.append({"song_id": song.id, "title": song.title, "error": str(e)})

        self.db.commit()
        return {"processed": len(results), "results": results}
