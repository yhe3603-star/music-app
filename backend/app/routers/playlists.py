from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.playlist_service import PlaylistService
from app.schemas.playlist import (
    PlaylistCreate, PlaylistUpdate, PlaylistResponse, AddSongToPlaylist,
)
from app.schemas.song import SongResponse

router = APIRouter(prefix="/api/playlists", tags=["playlists"])


@router.post("", response_model=PlaylistResponse)
def create_playlist(data: PlaylistCreate, db: Session = Depends(get_db)):
    service = PlaylistService(db)
    return service.create_playlist(data)


@router.get("", response_model=list[PlaylistResponse])
def list_playlists(db: Session = Depends(get_db)):
    service = PlaylistService(db)
    return service.list_playlists()


@router.put("/{playlist_id}", response_model=PlaylistResponse)
def update_playlist(playlist_id: int, data: PlaylistUpdate, db: Session = Depends(get_db)):
    service = PlaylistService(db)
    playlist = service.update_playlist(playlist_id, data)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return playlist


@router.delete("/{playlist_id}")
def delete_playlist(playlist_id: int, db: Session = Depends(get_db)):
    service = PlaylistService(db)
    if not service.delete_playlist(playlist_id):
        raise HTTPException(status_code=404, detail="Playlist not found")
    return {"message": "Playlist deleted"}


@router.post("/{playlist_id}/songs")
def add_song_to_playlist(playlist_id: int, data: AddSongToPlaylist, db: Session = Depends(get_db)):
    service = PlaylistService(db)
    if not service.add_song(playlist_id, data.song_id, data.sort_order):
        raise HTTPException(status_code=404, detail="Playlist or song not found")
    return {"message": "Song added to playlist"}


@router.get("/{playlist_id}/songs", response_model=list[SongResponse])
def get_playlist_songs(playlist_id: int, db: Session = Depends(get_db)):
    service = PlaylistService(db)
    if not service.get_playlist(playlist_id):
        raise HTTPException(status_code=404, detail="Playlist not found")
    return service.get_songs(playlist_id)


@router.delete("/{playlist_id}/songs/{song_id}")
def remove_song_from_playlist(playlist_id: int, song_id: int, db: Session = Depends(get_db)):
    service = PlaylistService(db)
    if not service.remove_song(playlist_id, song_id):
        raise HTTPException(status_code=404, detail="Song not in playlist")
    return {"message": "Song removed from playlist"}
