from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional


class SongBase(BaseModel):
    title: str
    artist: Optional[str] = None
    album: Optional[str] = None
    duration: Optional[int] = None
    cover_url: Optional[str] = None


class SongCreate(SongBase):
    file_path: Optional[str] = None
    source: str = "local"
    source_id: Optional[str] = None


class SongResponse(SongBase):
    id: int
    file_path: Optional[str] = None
    source: str
    source_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SongListResponse(BaseModel):
    items: list[SongResponse]
    total: int
    page: int
    page_size: int
