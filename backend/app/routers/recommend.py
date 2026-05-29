from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.recommend_service import RecommendService
from app.schemas.song import SongResponse

router = APIRouter(prefix="/api/recommend", tags=["recommend"])


@router.get("/{song_id}", response_model=list[SongResponse])
def recommend_songs(song_id: int, limit: int = 10, db: Session = Depends(get_db)):
    service = RecommendService(db)
    if not service.get_song(song_id):
        raise HTTPException(status_code=404, detail="Song not found")
    return service.recommend(song_id, limit)
