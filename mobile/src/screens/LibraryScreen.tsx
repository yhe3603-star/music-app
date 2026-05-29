import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MusicApi } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore } from '../stores/playlistStore';
import SongItem from '../components/SongItem';
import PlaylistCard from '../components/PlaylistCard';
import MiniPlayer from '../components/MiniPlayer';
import { Song, Playlist } from '../types';

export default function LibraryScreen() {
  const navigation = useNavigation<any>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentSong, setCurrentSong, setQueue } = usePlayerStore();
  const { playlists, setPlaylists } = usePlaylistStore();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [songsData, playlistsData] = await Promise.all([
        MusicApi.getSongs(1, 100),
        MusicApi.getPlaylists(),
      ]);
      setSongs(songsData.items);
      setQueue(songsData.items);
      setPlaylists(playlistsData);
    } catch (err) {
      console.warn('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSongPress(song: Song) {
    setCurrentSong(song);
    navigation.navigate('Player');
  }

  function handlePlaylistPress(playlist: Playlist) {
    // Future: navigate to playlist detail
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>音乐库</Text>
      {playlists.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播放列表</Text>
          <FlatList
            horizontal
            data={playlists}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <PlaylistCard playlist={item} onPress={handlePlaylistPress} />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
      <Text style={styles.sectionTitle}>所有歌曲</Text>
      {loading ? (
        <Text style={styles.loading}>加载中...</Text>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <SongItem song={item} onPress={handleSongPress} isPlaying={currentSong?.id === item.id} />
          )}
        />
      )}
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', padding: 16, paddingBottom: 8 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', paddingHorizontal: 16, paddingVertical: 8 },
  loading: { textAlign: 'center', marginTop: 20, color: '#999' },
});
