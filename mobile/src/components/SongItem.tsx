import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Song } from '../types';

interface Props {
  song: Song;
  onPress: (song: Song) => void;
  onLongPress?: (song: Song) => void;
  isPlaying?: boolean;
}

export default function SongItem({ song, onPress, onLongPress, isPlaying }: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(song)}
      onLongPress={() => onLongPress?.(song)}
    >
      <View style={styles.cover}>
        <Text style={styles.coverText}>
          {(song.title || '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, isPlaying && styles.playing]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist || '未知歌手'}
        </Text>
      </View>
      <Text style={styles.duration}>
        {song.duration ? formatDuration(song.duration) : ''}
      </Text>
    </TouchableOpacity>
  );
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  cover: {
    width: 48, height: 48, borderRadius: 4, backgroundColor: '#e0e0e0',
    justifyContent: 'center', alignItems: 'center',
  },
  coverText: { fontSize: 20, fontWeight: 'bold', color: '#666' },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, color: '#333' },
  playing: { color: '#1db954' },
  artist: { fontSize: 13, color: '#999', marginTop: 2 },
  duration: { fontSize: 13, color: '#999', marginLeft: 8 },
});
