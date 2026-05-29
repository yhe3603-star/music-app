import React, { createContext, useContext } from 'react';
import { create } from 'zustand';
import { Song } from '../types';

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  position: number;
  duration: number;
  setCurrentSong: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setPosition: (pos: number) => void;
  setDuration: (dur: number) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  position: 0,
  duration: 0,
  setCurrentSong: (song) => set({ currentSong: song, isPlaying: true }),
  setQueue: (songs) => set({ queue: songs }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPosition: (pos) => set({ position: pos }),
  setDuration: (dur) => set({ duration: dur }),
  playNext: () => {
    const { currentSong, queue } = get();
    if (!currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s.id === currentSong.id);
    if (idx < queue.length - 1) {
      set({ currentSong: queue[idx + 1], isPlaying: true, position: 0 });
    }
  },
  playPrevious: () => {
    const { currentSong, queue } = get();
    if (!currentSong || queue.length === 0) return;
    const idx = queue.findIndex((s) => s.id === currentSong.id);
    if (idx > 0) {
      set({ currentSong: queue[idx - 1], isPlaying: true, position: 0 });
    }
  },
}));

// React context provider (for compatibility)
const PlayerContext = createContext(null);
export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(PlayerContext.Provider, { value: null }, children);
};
