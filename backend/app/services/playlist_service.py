from sqlalchemy.orm import Session
from app.models.playlist import Playlist, PlaylistSong
from app.models.song import Song
from app.schemas.playlist import PlaylistCreate, PlaylistUpdate


class PlaylistService:
    def __init__(self, db: Session):
        self.db = db

    def create_playlist(self, data: PlaylistCreate) -> Playlist:
        playlist = Playlist(**data.model_dump())
        self.db.add(playlist)
        self.db.commit()
        self.db.refresh(playlist)
        return playlist

    def list_playlists(self) -> list[Playlist]:
        return self.db.query(Playlist).all()

    def get_playlist(self, playlist_id: int) -> Playlist | None:
        return self.db.query(Playlist).filter(Playlist.id == playlist_id).first()

    def update_playlist(self, playlist_id: int, data: PlaylistUpdate) -> Playlist | None:
        playlist = self.get_playlist(playlist_id)
        if not playlist:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(playlist, key, value)
        self.db.commit()
        self.db.refresh(playlist)
        return playlist

    def delete_playlist(self, playlist_id: int) -> bool:
        playlist = self.get_playlist(playlist_id)
        if not playlist:
            return False
        self.db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id).delete()
        self.db.delete(playlist)
        self.db.commit()
        return True

    def add_song(self, playlist_id: int, song_id: int, sort_order: int = 0) -> bool:
        playlist = self.get_playlist(playlist_id)
        song = self.db.query(Song).filter(Song.id == song_id).first()
        if not playlist or not song:
            return False
        existing = (
            self.db.query(PlaylistSong)
            .filter(PlaylistSong.playlist_id == playlist_id, PlaylistSong.song_id == song_id)
            .first()
        )
        if existing:
            return True
        ps = PlaylistSong(playlist_id=playlist_id, song_id=song_id, sort_order=sort_order)
        self.db.add(ps)
        self.db.commit()
        return True

    def get_songs(self, playlist_id: int) -> list[Song]:
        return (
            self.db.query(Song)
            .join(PlaylistSong, PlaylistSong.song_id == Song.id)
            .filter(PlaylistSong.playlist_id == playlist_id)
            .order_by(PlaylistSong.sort_order)
            .all()
        )

    def remove_song(self, playlist_id: int, song_id: int) -> bool:
        ps = (
            self.db.query(PlaylistSong)
            .filter(PlaylistSong.playlist_id == playlist_id, PlaylistSong.song_id == song_id)
            .first()
        )
        if not ps:
            return False
        self.db.delete(ps)
        self.db.commit()
        return True
