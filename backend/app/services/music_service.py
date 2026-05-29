from pathlib import Path
from sqlalchemy.orm import Session
from fastapi import UploadFile

from app.models.song import Song
from app.schemas.song import SongCreate
from app.config import settings


class MusicService:
    def __init__(self, db: Session):
        self.db = db

    def create_song(self, song_data: SongCreate) -> Song:
        song = Song(**song_data.model_dump())
        self.db.add(song)
        self.db.commit()
        self.db.refresh(song)
        return song

    def list_songs(self, page: int = 1, page_size: int = 20, search: str = None):
        query = self.db.query(Song)
        if search:
            query = query.filter(
                (Song.title.contains(search)) | (Song.artist.contains(search))
            )
        total = query.count()
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return {"items": items, "total": total, "page": page, "page_size": page_size}

    def get_song(self, song_id: int) -> Song | None:
        return self.db.query(Song).filter(Song.id == song_id).first()

    def delete_song(self, song_id: int) -> bool:
        song = self.get_song(song_id)
        if not song:
            return False
        if song.file_path:
            file_path = Path(song.file_path)
            if file_path.exists():
                file_path.unlink()
        self.db.delete(song)
        self.db.commit()
        return True

    async def upload_song(self, file: UploadFile, title: str = None, artist: str = None) -> Song:
        settings.storage_path.mkdir(parents=True, exist_ok=True)
        file_path = settings.storage_path / file.filename
        content = await file.read()
        file_path.write_bytes(content)
        song_data = SongCreate(
            title=title or file.filename,
            artist=artist,
            file_path=str(file_path),
            source="local",
        )
        return self.create_song(song_data)

    def get_song_stream_path(self, song_id: int) -> Path | None:
        song = self.get_song(song_id)
        if not song or not song.file_path:
            return None
        path = Path(song.file_path)
        if not path.exists():
            return None
        return path
