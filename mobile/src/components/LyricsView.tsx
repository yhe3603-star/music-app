import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Props {
  lyrics: string | null;
  currentTime?: number;
}

function parseLRC(lrc: string): { time: number; text: string }[] {
  const lines = lrc.split('\n');
  const result: { time: number; text: string }[] = [];
  for (const line of lines) {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      result.push({ time: minutes * 60 + seconds, text: match[3].trim() });
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

export default function LyricsView({ lyrics, currentTime = 0 }: Props) {
  if (!lyrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.noLyrics}>暂无歌词</Text>
      </View>
    );
  }

  const parsed = parseLRC(lyrics);
  if (parsed.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.lyricText}>{lyrics}</Text>
      </View>
    );
  }

  const currentIndex = parsed.findIndex((l, i) => {
    const next = parsed[i + 1];
    return currentTime >= l.time && (!next || currentTime < next.time);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {parsed.map((line, index) => (
        <Text
          key={index}
          style={[styles.lyricLine, index === currentIndex && styles.activeLyric]}
        >
          {line.text || '...'}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: 40, alignItems: 'center' },
  noLyrics: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 },
  lyricText: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 28 },
  lyricLine: { fontSize: 16, color: '#999', textAlign: 'center', lineHeight: 32 },
  activeLyric: { fontSize: 18, color: '#333', fontWeight: 'bold' },
});
