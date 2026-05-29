from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Lyrics(Base):
    __tablename__ = "lyrics"

    id = Column(Integer, primary_key=True, index=True)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False, index=True)
    content = Column(String)
    source = Column(String)
