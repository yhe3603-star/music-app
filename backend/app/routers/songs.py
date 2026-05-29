from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.song import Song
from app.models.lyrics import Lyrics
from app.services.music_service import MusicService
from app.schemas.song import SongCreate, SongResponse, SongListResponse

router = APIRouter(prefix="/api/songs", tags=["songs"])


@router.post("", response_model=SongResponse)
def create_song(song_data: SongCreate, db: Session = Depends(get_db)):
    service = MusicService(db)
    return service.create_song(song_data)


@router.get("", response_model=SongListResponse)
def list_songs(
    page: int = 1, page_size: int = 20, search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    service = MusicService(db)
    return service.list_songs(page=page, page_size=page_size, search=search)


@router.get("/{song_id}", response_model=SongResponse)
def get_song(song_id: int, db: Session = Depends(get_db)):
    service = MusicService(db)
    song = service.get_song(song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@router.delete("/{song_id}")
def delete_song(song_id: int, db: Session = Depends(get_db)):
    service = MusicService(db)
    if not service.delete_song(song_id):
        raise HTTPException(status_code=404, detail="Song not found")
    return {"message": "Song deleted"}


@router.post("/upload", response_model=SongResponse)
async def upload_song(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    artist: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    service = MusicService(db)
    return await service.upload_song(file, title=title, artist=artist)


@router.get("/{song_id}/stream")
def stream_song(song_id: int, request: Request, db: Session = Depends(get_db)):
    service = MusicService(db)
    file_path = service.get_song_stream_path(song_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="Audio file not found")

    file_size = file_path.stat().st_size
    content_type = "audio/mpeg"

    range_header = request.headers.get("range")
    if range_header:
        try:
            range_spec = range_header.replace("bytes=", "").strip()
            start_str, end_str = range_spec.split("-")
            start = int(start_str)
            end = int(end_str) if end_str else file_size - 1

            if start >= file_size or start > end or start < 0:
                raise HTTPException(status_code=416, detail="Range not satisfiable")
        except (ValueError, IndexError):
            raise HTTPException(status_code=416, detail="Invalid Range header")
        content_length = end - start + 1

        def iter_file():
            with open(file_path, "rb") as f:
                f.seek(start)
                remaining = content_length
                while remaining > 0:
                    chunk_size = min(8192, remaining)
                    data = f.read(chunk_size)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

        return StreamingResponse(
            iter_file(),
            status_code=206,
            media_type=content_type,
            headers={
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(content_length),
            },
        )

    return FileResponse(file_path, media_type=content_type)


@router.get("/{song_id}/download")
def download_song(song_id: int, db: Session = Depends(get_db)):
    service = MusicService(db)
    file_path = service.get_song_stream_path(song_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="Audio file not found")

    song = service.get_song(song_id)
    filename = f"{song.artist} - {song.title}{file_path.suffix}" if song.artist else f"{song.title}{file_path.suffix}"
    # Sanitize filename for Content-Disposition
    filename = filename.replace("/", "_").replace("\\", "_")

    return FileResponse(
        file_path,
        media_type="audio/mpeg",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{song_id}/lyrics")
def get_lyrics(song_id: int, db: Session = Depends(get_db)):
    service = MusicService(db)
    lyrics = service.get_lyrics(song_id)
    if not lyrics:
        raise HTTPException(status_code=404, detail="Lyrics not found")
    return {"song_id": song_id, "content": lyrics.content, "source": lyrics.source}


@router.post("/batch-upload")
async def batch_upload_songs(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    service = MusicService(db)
    results = []
    for file in files:
        try:
            song = await service.upload_song(file)
            results.append({"filename": file.filename, "song_id": song.id, "status": "success"})
        except Exception as e:
            results.append({"filename": file.filename, "status": "error", "error": str(e)})
    return {"uploaded": len([r for r in results if r["status"] == "success"]), "results": results}


@router.post("/scan-directory")
async def scan_directory(
    directory: str = Form(...),
    db: Session = Depends(get_db),
):
    from pathlib import Path

    dir_path = Path(directory)
    if not dir_path.exists() or not dir_path.is_dir():
        raise HTTPException(status_code=400, detail="Directory not found")

    music_extensions = {'.mp3', '.flac', '.wav', '.m4a', '.ogg', '.wma', '.aac'}
    service = MusicService(db)
    results = []

    for file_path in sorted(dir_path.rglob("*")):
        if file_path.suffix.lower() in music_extensions:
            # Check if already imported
            existing = db.query(Song).filter(Song.file_path == str(file_path)).first()
            if existing:
                results.append({"file": str(file_path), "status": "skipped", "reason": "already imported"})
                continue

            try:
                # Try to extract metadata from filename
                title = file_path.stem
                artist = None
                album = None

                # Try "Artist - Title" format
                if " - " in title:
                    parts = title.split(" - ", 1)
                    artist = parts[0].strip()
                    title = parts[1].strip()

                # Try to get parent folder as album
                if file_path.parent.name != dir_path.name:
                    album = file_path.parent.name

                song_data = SongCreate(
                    title=title,
                    artist=artist,
                    album=album,
                    file_path=str(file_path),
                    source="local",
                )
                service.create_song(song_data)
                results.append({"file": str(file_path), "status": "imported", "title": title})
            except Exception as e:
                results.append({"file": str(file_path), "status": "error", "error": str(e)})

    return {
        "directory": str(dir_path),
        "total_found": len(results),
        "imported": len([r for r in results if r["status"] == "imported"]),
        "skipped": len([r for r in results if r["status"] == "skipped"]),
        "errors": len([r for r in results if r["status"] == "error"]),
        "results": results,
    }


@router.post("/{song_id}/auto-tag")
async def auto_tag_song(song_id: int, db: Session = Depends(get_db)):
    service = MusicService(db)
    song = service.get_song(song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    updated_fields = []

    # Search for metadata online
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
    except Exception:
        pass

    # Fetch lyrics
    try:
        from app.scrapers.lyrics_scraper import LyricsScraper

        existing_lyrics = db.query(Lyrics).filter(Lyrics.song_id == song_id).first()
        if not existing_lyrics:
            lyrics_scraper = LyricsScraper()
            lyrics_results = await lyrics_scraper.search_lyrics(song.title, song.artist)
            if lyrics_results:
                lyrics = Lyrics(
                    song_id=song_id,
                    content=lyrics_results[0].get("content", ""),
                    source=lyrics_results[0].get("source", "lrclib"),
                )
                db.add(lyrics)
                updated_fields.append("lyrics")
    except Exception:
        pass

    db.commit()
    db.refresh(song)

    return {
        "song_id": song_id,
        "updated_fields": updated_fields,
        "message": f"Updated {len(updated_fields)} fields" if updated_fields else "No updates needed",
    }


@router.post("/batch-auto-tag")
async def batch_auto_tag(db: Session = Depends(get_db)):
    service = MusicService(db)
    songs = db.query(Song).limit(50).all()
    results = []

    for song in songs:
        try:
            updated_fields = []

            from app.scrapers.search_scraper import SearchScraper
            from app.scrapers.lyrics_scraper import LyricsScraper

            if not song.cover_url:
                scraper = SearchScraper()
                query = f"{song.title} {song.artist}" if song.artist else song.title
                search_results = await scraper.search(query)
                if search_results and search_results[0].get("cover_url"):
                    song.cover_url = search_results[0]["cover_url"]
                    updated_fields.append("cover_url")

            existing_lyrics = db.query(Lyrics).filter(Lyrics.song_id == song.id).first()
            if not existing_lyrics:
                lyrics_scraper = LyricsScraper()
                lyrics_results = await lyrics_scraper.search_lyrics(song.title, song.artist)
                if lyrics_results:
                    db.add(Lyrics(
                        song_id=song.id,
                        content=lyrics_results[0].get("content", ""),
                        source=lyrics_results[0].get("source", "lrclib"),
                    ))
                    updated_fields.append("lyrics")

            results.append({"song_id": song.id, "title": song.title, "updated": updated_fields})
        except Exception as e:
            results.append({"song_id": song.id, "title": song.title, "error": str(e)})

    db.commit()
    return {"processed": len(results), "results": results}
