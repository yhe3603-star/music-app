import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Song } from '../types';
import { Colors, Typography, Radius } from '../theme/colors';
import DownloadButton from './DownloadButton';

interface Props {
  song: Song;
  onPress: (song: Song) => void;
  onLongPress?: (song: Song) => void;
  isPlaying?: boolean;
}

export default function SongItem({ song, onPress, onLongPress, isPlaying }: Props) {
  return (
    <TouchableOpacity
      style={[styles.container, isPlaying && styles.containerPlaying]}
      onPress={() => onPress(song)}
      onLongPress={() => onLongPress?.(song)}
      activeOpacity={0.7}
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
      <DownloadButton song={song} />
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
  container: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    marginHorizontal: 16, marginVertical: 4,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  containerPlaying: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  cover: {
    width: 48, height: 48, borderRadius: Radius.sm, backgroundColor: Colors.surfaceMuted,
    justifyContent: 'center', alignItems: 'center',
  },
  coverText: { fontSize: 20, fontWeight: 'bold', color: Colors.textMuted },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, color: Colors.foreground },
  playing: { color: Colors.primary },
  artist: { ...Typography.caption, marginTop: 2 },
  duration: { ...Typography.small, marginLeft: 8 },
});
