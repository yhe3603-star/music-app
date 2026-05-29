import { Song, SongListResponse, SearchResult, Playlist, Lyrics } from '../types';

const API_BASE = 'http://10.0.2.2:8000';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

async function post<T>(path: string, body: any): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
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
    return request(`/api/playlists/${playlistId}/songs/${songId}`);
  },

  getLyrics(songId: number): Promise<Lyrics> {
    return request(`/api/songs/${songId}/lyrics`);
  },

  getRecommendations(songId: number): Promise<Song[]> {
    return request(`/api/recommend/${songId}`);
  },

  getStreamUrl(songId: number): string {
    return `${API_BASE}/api/songs/${songId}/stream`;
  },
};
