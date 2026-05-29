import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_URL_KEY = 'server_url';
const DEFAULT_SERVER = 'http://10.0.2.2:8000';

export default function SettingsScreen() {
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER);

  async function handleSave() {
    try {
      await AsyncStorage.setItem(SERVER_URL_KEY, serverUrl);
      Alert.alert('成功', '服务器地址已保存');
    } catch {
      Alert.alert('错误', '保存失败');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>设置</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>服务器配置</Text>
        <Text style={styles.label}>后端服务器地址</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.100:8000"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>保存</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <Text style={styles.about}>Music App v1.0.0</Text>
        <Text style={styles.about}>个人音乐播放器</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', padding: 16, paddingBottom: 8 },
  section: { padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  label: { fontSize: 14, color: '#666', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12,
    fontSize: 16, color: '#333',
  },
  saveBtn: {
    backgroundColor: '#1db954', borderRadius: 8, padding: 14,
    alignItems: 'center', marginTop: 12,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  about: { fontSize: 14, color: '#999', marginBottom: 4 },
});
