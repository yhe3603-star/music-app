import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MusicApi } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore } from '../stores/playlistStore';
import SongItem from '../components/SongItem';
import PlaylistCard from '../components/PlaylistCard';
import MiniPlayer from '../components/MiniPlayer';
import { Song } from '../types';
import { Colors, Typography, Spacing } from '../theme/colors';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HomeScreen() {
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
      console.warn('Failed to load data:', err);
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
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : songs.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="musical-notes-outline" size={48} color={Colors.textDisabled} />
          <Text style={styles.emptyText}>还没有歌曲</Text>
          <Text style={styles.emptyHint}>去音乐库上传歌曲吧</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            playlists.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>播放列表</Text>
                <FlatList
                  horizontal
                  data={playlists}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <PlaylistCard playlist={item} onPress={() => {}} />
                  )}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            ) : null
          }
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: { ...Typography.display, padding: Spacing.lg, paddingBottom: Spacing.sm, paddingTop: 56 },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.title, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...Typography.title, color: Colors.textMuted },
  emptyHint: { ...Typography.body, color: Colors.textDisabled, marginTop: Spacing.sm },
});
