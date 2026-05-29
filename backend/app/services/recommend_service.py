from sqlalchemy.orm import Session
from app.models.song import Song


class RecommendService:
    def __init__(self, db: Session):
        self.db = db

    def recommend(self, song_id: int, limit: int = 10) -> list[Song]:
        song = self.db.query(Song).filter(Song.id == song_id).first()
        if not song:
            return []
        candidates = self.db.query(Song).filter(Song.id != song_id).all()
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
