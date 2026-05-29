# Music App Design Spec

**Date:** 2026-05-29
**Type:** Personal music listening app
**Scope:** Mobile app + lightweight backend server

---

## 1. Overview

A personal music listening app that plays local music files and enriches them with metadata (lyrics, covers, song info) scraped from public sources. Built with React Native for cross-platform mobile support and Python FastAPI for the backend.

**Core Features:**
- Music player with basic controls (play/pause, progress, volume)
- Playlist management (create, edit, delete)
- Lyrics display with sync scrolling
- Search and song recommendations

---

## 2. Architecture

### Architecture Choice: Monolithic FastAPI + React Native

Single FastAPI server handles all backend logic (API, scraping, file storage, streaming). React Native app as the frontend. SQLite database for metadata storage.

```
┌─────────────────────────────────────┐
│         React Native App            │
│  ┌─────────┐  ┌─────────────────┐  │
│  │ UI Layer│  │ Audio Player    │  │
│  │ (Screens│  │ (react-native-  │  │
│  │  & Nav) │  │  track-player)  │  │
│  └────┬────┘  └───────┬─────────┘  │
│       │               │             │
│  ┌────┴───────────────┴─────────┐  │
│  │      State Management        │  │
│  │         (Zustand)            │  │
│  └──────────────┬───────────────┘  │
└─────────────────┼──────────────────┘
                  │ HTTP/REST API
┌─────────────────┼──────────────────┐
│    FastAPI Backend Server          │
│  ┌──────────┐  ┌──────────────┐   │
│  │ REST API │  │ Scraper      │   │
│  │ Endpoints│  │ Module       │   │
│  └────┬─────┘  └──────┬───────┘   │
│       │               │            │
│  ┌────┴───────────────┴────────┐   │
│  │    Data Layer (SQLite)      │   │
│  │  songs, playlists, lyrics   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │   File Storage (本地目录)    │   │
│  │    music files + covers     │   │
│  └─────────────────────────────┘   │
└────────────────────────────────────┘
```

**Modules:**
- **React Native App:** UI + audio playback engine + state management
- **FastAPI Backend:** REST API + scraper module + data storage
- **SQLite Database:** Song metadata, playlists, lyrics
- **Local File System:** Music files and cover images

---

## 3. Data Model

### songs (歌曲表)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| title | TEXT | Song name |
| artist | TEXT | Artist name |
| album | TEXT | Album name |
| duration | INTEGER | Duration in milliseconds |
| file_path | TEXT | Local file path |
| cover_url | TEXT | Cover image URL/path |
| source | TEXT | Source: local/scraped |
| source_id | TEXT | Source website song ID |
| created_at | DATETIME | Creation timestamp |

### playlists (播放列表表)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| name | TEXT | Playlist name |
| description | TEXT | Optional description |
| cover_url | TEXT | Cover image |
| created_at | DATETIME | Creation timestamp |

### playlist_songs (播放列表-歌曲关联表)
| Column | Type | Description |
|--------|------|-------------|
| playlist_id | INTEGER (FK) | References playlists.id |
| song_id | INTEGER (FK) | References songs.id |
| sort_order | INTEGER | Sort order in playlist |

### lyrics (歌词表)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| song_id | INTEGER (FK) | References songs.id |
| content | TEXT | LRC format lyrics |
| source | TEXT | Lyrics source |

### search_cache (搜索缓存表)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| keyword | TEXT | Search keyword |
| results | TEXT | JSON results |
| cached_at | DATETIME | Cache timestamp |

---

## 4. API Design

### Music Management
- `GET /api/songs` - List songs (supports pagination, search)
- `GET /api/songs/{id}` - Get song details
- `GET /api/songs/{id}/stream` - Stream audio (Range request support)
- `GET /api/songs/{id}/lyrics` - Get lyrics
- `POST /api/songs/upload` - Upload local music file
- `DELETE /api/songs/{id}` - Delete song

### Search & Scraping
- `GET /api/search?keyword=` - Search songs (local first, then online)
- `GET /api/search/online?keyword=` - Online search only
- `POST /api/scrape/metadata` - Batch fetch song metadata
- `POST /api/scrape/lyrics` - Fetch lyrics

### Playlists
- `GET /api/playlists` - List all playlists
- `POST /api/playlists` - Create playlist
- `PUT /api/playlists/{id}` - Update playlist
- `DELETE /api/playlists/{id}` - Delete playlist
- `GET /api/playlists/{id}/songs` - Get playlist songs
- `POST /api/playlists/{id}/songs` - Add song to playlist
- `DELETE /api/playlists/{id}/songs/{song_id}` - Remove song from playlist

### Recommendations
- `GET /api/recommend/{song_id}` - Recommend similar songs

**Streaming:** `/stream` endpoint supports HTTP Range requests for seek functionality. Supports mp3, flac, wav, m4a formats.

---

## 5. React Native App Design

### Screen Structure (5 main screens)

```
App Navigation
├── 🏠 首页 (HomeScreen)
│   ├── Recent plays
│   ├── Recommended songs
│   └── Quick search entry
│
├── 🔍 搜索页 (SearchScreen)
│   ├── Search box (real-time search)
│   ├── Local results + Online results toggle
│   └── Search history
│
├── 📚 音乐库 (LibraryScreen)
│   ├── All songs list
│   ├── Playlist management
│   └── Local music import
│
├── ❤️ 收藏页 (FavoritesScreen)
│   └── Favorited songs list
│
└── ⚙️ 设置页 (SettingsScreen)
    ├── Server address config
    ├── Audio quality settings
    └── Cache management
```

### Player UI
- **Bottom mini player bar:** Cover thumbnail + song name + play/pause button (always visible)
- **Full-screen player:** Large cover, scrolling lyrics, progress bar, control buttons (prev/play-pause/next/shuffle/repeat)
- Supports notification controls and lock screen controls

### State Management (Zustand)
- `playerStore` - Current playback queue, play state, progress
- `playlistStore` - Playlist data
- `searchStore` - Search results and history

---

## 6. Scraper Module

### Architecture
```
Scraper Module
├── BaseScraper (base class)
│   ├── fetch() - HTTP request wrapper
│   ├── parse() - Parse logic (implemented by subclass)
│   └── rate_limit() - Request rate limiting
│
├── SearchScraper
│   └── search_songs(keyword) -> List[Song]
│
├── MetadataScraper
│   ├── get_song_info(source_id) -> Song
│   ├── get_album_info(album_id) -> Album
│   └── get_artist_info(artist_id) -> Artist
│
├── LyricsScraper
│   ├── search_lyrics(title, artist) -> List[Lyric]
│   └── get_lyric(lyric_id) -> Lyric
│
└── CoverScraper
    └── get_cover(album/artist) -> ImageUrl
```

### Scraping Strategy
- Uses `httpx` async HTTP client
- Random 1-3 second delay between requests to avoid blocking
- User-Agent rotation to simulate normal browser
- Results cached in `search_cache` table to reduce repeated requests
- Only scrapes **metadata** (song name, artist, lyrics, cover URL) - does NOT download full music files

### Music File Sources
- **Local import:** Select mp3/flac files from phone storage
- **Server upload:** Upload via API to backend server storage
- **Playback:** Stream via backend `/stream` endpoint

---

## 7. Error Handling

### Backend
- Scraper request failure: Return cached results or "no data available" message, does not affect main service
- Audio stream interruption: Supports resume (Range requests)
- Database concurrency: SQLite WAL mode to avoid write lock conflicts
- File not found: Return 404, frontend gracefully falls back to default cover

### Frontend
- Network disconnection: Auto-switch to local cached playback
- Playback failure: Skip to next song with notification
- Server unreachable: Locally downloaded songs still playable

---

## 8. Testing Strategy

- **Backend:** pytest unit tests (scraper, API endpoints, data models)
- **Frontend:** Jest component tests + manual device testing
- **Integration:** End-to-end playback flow verification

---

## 9. Tech Stack Summary

| Component | Technology |
|-----------|------------|
| Mobile App | React Native |
| State Management | Zustand |
| Audio Playback | react-native-track-player |
| Backend Server | Python FastAPI |
| Database | SQLite (SQLAlchemy ORM) |
| HTTP Client | httpx (async) |
| Navigation | React Navigation |
