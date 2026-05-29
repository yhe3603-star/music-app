"""Tests for data models."""
from datetime import datetime


def test_song_model_exists():
    """Song model can be imported."""
    from app.models.song import Song
    assert Song is not None


def test_song_columns():
    """Song model has required columns."""
    from app.models.song import Song
    columns = {c.name for c in Song.__table__.columns}
    assert "id" in columns
    assert "title" in columns
    assert "artist" in columns
    assert "album" in columns
    assert "duration" in columns
    assert "file_path" in columns
    assert "cover_url" in columns
    assert "source" in columns
    assert "source_id" in columns
    assert "created_at" in columns


def test_song_create_and_query(db):
    """Song can be created and queried from database."""
    from app.models.song import Song

    song = Song(
        title="Test Song",
        artist="Test Artist",
        album="Test Album",
        duration=180000,
        file_path="/path/to/file.mp3",
        cover_url="http://example.com/cover.jpg",
        source="local",
        source_id=None,
    )
    db.add(song)
    db.commit()
    db.refresh(song)

    assert song.id is not None
    assert song.title == "Test Song"
    assert song.artist == "Test Artist"
    assert song.created_at is not None

    queried = db.query(Song).filter(Song.title == "Test Song").first()
    assert queried is not None
    assert queried.id == song.id


def test_lyrics_model_exists():
    """Lyrics model can be imported."""
    from app.models.lyrics import Lyrics
    assert Lyrics is not None


def test_lyrics_create_and_query(db):
    """Lyrics can be created and queried from database."""
    from app.models.song import Song
    from app.models.lyrics import Lyrics

    song = Song(title="Song With Lyrics", artist="Artist")
    db.add(song)
    db.commit()
    db.refresh(song)

    lyrics = Lyrics(song_id=song.id, content="La la la", source="test")
    db.add(lyrics)
    db.commit()
    db.refresh(lyrics)

    assert lyrics.id is not None
    assert lyrics.song_id == song.id
    assert lyrics.content == "La la la"

    queried = db.query(Lyrics).filter(Lyrics.song_id == song.id).first()
    assert queried is not None
    assert queried.id == lyrics.id


def test_playlist_model_exists():
    """Playlist model can be imported."""
    from app.models.playlist import Playlist
    assert Playlist is not None


def test_playlist_create_and_query(db):
    """Playlist can be created and queried from database."""
    from app.models.playlist import Playlist

    playlist = Playlist(name="My Playlist", description="A test playlist")
    db.add(playlist)
    db.commit()
    db.refresh(playlist)

    assert playlist.id is not None
    assert playlist.name == "My Playlist"
    assert playlist.created_at is not None

    queried = db.query(Playlist).filter(Playlist.name == "My Playlist").first()
    assert queried is not None
    assert queried.id == playlist.id


def test_playlist_song_association(db):
    """PlaylistSong association works correctly."""
    from app.models.song import Song
    from app.models.playlist import Playlist, PlaylistSong

    playlist = Playlist(name="Test Playlist")
    song = Song(title="Associated Song", artist="Artist")
    db.add_all([playlist, song])
    db.commit()
    db.refresh(playlist)
    db.refresh(song)

    ps = PlaylistSong(playlist_id=playlist.id, song_id=song.id, sort_order=1)
    db.add(ps)
    db.commit()

    queried = db.query(PlaylistSong).filter(
        PlaylistSong.playlist_id == playlist.id,
        PlaylistSong.song_id == song.id
    ).first()
    assert queried is not None
    assert queried.sort_order == 1


def test_search_cache_model_exists():
    """SearchCache model can be imported."""
    from app.models.search_cache import SearchCache
    assert SearchCache is not None


def test_search_cache_create_and_query(db):
    """SearchCache can be created and queried from database."""
    from app.models.search_cache import SearchCache

    cache = SearchCache(
        keyword="test search",
        results='[{"title": "Song 1", "source": "local"}]',
    )
    db.add(cache)
    db.commit()
    db.refresh(cache)

    assert cache.id is not None
    assert cache.keyword == "test search"
    assert cache.cached_at is not None

    queried = db.query(SearchCache).filter(SearchCache.keyword == "test search").first()
    assert queried is not None
    assert queried.id == cache.id
