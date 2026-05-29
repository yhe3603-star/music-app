import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearApiBaseCache } from '../services/api';
import { Colors, Typography, Spacing, Radius } from '../theme/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const SERVER_URL_KEY = 'server_url';
const DEFAULT_SERVER = 'http://10.0.2.2:8000';

export default function SettingsScreen() {
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER);

  useEffect(() => {
    AsyncStorage.getItem(SERVER_URL_KEY).then((stored) => {
      if (stored) setServerUrl(stored);
    });
  }, []);

  async function handleSave() {
    try {
      await AsyncStorage.setItem(SERVER_URL_KEY, serverUrl);
      clearApiBaseCache();
      Alert.alert('成功', '服务器地址已保存');
    } catch {
      Alert.alert('错误', '保存失败');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>设置</Text>
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Icon name="server-outline" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>服务器配置</Text>
        </View>
        <Text style={styles.label}>后端服务器地址</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.100:8000"
          placeholderTextColor={Colors.textDisabled}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity activeOpacity={0.7} style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>保存</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Icon name="information-circle-outline" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>关于</Text>
        </View>
        <Text style={styles.about}>Music App v1.0.0</Text>
        <Text style={styles.about}>个人音乐播放器</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { ...Typography.display, padding: Spacing.lg, paddingBottom: Spacing.sm, paddingTop: 56 },
  section: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { ...Typography.title, marginBottom: 0 },
  label: { ...Typography.caption, marginBottom: Spacing.sm },
  input: {
    borderWidth: 1, borderColor: Colors.border, color: Colors.foreground,
    backgroundColor: Colors.background, borderRadius: Radius.sm,
    padding: Spacing.md, fontSize: 16,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: Spacing.lg,
    alignItems: 'center', marginTop: Spacing.md,
  },
  saveBtnText: { color: Colors.foreground, fontSize: 16, fontWeight: '600' },
  about: { ...Typography.body, color: Colors.textMuted, marginBottom: Spacing.xs },
});
