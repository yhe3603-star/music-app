import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MusicApi } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import { usePlaylistStore } from '../stores/playlistStore';
import { playSong, pausePlayback, resumePlayback, seekTo, useProgress } from '../services/audioService';
import LyricsView from '../components/LyricsView';

export default function PlayerScreen() {
  const {
    currentSong, isPlaying, togglePlay, playNext: storePlayNext, playPrevious: storePlayPrevious,
  } = usePlayerStore();
  const { isFavorite, toggleFavorite } = usePlaylistStore();
  const [lyrics, setLyrics] = useState<string | null>(null);
  const { position, duration } = useProgress(1000);

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

  function handleSeek(ratio: number) {
    const newPos = ratio * duration;
    seekTo(newPos);
  }

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
        style={styles.progressSection}
        onPress={(e) => {
          const { locationX } = e.nativeEvent;
          const width = 300; // approximate
          handleSeek(locationX / width);
        }}
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
        <TouchableOpacity onPress={() => toggleFavorite(currentSong.id)}>
          <Text style={styles.controlBtn}>{favorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePrevious}>
          <Text style={styles.controlBtn}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTogglePlay} style={styles.playBtn}>
          <Text style={styles.playBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.controlBtn}>⏭</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.controlBtn}>🔀</Text>
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
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  noSong: { fontSize: 18, color: '#999', textAlign: 'center', marginTop: 100 },
  coverSection: { alignItems: 'center', marginTop: 20 },
  cover: {
    width: 280, height: 280, borderRadius: 12, backgroundColor: '#e0e0e0',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  coverImage: { width: 280, height: 280 },
  coverText: { fontSize: 80, fontWeight: 'bold', color: '#999' },
  lyricsSection: { flex: 1, marginTop: 20 },
  infoSection: { alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  artist: { fontSize: 15, color: '#999', marginTop: 4 },
  progressSection: { marginBottom: 16 },
  progressBar: { height: 4, backgroundColor: '#e0e0e0', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#1db954', borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  time: { fontSize: 12, color: '#999' },
  controls: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 20,
  },
  controlBtn: { fontSize: 24, padding: 10 },
  playBtn: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#1db954',
    justifyContent: 'center', alignItems: 'center',
  },
  playBtnText: { fontSize: 28, color: '#fff' },
});
