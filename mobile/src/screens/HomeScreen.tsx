import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MusicApi } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import SongItem from '../components/SongItem';
import MiniPlayer from '../components/MiniPlayer';
import { Song } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentSong, setCurrentSong, setQueue } = usePlayerStore();

  useEffect(() => { loadSongs(); }, []);

  async function loadSongs() {
    try {
      const data = await MusicApi.getSongs(1, 50);
      setSongs(data.items);
      setQueue(data.items);
    } catch (err) {
      console.warn('Failed to load songs:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSongPress(song: Song) {
    setCurrentSong(song);
    navigation.navigate('Player');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>音乐库</Text>
      {loading ? (
        <Text style={styles.loading}>加载中...</Text>
      ) : songs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>还没有歌曲</Text>
          <Text style={styles.emptyHint}>去音乐库上传歌曲吧</Text>
        </View>
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
  loading: { textAlign: 'center', marginTop: 40, color: '#999' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#666' },
  emptyHint: { fontSize: 14, color: '#999', marginTop: 8 },
});
