import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlayerStore } from '../stores/playerStore';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay } = usePlayerStore();
  if (!currentSong) return null;

  return (
    <View style={styles.container}>
      <View style={styles.cover}>
        <Text style={styles.coverText}>
          {(currentSong.title || '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentSong.artist || '未知歌手'}
        </Text>
      </View>
      <TouchableOpacity onPress={togglePlay} style={styles.button}>
        <Text style={styles.buttonText}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', padding: 8,
    backgroundColor: '#f8f8f8', borderTopWidth: 1, borderTopColor: '#eee',
  },
  cover: {
    width: 40, height: 40, borderRadius: 4, backgroundColor: '#e0e0e0',
    justifyContent: 'center', alignItems: 'center',
  },
  coverText: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  info: { flex: 1, marginLeft: 10 },
  title: { fontSize: 14, fontWeight: '600', color: '#333' },
  artist: { fontSize: 12, color: '#999' },
  button: { padding: 10 },
  buttonText: { fontSize: 20 },
});
