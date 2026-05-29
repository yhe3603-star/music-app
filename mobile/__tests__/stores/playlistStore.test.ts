import { usePlaylistStore } from '../../src/stores/playlistStore';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('playlistStore', () => {
  beforeEach(() => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.getItem.mockResolvedValue(null);
    usePlaylistStore.setState({ playlists: [], favorites: [], favoritesLoaded: false });
  });

  it('has correct initial state', () => {
    const state = usePlaylistStore.getState();
    expect(state.playlists).toEqual([]);
    expect(state.favorites).toEqual([]);
    expect(state.favoritesLoaded).toBe(false);
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

  it('loads favorites from storage', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    AsyncStorage.getItem.mockResolvedValueOnce('[7, 8, 9]');
    await usePlaylistStore.getState().loadFavorites();
    expect(usePlaylistStore.getState().favorites).toEqual([7, 8, 9]);
    expect(usePlaylistStore.getState().favoritesLoaded).toBe(true);
  });

  it('does not reload favorites if already loaded', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    usePlaylistStore.setState({ favoritesLoaded: true });
    await usePlaylistStore.getState().loadFavorites();
    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
  });
});
