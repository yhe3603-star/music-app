from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base


class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    artist = Column(String, index=True)
    album = Column(String)
    duration = Column(Integer)  # milliseconds
    file_path = Column(String)
    cover_url = Column(String)
    source = Column(String, default="local")
    source_id = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
