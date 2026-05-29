import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MusicApi } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import { useSearchStore } from '../stores/searchStore';
import SearchBar from '../components/SearchBar';
import SongItem from '../components/SongItem';
import MiniPlayer from '../components/MiniPlayer';
import { SearchResult, Song } from '../types';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { keyword, setKeyword, results, setResults, history, addHistory, clearHistory, loading, setLoading } = useSearchStore();
  const { setCurrentSong } = usePlayerStore();

  async function handleSearch() {
    if (!keyword.trim()) return;
    setLoading(true);
    addHistory(keyword.trim());
    try {
      const data = await MusicApi.search(keyword.trim());
      setResults(data.results);
    } catch (err) {
      console.warn('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleResultPress(result: SearchResult) {
    const song: Song = {
      id: parseInt(result.source_id || '0', 10) || 0,
      title: result.title, artist: result.artist, album: result.album,
      duration: result.duration, cover_url: result.cover_url,
      source: result.source, source_id: result.source_id,
      created_at: new Date().toISOString(),
    };
    setCurrentSong(song);
    navigation.navigate('Player');
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={keyword}
        onChangeText={setKeyword}
        onSubmit={handleSearch}
        onClear={() => { setKeyword(''); setResults([]); }}
      />
      {loading ? (
        <Text style={styles.loading}>搜索中...</Text>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.source}-${item.source_id}-${index}`}
          renderItem={({ item }) => (
            <SongItem
              song={{
                id: parseInt(item.source_id || '0', 10) || 0,
                title: item.title, artist: item.artist, album: item.album,
                duration: item.duration, cover_url: item.cover_url,
                source: item.source, source_id: item.source_id,
                created_at: new Date().toISOString(),
              }}
              onPress={() => handleResultPress(item)}
            />
          )}
        />
      ) : history.length > 0 ? (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>搜索历史</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearBtn}>清空</Text>
            </TouchableOpacity>
          </View>
          {history.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => { setKeyword(item); handleSearch(); }}
              style={styles.historyItem}
            >
              <Text style={styles.historyText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>搜索你想听的歌曲</Text>
        </View>
      )}
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { textAlign: 'center', marginTop: 20, color: '#999' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  historySection: { padding: 16 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  historyTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  clearBtn: { fontSize: 14, color: '#999' },
  historyItem: { paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  historyText: { fontSize: 15, color: '#666' },
});
