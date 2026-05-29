import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme/colors';

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
  const scrollRef = useRef<ScrollView>(null);
  const lineRefs = useRef<View[]>([]);

  const parsed = useMemo(() => {
    if (!lyrics) return [];
    return parseLRC(lyrics);
  }, [lyrics]);

  const currentIndex = useMemo(() => {
    if (parsed.length === 0) return -1;
    return parsed.findIndex((l, i) => {
      const next = parsed[i + 1];
      return currentTime >= l.time && (!next || currentTime < next.time);
    });
  }, [parsed, currentTime]);

  useEffect(() => {
    if (currentIndex >= 0 && lineRefs.current[currentIndex]) {
      lineRefs.current[currentIndex]?.measureLayout(
        scrollRef.current as any,
        (_x, y) => {
          scrollRef.current?.scrollTo({ y: Math.max(0, y - 150), animated: true });
        },
        () => {},
      );
    }
  }, [currentIndex]);

  if (!lyrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.noLyrics}>暂无歌词</Text>
      </View>
    );
  }

  if (parsed.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.lyricText}>{lyrics}</Text>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      {parsed.map((line, index) => (
        <View key={index} ref={(ref) => { if (ref) lineRefs.current[index] = ref; }}>
          <Text
            style={[styles.lyricLine, index === currentIndex && styles.activeLyric]}
          >
            {line.text || '...'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: 40, alignItems: 'center' },
  noLyrics: { ...Typography.body, color: Colors.textMuted, textAlign: 'center', marginTop: 40 },
  lyricText: { ...Typography.body, color: Colors.textMuted, textAlign: 'center', lineHeight: 28 },
  lyricLine: { fontSize: 16, color: Colors.textDisabled, textAlign: 'center', lineHeight: 32 },
  activeLyric: {
    fontSize: 20, color: Colors.foreground, fontWeight: 'bold',
    textShadowColor: Colors.primary, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
  },
});
