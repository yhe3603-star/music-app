import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';

const DOWNLOAD_DIR = `${RNFS.DocumentDirectoryPath}/music_downloads`;
const DOWNLOAD_INDEX_KEY = 'downloaded_songs';

interface DownloadedSong {
  songId: number;
  localPath: string;
  title: string;
  artist?: string;
  downloadedAt: string;
}

export const DownloadService = {
  async ensureDir() {
    const exists = await RNFS.exists(DOWNLOAD_DIR);
    if (!exists) {
      await RNFS.mkdir(DOWNLOAD_DIR);
    }
  },

  async getDownloadedSongs(): Promise<DownloadedSong[]> {
    try {
      const data = await AsyncStorage.getItem(DOWNLOAD_INDEX_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async isDownloaded(songId: number): Promise<boolean> {
    const downloads = await this.getDownloadedSongs();
    return downloads.some((d) => d.songId === songId);
  },

  async getLocalPath(songId: number): Promise<string | null> {
    const downloads = await this.getDownloadedSongs();
    const download = downloads.find((d) => d.songId === songId);
    if (!download) return null;
    const exists = await RNFS.exists(download.localPath);
    return exists ? download.localPath : null;
  },

  async downloadSong(song: Song, serverUrl: string): Promise<string> {
    await this.ensureDir();

    const ext = '.mp3';
    const filename = `${song.id}_${song.title.replace(/[^a-zA-Z0-9一-鿿]/g, '_')}${ext}`;
    const localPath = `${DOWNLOAD_DIR}/${filename}`;

    const downloadUrl = `${serverUrl}/api/songs/${song.id}/download`;

    const result = await RNFS.downloadFile({
      fromUrl: downloadUrl,
      toFile: localPath,
      progress: (res) => {
        const percent = (res.bytesWritten / res.contentLength) * 100;
        console.log(`Download progress: ${percent.toFixed(1)}%`);
      },
    }).promise;

    if (result.statusCode === 200) {
      const downloads = await this.getDownloadedSongs();
      downloads.push({
        songId: song.id,
        localPath,
        title: song.title,
        artist: song.artist,
        downloadedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(DOWNLOAD_INDEX_KEY, JSON.stringify(downloads));
      return localPath;
    }

    throw new Error(`Download failed with status ${result.statusCode}`);
  },

  async removeDownload(songId: number): Promise<void> {
    const downloads = await this.getDownloadedSongs();
    const download = downloads.find((d) => d.songId === songId);
    if (download) {
      const exists = await RNFS.exists(download.localPath);
      if (exists) {
        await RNFS.unlink(download.localPath);
      }
      const updated = downloads.filter((d) => d.songId !== songId);
      await AsyncStorage.setItem(DOWNLOAD_INDEX_KEY, JSON.stringify(updated));
    }
  },

  async getDownloadSize(): Promise<number> {
    const downloads = await this.getDownloadedSongs();
    let totalSize = 0;
    for (const d of downloads) {
      try {
        const exists = await RNFS.exists(d.localPath);
        if (exists) {
          const stat = await RNFS.stat(d.localPath);
          totalSize += parseInt(stat.size, 10);
        }
      } catch {
        // skip
      }
    }
    return totalSize;
  },
};
