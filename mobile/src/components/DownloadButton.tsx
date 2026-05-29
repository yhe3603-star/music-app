import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { DownloadService } from '../services/downloadService';
import { MusicApi } from '../services/api';
import { Song } from '../types';
import { Colors } from '../theme/colors';

interface Props {
  song: Song;
}

export default function DownloadButton({ song }: Props) {
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    DownloadService.isDownloaded(song.id).then(setDownloaded);
  }, [song.id]);

  async function handlePress() {
    if (downloaded) {
      Alert.alert(
        '已下载',
        '是否删除本地文件？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '删除',
            style: 'destructive',
            onPress: async () => {
              await DownloadService.removeDownload(song.id);
              setDownloaded(false);
            },
          },
        ],
      );
      return;
    }

    setDownloading(true);
    try {
      const serverUrl = await MusicApi.getApiBaseUrl();
      await DownloadService.downloadSong(song, serverUrl);
      setDownloaded(true);
      Alert.alert('下载完成', `${song.title} 已保存到本地`);
    } catch (err) {
      Alert.alert('下载失败', '请检查网络连接和服务器地址');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button} activeOpacity={0.7}>
      {downloading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : downloaded ? (
        <Icon name="checkmark-circle" size={20} color={Colors.accent} />
      ) : (
        <Icon name="download-outline" size={20} color={Colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 8 },
});
