import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, SongListResponse, SearchResult, Playlist, Lyrics } from '../types';

const DEFAULT_API_BASE = 'http://10.0.2.2:8000';
const SERVER_URL_KEY = 'server_url';

let _apiBase: string | null = null;

async function getApiBase(): Promise<string> {
  if (_apiBase) return _apiBase;
  try {
    const stored = await AsyncStorage.getItem(SERVER_URL_KEY);
    _apiBase = stored || DEFAULT_API_BASE;
  } catch {
    _apiBase = DEFAULT_API_BASE;
  }
  return _apiBase;
}

export function clearApiBaseCache() {
  _apiBase = null;
}

async function request<T>(path: string): Promise<T> {
  const base = await getApiBase();
  const response = await fetch(`${base}${path}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

async function post<T>(path: string, body: any): Promise<T> {
  const base = await getApiBase();
  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

async function del<T>(path: string): Promise<T> {
  const base = await getApiBase();
  const response = await fetch(`${base}${path}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export const MusicApi = {
  getSongs(page = 1, pageSize = 20, search?: string): Promise<SongListResponse> {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search) params.set('search', search);
    return request(`/api/songs?${params}`);
  },

  getSong(id: number): Promise<Song> {
    return request(`/api/songs/${id}`);
  },

  search(keyword: string): Promise<{ keyword: string; results: SearchResult[]; source: string }> {
    return request(`/api/search?keyword=${encodeURIComponent(keyword)}`);
  },

  getPlaylists(): Promise<Playlist[]> {
    return request('/api/playlists');
  },

  createPlaylist(name: string, description?: string): Promise<Playlist> {
    return post('/api/playlists', { name, description });
  },

  getPlaylistSongs(playlistId: number): Promise<Song[]> {
    return request(`/api/playlists/${playlistId}/songs`);
  },

  addSongToPlaylist(playlistId: number, songId: number): Promise<void> {
    return post(`/api/playlists/${playlistId}/songs`, { song_id: songId });
  },

  removeSongFromPlaylist(playlistId: number, songId: number): Promise<void> {
    return del(`/api/playlists/${playlistId}/songs/${songId}`);
  },

  getLyrics(songId: number): Promise<Lyrics> {
    return request(`/api/songs/${songId}/lyrics`);
  },

  getRecommendations(songId: number): Promise<Song[]> {
    return request(`/api/recommend/${songId}`);
  },

  async getStreamUrl(songId: number): Promise<string> {
    const base = await getApiBase();
    return `${base}/api/songs/${songId}/stream`;
  },

  async getApiBaseUrl(): Promise<string> {
    return getApiBase();
  },
};
