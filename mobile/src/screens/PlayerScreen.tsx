import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, LayoutChangeEvent } from 'react-native';
import { MusicApi } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore } from '../stores/playlistStore';
import { playSong, pausePlayback, resumePlayback, seekTo, useProgress } from '../services/audioService';
import LyricsView from '../components/LyricsView';
import { Colors, Typography, Spacing, Radius } from '../theme/colors';
import Icon from 'react-native-vector-icons/Ionicons';

export default function PlayerScreen() {
  const {
    currentSong, isPlaying, togglePlay, playNext: storePlayNext, playPrevious: storePlayPrevious,
  } = usePlayerStore();
  const { isFavorite, toggleFavorite } = usePlaylistStore();
  const [lyrics, setLyrics] = useState<string | null>(null);
  const { position, duration } = useProgress(1000);
  const [progressBarWidth, setProgressBarWidth] = useState(0);

  useEffect(() => {
    if (currentSong) {
      loadLyrics(currentSong.id);
      playSong(currentSong);
    }
  }, [currentSong?.id]);

  async function loadLyrics(songId: number) {
    try {
      const data = await MusicApi.getLyrics(songId);
      setLyrics(data.content);
    } catch {
      setLyrics(null);
    }
  }

  function handleTogglePlay() {
    togglePlay();
    if (isPlaying) {
      pausePlayback();
    } else {
      resumePlayback();
    }
  }

  function handleNext() {
    storePlayNext();
  }

  function handlePrevious() {
    storePlayPrevious();
  }

  function handleSeek(event: any) {
    const { locationX } = event.nativeEvent;
    if (progressBarWidth > 0 && duration > 0) {
      const ratio = Math.max(0, Math.min(1, locationX / progressBarWidth));
      seekTo(ratio * duration);
    }
  }

  const onProgressLayout = useCallback((event: LayoutChangeEvent) => {
    setProgressBarWidth(event.nativeEvent.layout.width);
  }, []);

  if (!currentSong) {
    return (
      <View style={styles.container}>
        <Text style={styles.noSong}>未选择歌曲</Text>
      </View>
    );
  }

  const favorite = isFavorite(currentSong.id);
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.bgAccent} />

      <View style={styles.coverSection}>
        <View style={styles.cover}>
          {currentSong.cover_url ? (
            <Image source={{ uri: currentSong.cover_url }} style={styles.coverImage} />
          ) : (
            <Text style={styles.coverText}>
              {(currentSong.title || '?')[0].toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.lyricsSection}>
        <LyricsView lyrics={lyrics} currentTime={position} />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentSong.artist || '未知歌手'}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.progressSection}
        onLayout={onProgressLayout}
        onPress={handleSeek}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(position)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => toggleFavorite(currentSong.id)} style={styles.controlBtn}>
          <Icon name={favorite ? 'heart' : 'heart-outline'} size={24} color={favorite ? Colors.destructive : Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={handlePrevious} style={styles.controlBtn}>
          <Icon name="play-skip-back" size={28} color={Colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={handleTogglePlay} style={styles.playBtn}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={30} color={Colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={handleNext} style={styles.controlBtn}>
          <Icon name="play-skip-forward" size={28} color={Colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={() => {}} style={styles.controlBtn}>
          <Icon name="shuffle" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bgAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 350, backgroundColor: 'rgba(124, 58, 237, 0.06)' },
  noSong: { ...Typography.body, color: Colors.textDisabled, textAlign: 'center', marginTop: 100 },
  coverSection: { alignItems: 'center', marginTop: Spacing.xl, paddingHorizontal: Spacing.xl },
  cover: {
    width: 300, height: 300, borderRadius: Radius.lg, backgroundColor: Colors.surfaceMuted,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  coverImage: { width: 300, height: 300 },
  coverText: { fontSize: 80, fontWeight: 'bold', color: Colors.textDisabled },
  lyricsSection: { flex: 1, marginTop: Spacing.xl, paddingHorizontal: Spacing.lg },
  infoSection: { alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  title: { ...Typography.title, fontSize: 22, color: Colors.foreground, textAlign: 'center' },
  artist: { ...Typography.body, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  progressSection: { marginBottom: Spacing.lg, paddingHorizontal: Spacing.xl },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  time: { ...Typography.small },
  controls: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingBottom: 36, paddingHorizontal: Spacing.xl,
  },
  controlBtn: { padding: Spacing.lg },
  playBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
});
