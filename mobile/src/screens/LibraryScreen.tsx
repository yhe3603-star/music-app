import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { MusicApi } from '../services/api';
import { usePlaylistStore } from '../stores/playlistStore';
import MiniPlayer from '../components/MiniPlayer';

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
          />
          <TouchableOpacity style={styles.createBtn} onPress={handleCreatePlaylist}>
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
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', padding: 16, paddingBottom: 8 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  createRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, fontSize: 16,
  },
  createBtn: {
    backgroundColor: '#1db954', borderRadius: 8, paddingHorizontal: 20,
    justifyContent: 'center',
  },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  playlistItem: {
    paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  playlistName: { fontSize: 16, color: '#333' },
  playlistDesc: { fontSize: 13, color: '#999', marginTop: 2 },
});
