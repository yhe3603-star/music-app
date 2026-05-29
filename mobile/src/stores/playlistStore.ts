import { create } from 'zustand';
import { Playlist } from '../types';

interface PlaylistState {
  playlists: Playlist[];
  favorites: number[];
  setPlaylists: (playlists: Playlist[]) => void;
  toggleFavorite: (songId: number) => void;
  isFavorite: (songId: number) => boolean;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  favorites: [],
  setPlaylists: (playlists) => set({ playlists }),
  toggleFavorite: (songId) =>
    set((state) => ({
      favorites: state.favorites.includes(songId)
        ? state.favorites.filter((id) => id !== songId)
        : [...state.favorites, songId],
    })),
  isFavorite: (songId) => get().favorites.includes(songId),
}));
