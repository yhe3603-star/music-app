import TrackPlayer, { Capability, usePlaybackState, useProgress, useActiveTrack } from 'react-native-track-player';
import { MusicApi } from './api';
import { DownloadService } from './downloadService';
import { Song } from '../types';

export async function setupPlayer() {
  try {
    await TrackPlayer.setupPlayer({
      maxCacheSize: 1024 * 50, // 50MB cache
    });

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      progressUpdateEventInterval: 1, // 1 second
    });

    return true;
  } catch (error) {
    console.warn('TrackPlayer setup error:', error);
    return false;
  }
}

export async function playSong(song: Song) {
  await TrackPlayer.reset();

  // Check for local download first
  let url = MusicApi.getStreamUrl(song.id);
  try {
    const localPath = await DownloadService.getLocalPath(song.id);
    if (localPath) {
      url = `file://${localPath}`;
    }
  } catch {
    // fall back to streaming
  }

  const track = {
    id: String(song.id),
    url,
    title: song.title,
    artist: song.artist || '未知歌手',
    album: song.album || '',
    artwork: song.cover_url || undefined,
    duration: song.duration ? song.duration / 1000 : undefined, // convert ms to seconds
  };

  await TrackPlayer.add(track);
  await TrackPlayer.play();
}

export async function playQueue(songs: Song[], startIndex: number = 0) {
  await TrackPlayer.reset();

  const tracks = songs.map((song) => ({
    id: String(song.id),
    url: MusicApi.getStreamUrl(song.id),
    title: song.title,
    artist: song.artist || '未知歌手',
    album: song.album || '',
    artwork: song.cover_url || undefined,
    duration: song.duration ? song.duration / 1000 : undefined,
  }));

  await TrackPlayer.add(tracks);

  if (startIndex > 0) {
    await TrackPlayer.skip(startIndex);
  }

  await TrackPlayer.play();
}

export async function pausePlayback() {
  await TrackPlayer.pause();
}

export async function resumePlayback() {
  await TrackPlayer.play();
}

export async function skipToNext() {
  try {
    await TrackPlayer.skipToNext();
  } catch {
    // no next track
  }
}

export async function skipToPrevious() {
  try {
    await TrackPlayer.skipToPrevious();
  } catch {
    // no previous track
  }
}

export async function seekTo(position: number) {
  await TrackPlayer.seekTo(position);
}

export { usePlaybackState, useProgress, useActiveTrack };
