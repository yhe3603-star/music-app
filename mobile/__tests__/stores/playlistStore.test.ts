import { usePlaylistStore } from '../../src/stores/playlistStore';

describe('playlistStore', () => {
  beforeEach(() => {
    usePlaylistStore.setState({ playlists: [], favorites: [] });
  });

  it('has correct initial state', () => {
    const state = usePlaylistStore.getState();
    expect(state.playlists).toEqual([]);
    expect(state.favorites).toEqual([]);
  });

  it('sets playlists', () => {
    const playlists = [{ id: 1, name: 'My Playlist', created_at: '2026-01-01' }];
    usePlaylistStore.getState().setPlaylists(playlists);
    expect(usePlaylistStore.getState().playlists).toHaveLength(1);
  });

  it('toggles favorite', () => {
    usePlaylistStore.getState().toggleFavorite(1);
    expect(usePlaylistStore.getState().favorites).toContain(1);
    usePlaylistStore.getState().toggleFavorite(1);
    expect(usePlaylistStore.getState().favorites).not.toContain(1);
  });

  it('checks if song is favorite', () => {
    usePlaylistStore.getState().toggleFavorite(5);
    expect(usePlaylistStore.getState().isFavorite(5)).toBe(true);
    expect(usePlaylistStore.getState().isFavorite(3)).toBe(false);
  });
});
