import { create } from 'zustand';
import { SearchResult } from '../types';

interface SearchState {
  keyword: string;
  results: SearchResult[];
  history: string[];
  loading: boolean;
  setKeyword: (keyword: string) => void;
  setResults: (results: SearchResult[]) => void;
  addHistory: (keyword: string) => void;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  keyword: '',
  results: [],
  history: [],
  loading: false,
  setKeyword: (keyword) => set({ keyword }),
  setResults: (results) => set({ results }),
  addHistory: (keyword) =>
    set((state) => ({
      history: [keyword, ...state.history.filter((k) => k !== keyword)].slice(0, 20),
    })),
  clearHistory: () => set({ history: [] }),
  setLoading: (loading) => set({ loading }),
}));
