from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    app_name: str = "Music App"
    database_url: str = "sqlite:///./music.db"
    storage_path: Path = Path(__file__).parent.parent / "storage"
    host: str = "0.0.0.0"
    port: int = 8000

    model_config = {"env_file": ".env"}


settings = Settings()
