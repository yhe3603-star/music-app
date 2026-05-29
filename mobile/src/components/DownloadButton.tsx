import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { DownloadService } from '../services/downloadService';
import { Song } from '../types';

interface Props {
  song: Song;
  serverUrl?: string;
}

export default function DownloadButton({ song, serverUrl = 'http://10.0.2.2:8000' }: Props) {
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
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <Text style={[styles.text, downloaded && styles.downloaded]}>
        {downloading ? '⏳' : downloaded ? '✅' : '⬇️'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 8 },
  text: { fontSize: 18 },
  downloaded: { opacity: 0.6 },
});
