export interface Song {
  id: number;
  title: string;
  artist?: string;
  album?: string;
  duration?: number;
  file_path?: string;
  cover_url?: string;
  source: string;
  source_id?: string;
  created_at: string;
}

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  cover_url?: string;
  created_at: string;
}

export interface SearchResult {
  title: string;
  artist?: string;
  album?: string;
  duration?: number;
  cover_url?: string;
  source: string;
  source_id?: string;
}

export interface SongListResponse {
  items: Song[];
  total: number;
  page: number;
  page_size: number;
}

export interface Lyrics {
  song_id: number;
  content: string;
  source: string;
}
