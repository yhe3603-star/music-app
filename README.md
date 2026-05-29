# Music App

A personal music streaming app with metadata enrichment from external APIs. Monorepo with a Python FastAPI backend and a React Native mobile client featuring a cinematic dark-mode UI.

## Features

- **Music Library** — Upload, browse, and stream songs with range-request support
- **Smart Search** — Local + MusicBrainz online search with search history
- **Playlists** — Create and manage playlists with song add/remove
- **Favorites** — Heart-based favorites with AsyncStorage persistence
- **Lyrics** — Synced LRC lyrics with auto-scroll and purple glow highlight
- **Downloads** — Local file caching with progress tracking
- **Recommendations** — Similar songs by artist/album matching
- **Metadata Enrichment** — Auto-tag from MusicBrainz, LRCLIB, and Cover Art Archive
- **Background Playback** — Lock screen controls via react-native-track-player

## Screenshots

> Cinematic dark-mode UI with deep navy surfaces, purple accents, floating glass MiniPlayer, and vector icons throughout.

## Tech Stack

### Backend (`backend/`)

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI (async) |
| Database | SQLite + SQLAlchemy |
| HTTP Client | httpx (async) |
| Testing | pytest + pytest-asyncio |

### Mobile (`mobile/`)

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.79 |
| State | Zustand |
| Navigation | React Navigation 7 (bottom-tabs + native-stack) |
| Audio | react-native-track-player |
| Icons | react-native-vector-icons (Ionicons) |
| Storage | AsyncStorage |
| Testing | Jest 29 |

## Project Structure

```
music-app/
├── backend/
│   ├── app/
│   │   ├── routers/       # FastAPI route handlers (songs, playlists, search, recommend)
│   │   ├── services/      # Business logic (music, playlist, recommend, tag)
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── scrapers/      # Async API clients (MusicBrainz, LRCLIB, Cover Art Archive)
│   │   ├── database.py    # Engine/session setup, auto-create tables
│   │   └── config.py      # Pydantic Settings (env-based)
│   └── tests/             # pytest test suite
│
├── mobile/
│   ├── App.tsx            # Root: NavigationContainer with DarkTheme
│   └── src/
│       ├── screens/       # 6 screens (Home, Search, Library, Favorites, Settings, Player)
│       ├── components/    # Reusable UI (MiniPlayer, SongItem, SearchBar, etc.)
│       ├── navigation/    # Custom tab bar + stack navigator
│       ├── stores/        # Zustand stores (player, playlist, search)
│       ├── services/      # API client, audio service, download service
│       ├── theme/         # Colors, Typography, Spacing, Radius tokens
│       └── types/         # TypeScript interfaces
│
└── CLAUDE.md              # Claude Code project instructions
```

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start dev server on :8000
uvicorn app.main:app --reload

# Run tests
pytest
```

### Mobile

```bash
cd mobile
npm install

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run tests
npm test
```

### Configuration

The mobile app stores the backend server URL in AsyncStorage. The default is `http://10.0.2.2:8000` (Android emulator → host). Change it in the Settings screen or set via the backend environment.

## API

Base URLs:
- `http://localhost:8000` — Backend direct
- `http://10.0.2.2:8000` — Android emulator → host

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/songs` | List songs (paginated) |
| POST | `/api/songs` | Upload song (multipart, max 100MB) |
| GET | `/api/songs/{id}` | Get song details |
| GET | `/api/songs/{id}/stream` | Stream audio (Range header support) |
| GET | `/api/songs/{id}/lyrics` | Get lyrics |
| GET | `/api/search?q=` | Local + online search |
| GET | `/api/playlists` | List playlists |
| POST | `/api/playlists` | Create playlist |
| GET | `/api/recommend/{id}` | Similar songs |

## External APIs

| Service | Purpose | Rate Limiting |
|---------|---------|---------------|
| [MusicBrainz](https://musicbrainz.org/) | Song metadata search | 1s + jitter via BaseScraper |
| [LRCLIB](https://lrclib.net/) | Synced/plain lyrics | 1s + jitter via BaseScraper |
| [Cover Art Archive](https://coverartarchive.org/) | Album artwork | 1s + jitter via BaseScraper |

All scrapers extend `BaseScraper` with built-in rate limiting and random User-Agent rotation.

## Design System

The mobile app uses a cinematic dark-mode design with a centralized theme:

| Token | Value | Usage |
|-------|-------|-------|
| `Colors.background` | `#0F172A` | Screen backgrounds |
| `Colors.surface` | `#1E293B` | Cards, elevated surfaces |
| `Colors.primary` | `#7C3AED` | Accent, active states |
| `Colors.accent` | `#22C55E` | Positive actions (download complete) |
| `Colors.foreground` | `#F8FAFC` | Primary text |
| `Colors.textMuted` | `#94A3B8` | Secondary text |

Typography scale: 28 (display) / 20 (title) / 16 (body) / 13 (caption) / 12 (small)

## Testing

### Backend

```bash
cd backend
pytest                           # All tests
pytest tests/test_songs_api.py   # Single file
pytest -k "test_name"            # Single test
```

Tests use in-memory SQLite with automatic setup/teardown via conftest fixtures.

### Mobile

```bash
cd mobile
npm test                                    # All tests
npm test -- --testPathPattern=api           # By pattern
```

## License

Private project — not licensed for distribution.
