import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Playlist } from '../types';
import { Colors, Typography, Radius } from '../theme/colors';

interface Props {
  playlist: Playlist;
  onPress: (playlist: Playlist) => void;
}

export default function PlaylistCard({ playlist, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(playlist)} activeOpacity={0.7}>
      <View style={styles.cover}>
        <Text style={styles.coverText}>
          {(playlist.name || '?')[0].toUpperCase()}
        </Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>{playlist.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: 140, marginRight: 12 },
  cover: {
    width: 140, height: 140, borderRadius: Radius.lg, backgroundColor: Colors.surfaceMuted,
    borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  coverText: { fontSize: 40, fontWeight: 'bold', color: Colors.primary },
  name: { fontSize: 14, marginTop: 6, color: Colors.foreground },
});
