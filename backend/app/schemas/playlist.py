from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class PlaylistBase(BaseModel):
    name: str
    description: Optional[str] = None
    cover_url: Optional[str] = None


class PlaylistCreate(PlaylistBase):
    pass


class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None


class PlaylistResponse(PlaylistBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AddSongToPlaylist(BaseModel):
    song_id: int
    sort_order: Optional[int] = 0
