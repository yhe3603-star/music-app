import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { MusicApi } from '../services/api';
import { usePlaylistStore } from '../stores/playlistStore';
import MiniPlayer from '../components/MiniPlayer';
import { Colors, Typography, Spacing, Radius } from '../theme/colors';

export default function LibraryScreen() {
  const [playlistName, setPlaylistName] = useState('');
  const { playlists, setPlaylists } = usePlaylistStore();

  useEffect(() => { loadPlaylists(); }, []);

  async function loadPlaylists() {
    try {
      const data = await MusicApi.getPlaylists();
      setPlaylists(data);
    } catch (err) {
      console.warn('Failed to load playlists:', err);
    }
  }

  async function handleCreatePlaylist() {
    if (!playlistName.trim()) return;
    try {
      await MusicApi.createPlaylist(playlistName.trim());
      setPlaylistName('');
      await loadPlaylists();
    } catch {
      Alert.alert('错误', '创建播放列表失败');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>管理</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>创建播放列表</Text>
        <View style={styles.createRow}>
          <TextInput
            style={styles.input}
            value={playlistName}
            onChangeText={setPlaylistName}
            placeholder="播放列表名称"
            placeholderTextColor={Colors.textDisabled}
          />
          <TouchableOpacity activeOpacity={0.7} style={styles.createBtn} onPress={handleCreatePlaylist}>
            <Text style={styles.createBtnText}>创建</Text>
          </TouchableOpacity>
        </View>
      </View>
      {playlists.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>播放列表 ({playlists.length})</Text>
          <FlatList
            data={playlists}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.playlistItem}>
                <Text style={styles.playlistName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.playlistDesc}>{item.description}</Text>
                ) : null}
              </View>
            )}
          />
        </View>
      )}
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { ...Typography.display, padding: Spacing.lg, paddingBottom: Spacing.sm, paddingTop: 56 },
  section: { padding: Spacing.lg },
  sectionTitle: { ...Typography.title, marginBottom: Spacing.md, color: Colors.foreground },
  createRow: { flexDirection: 'row', gap: Spacing.sm },
  input: {
    flex: 1, borderWidth: 1, borderColor: Colors.border, color: Colors.foreground,
    backgroundColor: Colors.surface, borderRadius: Radius.sm,
    padding: Spacing.md, fontSize: 16,
  },
  createBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  createBtnText: { color: Colors.foreground, fontSize: 16, fontWeight: '600' },
  playlistItem: {
    paddingVertical: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  playlistName: { fontSize: 16, color: Colors.foreground },
  playlistDesc: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
});
