# Music App

> 一个带外部 API 元数据自动补全的个人音乐播放器。采用 Python FastAPI 后端 + React Native 移动端的 monorepo 架构，拥有电影质感的深色主题 UI。

[English](#english)

---

## 功能特性

- **音乐库** — 上传、浏览、在线流式播放，支持 Range 请求
- **智能搜索** — 本地库 + MusicBrainz 在线搜索，支持搜索历史
- **播放列表** — 创建与管理播放列表，添加/移除歌曲
- **收藏** — 爱心收藏，AsyncStorage 本地持久化
- **歌词** — LRC 格式同步歌词，自动滚动 + 紫色高亮发光效果
- **离线下载** — 本地文件缓存，支持下载进度跟踪
- **相似推荐** — 基于歌手/专辑匹配的相似歌曲推荐
- **元数据补全** — 自动从 MusicBrainz、LRCLIB、Cover Art Archive 获取标签信息
- **后台播放** — 通过 react-native-track-player 实现锁屏控制

## 界面预览

> 电影质感深色 UI：深海军蓝背景、紫色主色调、悬浮玻璃 MiniPlayer、全局矢量图标。

## 技术栈

### 后端 (`backend/`)

| 层级 | 技术 |
|------|------|
| 框架 | FastAPI (异步) |
| 数据库 | SQLite + SQLAlchemy |
| HTTP 客户端 | httpx (异步) |
| 测试 | pytest + pytest-asyncio |

### 移动端 (`mobile/`)

| 层级 | 技术 |
|------|------|
| 框架 | React Native 0.79 |
| 状态管理 | Zustand |
| 路由导航 | React Navigation 7 (bottom-tabs + native-stack) |
| 音频播放 | react-native-track-player |
| 图标库 | react-native-vector-icons (Ionicons) |
| 本地存储 | AsyncStorage |
| 测试 | Jest 29 |

## 项目结构

```
music-app/
├── backend/
│   ├── app/
│   │   ├── routers/       # FastAPI 路由处理器（歌曲、播放列表、搜索、推荐）
│   │   ├── services/      # 业务逻辑层（音乐、播放列表、推荐、标签）
│   │   ├── models/        # SQLAlchemy ORM 模型
│   │   ├── schemas/       # Pydantic 请求/响应模型
│   │   ├── scrapers/      # 异步 API 客户端（MusicBrainz、LRCLIB、Cover Art Archive）
│   │   ├── database.py    # 数据库引擎/会话配置，启动时自动建表
│   │   └── config.py      # Pydantic Settings（环境变量配置）
│   └── tests/             # pytest 测试套件
│
├── mobile/
│   ├── App.tsx            # 根组件：NavigationContainer + DarkTheme
│   └── src/
│       ├── screens/       # 6 个页面（首页、搜索、管理、收藏、设置、播放器）
│       ├── components/    # 可复用组件（MiniPlayer、SongItem、SearchBar 等）
│       ├── navigation/    # 自定义 Tab 栏 + Stack 导航
│       ├── stores/        # Zustand 状态仓库（player、playlist、search）
│       ├── services/      # API 客户端、音频服务、下载服务
│       ├── theme/         # 主题令牌（Colors、Typography、Spacing、Radius）
│       └── types/         # TypeScript 类型定义
│
└── CLAUDE.md              # Claude Code 项目指引
```

## 快速开始

### 后端

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 启动开发服务器（:8000）
uvicorn app.main:app --reload

# 运行测试
pytest
```

### 移动端

```bash
cd mobile
npm install

# 启动 Metro 打包器
npm start

# Android 构建运行
npm run android

# 运行测试
npm test
```

### 配置说明

移动端在 AsyncStorage 中存储后端服务器地址，默认为 `http://10.0.2.2:8000`（Android 模拟器访问宿主机）。可在「设置」页面修改，或通过后端环境变量配置。

## API 接口

基础地址：
- `http://localhost:8000` — 直连后端
- `http://10.0.2.2:8000` — Android 模拟器 → 宿主机

### 主要端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/songs` | 歌曲列表（分页） |
| POST | `/api/songs` | 上传歌曲（multipart，最大 100MB） |
| GET | `/api/songs/{id}` | 歌曲详情 |
| GET | `/api/songs/{id}/stream` | 音频流（支持 Range 请求） |
| GET | `/api/songs/{id}/lyrics` | 获取歌词 |
| GET | `/api/search?q=` | 本地 + 在线搜索 |
| GET | `/api/playlists` | 播放列表列表 |
| POST | `/api/playlists` | 创建播放列表 |
| GET | `/api/recommend/{id}` | 相似歌曲推荐 |

## 外部 API

| 服务 | 用途 | 限流策略 |
|------|------|----------|
| [MusicBrainz](https://musicbrainz.org/) | 歌曲元数据搜索 | 1s + 随机延迟（BaseScraper） |
| [LRCLIB](https://lrclib.net/) | 同步/纯文本歌词 | 1s + 随机延迟（BaseScraper） |
| [Cover Art Archive](https://coverartarchive.org/) | 专辑封面 | 1s + 随机延迟（BaseScraper） |

所有爬虫继承 `BaseScraper`，内置限流和随机 User-Agent 轮换。

## 设计系统

移动端采用电影质感深色主题，通过集中式主题令牌管理：

| 令牌 | 色值 | 用途 |
|------|------|------|
| `Colors.background` | `#0F172A` | 页面背景 |
| `Colors.surface` | `#1E293B` | 卡片、浮层背景 |
| `Colors.primary` | `#7C3AED` | 主色调、激活态 |
| `Colors.accent` | `#22C55E` | 正向操作（下载完成） |
| `Colors.foreground` | `#F8FAFC` | 主要文字 |
| `Colors.textMuted` | `#94A3B8` | 次要文字 |

字号体系：28 (展示) / 20 (标题) / 16 (正文) / 13 (注释) / 12 (辅助)

## 测试

### 后端

```bash
cd backend
pytest                           # 全部测试
pytest tests/test_songs_api.py   # 单个文件
pytest -k "test_name"            # 单个用例
```

测试使用内存 SQLite，通过 conftest.py fixtures 自动创建/清理。

### 移动端

```bash
cd mobile
npm test                                    # 全部测试
npm test -- --testPathPattern=api           # 按模式匹配
```

## 许可证

个人项目 — 不授权分发。

---

<a id="english"></a>

# Music App (English)

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

## Getting Started

```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload    # :8000

# Mobile
cd mobile && npm install
npm start                        # Metro bundler
npm run android                  # Build & run
npm test                         # Run tests
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/songs` | List songs (paginated) |
| POST | `/api/songs` | Upload song (multipart, max 100MB) |
| GET | `/api/songs/{id}/stream` | Stream audio (Range support) |
| GET | `/api/search?q=` | Local + online search |
| GET | `/api/playlists` | List playlists |
| GET | `/api/recommend/{id}` | Similar songs |

## External APIs

| Service | Purpose | Rate Limiting |
|---------|---------|---------------|
| [MusicBrainz](https://musicbrainz.org/) | Metadata search | 1s + jitter |
| [LRCLIB](https://lrclib.net/) | Lyrics | 1s + jitter |
| [Cover Art Archive](https://coverartarchive.org/) | Album artwork | 1s + jitter |

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `Colors.background` | `#0F172A` | Screen backgrounds |
| `Colors.surface` | `#1E293B` | Cards, elevated surfaces |
| `Colors.primary` | `#7C3AED` | Accent, active states |
| `Colors.accent` | `#22C55E` | Positive actions |
| `Colors.foreground` | `#F8FAFC` | Primary text |
| `Colors.textMuted` | `#94A3B8` | Secondary text |

Typography: 28 (display) / 20 (title) / 16 (body) / 13 (caption) / 12 (small)

## License

Private project — not licensed for distribution.
