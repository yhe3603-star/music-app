from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.recommend_service import RecommendService
from app.schemas.song import SongResponse

router = APIRouter(prefix="/api/recommend", tags=["recommend"])


@router.get("/{song_id}", response_model=list[SongResponse])
def recommend_songs(song_id: int, limit: int = 10, db: Session = Depends(get_db)):
    service = RecommendService(db)
    results = service.recommend(song_id, limit)
    if not results:
        from app.models.song import Song
        song = db.query(Song).filter(Song.id == song_id).first()
        if not song:
            raise HTTPException(status_code=404, detail="Song not found")
    return results
