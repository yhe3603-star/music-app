from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base


class SearchCache(Base):
    __tablename__ = "search_cache"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, nullable=False, index=True)
    results = Column(String)  # JSON string
    cached_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
