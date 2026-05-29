from sqlalchemy.orm import Session
from app.models.song import Song


class RecommendService:
    def __init__(self, db: Session):
        self.db = db

    def get_song(self, song_id: int) -> Song | None:
        return self.db.query(Song).filter(Song.id == song_id).first()

    def recommend(self, song_id: int, limit: int = 10) -> list[Song]:
        song = self.get_song(song_id)
        if not song:
            return []
        candidates = (
            self.db.query(Song)
            .filter(Song.id != song_id)
            .filter(
                (Song.artist == song.artist) | (Song.album == song.album)
            )
            .limit(limit * 3)
            .all()
        )
        if not candidates:
            return []
        scored = []
        for s in candidates:
            score = 0
            if song.artist and s.artist and song.artist == s.artist:
                score += 3
            if song.album and s.album and song.album == s.album:
                score += 2
            scored.append((score, s))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [s for _, s in scored[:limit]]
