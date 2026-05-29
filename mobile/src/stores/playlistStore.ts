import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist } from '../types';

const FAVORITES_KEY = 'favorite_songs';

interface PlaylistState {
  playlists: Playlist[];
  favorites: number[];
  favoritesLoaded: boolean;
  setPlaylists: (playlists: Playlist[]) => void;
  toggleFavorite: (songId: number) => void;
  isFavorite: (songId: number) => boolean;
  loadFavorites: () => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  favorites: [],
  favoritesLoaded: false,
  setPlaylists: (playlists) => set({ playlists }),
  toggleFavorite: (songId) => {
    const current = get().favorites;
    const updated = current.includes(songId)
      ? current.filter((id) => id !== songId)
      : [...current, songId];
    set({ favorites: updated });
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated)).catch(() => {});
  },
  isFavorite: (songId) => get().favorites.includes(songId),
  loadFavorites: async () => {
    if (get().favoritesLoaded) return;
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (data) {
        set({ favorites: JSON.parse(data), favoritesLoaded: true });
      } else {
        set({ favoritesLoaded: true });
      }
    } catch {
      set({ favoritesLoaded: true });
    }
  },
}));
