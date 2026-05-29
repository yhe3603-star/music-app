import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MusicApi } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore } from '../stores/playlistStore';
import SongItem from '../components/SongItem';
import MiniPlayer from '../components/MiniPlayer';
import { Song } from '../types';
import { Colors, Typography, Spacing } from '../theme/colors';
import Icon from 'react-native-vector-icons/Ionicons';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentSong, setCurrentSong } = usePlayerStore();
  const { favorites } = usePlaylistStore();

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [favorites])
  );

  async function loadFavorites() {
    if (favorites.length === 0) {
      setSongs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        favorites.map((id) => MusicApi.getSong(id))
      );
      const loaded = results
        .filter((r): r is PromiseFulfilledResult<Song> => r.status === 'fulfilled')
        .map((r) => r.value);
      setSongs(loaded);
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
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : songs.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="heart-outline" size={64} color={Colors.textDisabled} />
          <Text style={styles.emptyText}>还没有收藏的歌曲</Text>
          <Text style={styles.emptyHint}>在播放页面点击爱心收藏</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 100 }}
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...Typography.title, color: Colors.textMuted, marginTop: Spacing.md },
  emptyHint: { ...Typography.body, color: Colors.textDisabled, marginTop: Spacing.sm },
});
