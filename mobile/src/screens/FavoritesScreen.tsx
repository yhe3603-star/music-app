import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MusicApi } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore } from '../stores/playlistStore';
import SongItem from '../components/SongItem';
import MiniPlayer from '../components/MiniPlayer';
import { Song } from '../types';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentSong, setCurrentSong } = usePlayerStore();
  const { favorites } = usePlaylistStore();

  useEffect(() => { loadFavorites(); }, [favorites]);

  async function loadFavorites() {
    if (favorites.length === 0) {
      setSongs([]);
      setLoading(false);
      return;
    }
    try {
      const allSongs: Song[] = [];
      for (const id of favorites) {
        try {
          const song = await MusicApi.getSong(id);
          allSongs.push(song);
        } catch {
          // skip missing songs
        }
      }
      setSongs(allSongs);
    } catch (err) {
      console.warn('Failed to load favorites:', err);
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
      <Text style={styles.header}>收藏</Text>
      {loading ? (
        <Text style={styles.loading}>加载中...</Text>
      ) : songs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>还没有收藏的歌曲</Text>
          <Text style={styles.emptyHint}>在播放页面点击爱心收藏</Text>
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
