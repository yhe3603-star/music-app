# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal music app with metadata enrichment from external APIs. Monorepo with two main components:
- **`backend/`** — Python FastAPI server (SQLite + SQLAlchemy)
- **`mobile/`** — React Native mobile app (vanilla RN, not Expo)

The UI is in Simplified Chinese (首页, 搜索, 音乐库, 收藏, 设置).

## Development Commands

### Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload          # Start dev server on :8000
pytest                                 # Run all tests
pytest tests/test_songs_api.py         # Run single test file
pytest -k "test_name"                  # Run single test by name
```

### Mobile
```bash
cd mobile
npm start                              # Start Metro bundler
npm run android                        # Build & run on Android
npm test                               # Run Jest tests
npm test -- --testPathPattern=api      # Run single test file pattern
```

## Architecture

### Backend (`backend/app/`)
- **`routers/`** — Thin FastAPI route handlers (songs, playlists, search, recommend)
- **`services/`** — Business logic layer (music_service, playlist_service, recommend_service)
- **`models/`** — SQLAlchemy ORM models (song, playlist, lyrics, search_cache)
- **`schemas/`** — Pydantic request/response schemas
- **`scrapers/`** — Async httpx clients for external APIs. BaseScraper provides rate limiting (1s + jitter) and random User-Agent rotation. Concrete scrapers: MusicBrainz (metadata search), LRCLIB (lyrics), Cover Art Archive (album art)
- **`database.py`** — SQLAlchemy engine/session setup; tables auto-create on startup via lifespan
- **`config.py`** — Pydantic Settings (env-based configuration)

Pattern: routers delegate to services, services use SQLAlchemy sessions via FastAPI `Depends()`.

### Mobile (`mobile/src/`)
- **`screens/`** — Screen components (Home, Search, Library, Favorites, Settings, Player)
- **`components/`** — Reusable UI (MiniPlayer, SongItem, SearchBar, PlaylistCard, LyricsView, DownloadButton)
- **`navigation/AppNavigator.tsx`** — Bottom tabs (5 screens) + Stack (Player screen overlay)
- **`stores/`** — Zustand stores (playerStore, playlistStore, searchStore)
- **`services/`** — api.ts (fetch-based REST client), audioService.ts (TrackPlayer wrapper), downloadService.ts (local file caching + AsyncStorage index), PlaybackService.ts (background audio)
- **`types/index.ts`** — All TypeScript interfaces (Song, Playlist, SearchResult, Lyrics)

Pattern: Zustand stores for state, services for side effects. Audio playback uses react-native-track-player with background service registration.

Path alias: `@/*` maps to `src/*` (configured in tsconfig.json).

## API

Base URLs: `http://localhost:8000` (backend direct), `http://10.0.2.2:8000` (Android emulator → host).

Key endpoints under `/api/`:
- **songs** — CRUD, file upload (max 100MB), streaming (Range header support), batch operations, auto-tag from external APIs
- **playlists** — CRUD + song management
- **search** — Local + MusicBrainz online search
- **recommend** — Similar songs by artist/album matching

## Testing

- **Backend:** pytest + pytest-asyncio (`asyncio_mode = auto` in pytest.ini). Tests use in-memory SQLite with automatic setup/teardown via conftest.py fixtures. TestClient for API testing.
- **Mobile:** Jest 29.7 with react-native preset. Tests in `__tests__/` mirror `src/` structure (stores, services).

## External APIs (via scrapers)

- **MusicBrainz** — Song metadata search (artist, album, duration, cover URL)
- **LRCLIB** — Lyrics (synced and plain text)
- **Cover Art Archive** — Album artwork by MusicBrainz release ID

All scrapers extend `BaseScraper` and include built-in rate limiting.
