import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { usePlayerStore } from '../stores/playerStore';
import { pausePlayback, resumePlayback } from '../services/audioService';
import { Colors, Typography, Spacing, Radius } from '../theme/colors';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay } = usePlayerStore();
  if (!currentSong) return null;

  function handleTogglePlay() {
    togglePlay();
    if (isPlaying) {
      pausePlayback();
    } else {
      resumePlayback();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cover}>
        {currentSong.cover_url ? (
          <Image source={{ uri: currentSong.cover_url }} style={StyleSheet.absoluteFill} />
        ) : (
          <Text style={styles.coverText}>
            {(currentSong.title || '?')[0].toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentSong.artist || '未知歌手'}
        </Text>
      </View>
      <TouchableOpacity onPress={handleTogglePlay} style={styles.button} activeOpacity={0.7}>
        <Icon name={isPlaying ? 'pause' : 'play'} size={22} color={Colors.foreground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', padding: 10,
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: Colors.surfaceGlass, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  cover: {
    width: 40, height: 40, borderRadius: Radius.sm, backgroundColor: Colors.surfaceMuted,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  coverText: { fontSize: 16, fontWeight: 'bold', color: Colors.textMuted },
  info: { flex: 1, marginLeft: 10 },
  title: { fontSize: 14, fontWeight: '600', color: Colors.foreground },
  artist: { ...Typography.small },
  button: { padding: 10 },
});
