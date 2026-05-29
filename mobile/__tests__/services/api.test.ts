import { MusicApi } from '../../src/services/api';

global.fetch = jest.fn();

const API_BASE = 'http://10.0.2.2:8000';

describe('MusicApi', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('fetches songs list', async () => {
    const mockResponse = { items: [{ id: 1, title: 'Test', source: 'local' }], total: 1, page: 1, page_size: 20 };
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockResponse });
    const result = await MusicApi.getSongs();
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/songs?page=1&page_size=20`);
    expect(result.total).toBe(1);
  });

  it('fetches song by id', async () => {
    const mockSong = { id: 1, title: 'Test Song', source: 'local' };
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockSong });
    const result = await MusicApi.getSong(1);
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/songs/1`);
    expect(result.title).toBe('Test Song');
  });

  it('searches songs', async () => {
    const mockSearch = { keyword: 'test', results: [], source: 'mixed' };
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockSearch });
    const result = await MusicApi.search('test');
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/search?keyword=test`);
    expect(result.keyword).toBe('test');
  });

  it('fetches playlists', async () => {
    const mockPlaylists = [{ id: 1, name: 'My Playlist' }];
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockPlaylists });
    const result = await MusicApi.getPlaylists();
    expect(result).toHaveLength(1);
  });

  it('fetches lyrics', async () => {
    const mockLyrics = { song_id: 1, content: '[00:01.00]Hello', source: 'test' };
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockLyrics });
    const result = await MusicApi.getLyrics(1);
    expect(result.content).toBe('[00:01.00]Hello');
  });

  it('fetches recommendations', async () => {
    const mockSongs = [{ id: 2, title: 'Similar Song', source: 'local' }];
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockSongs });
    const result = await MusicApi.getRecommendations(1);
    expect(result).toHaveLength(1);
  });

  it('handles fetch error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(MusicApi.getSongs()).rejects.toThrow();
  });
});
