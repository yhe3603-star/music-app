import { usePlayerStore } from '../../src/stores/playerStore';

describe('playerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentSong: null, queue: [], isPlaying: false, position: 0, duration: 0,
    });
  });

  it('has correct initial state', () => {
    const state = usePlayerStore.getState();
    expect(state.currentSong).toBeNull();
    expect(state.queue).toEqual([]);
    expect(state.isPlaying).toBe(false);
  });

  it('sets current song', () => {
    const song = { id: 1, title: 'Test', source: 'local', created_at: '2026-01-01' };
    usePlayerStore.getState().setCurrentSong(song);
    expect(usePlayerStore.getState().currentSong).toEqual(song);
  });

  it('sets queue', () => {
    const songs = [
      { id: 1, title: 'Song 1', source: 'local', created_at: '2026-01-01' },
      { id: 2, title: 'Song 2', source: 'local', created_at: '2026-01-01' },
    ];
    usePlayerStore.getState().setQueue(songs);
    expect(usePlayerStore.getState().queue).toHaveLength(2);
  });

  it('toggles play state', () => {
    expect(usePlayerStore.getState().isPlaying).toBe(false);
    usePlayerStore.getState().togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(true);
    usePlayerStore.getState().togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it('plays next song in queue', () => {
    const songs = [
      { id: 1, title: 'Song 1', source: 'local', created_at: '2026-01-01' },
      { id: 2, title: 'Song 2', source: 'local', created_at: '2026-01-01' },
    ];
    usePlayerStore.getState().setQueue(songs);
    usePlayerStore.getState().setCurrentSong(songs[0]);
    usePlayerStore.getState().playNext();
    expect(usePlayerStore.getState().currentSong?.id).toBe(2);
  });

  it('plays previous song in queue', () => {
    const songs = [
      { id: 1, title: 'Song 1', source: 'local', created_at: '2026-01-01' },
      { id: 2, title: 'Song 2', source: 'local', created_at: '2026-01-01' },
    ];
    usePlayerStore.getState().setQueue(songs);
    usePlayerStore.getState().setCurrentSong(songs[1]);
    usePlayerStore.getState().playPrevious();
    expect(usePlayerStore.getState().currentSong?.id).toBe(1);
  });
});
