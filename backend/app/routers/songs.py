from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
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


@router.get("/{song_id}/lyrics")
def get_lyrics(song_id: int, db: Session = Depends(get_db)):
    service = MusicService(db)
    lyrics = service.get_lyrics(song_id)
    if not lyrics:
        raise HTTPException(status_code=404, detail="Lyrics not found")
    return {"song_id": song_id, "content": lyrics.content, "source": lyrics.source}
