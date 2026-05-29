import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import TrackPlayer from 'react-native-track-player';
import AppNavigator from './src/navigation/AppNavigator';
import { setupPlayer } from './src/services/audioService';
import PlaybackService from './src/services/PlaybackService';
import { usePlaylistStore } from './src/stores/playlistStore';
import { Colors } from './src/theme/colors';

TrackPlayer.registerPlaybackService(() => PlaybackService);

const musicDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.foreground,
    border: Colors.border,
    primary: Colors.primary,
    notification: Colors.destructive,
  },
};

const App = () => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const loadFavorites = usePlaylistStore((state) => state.loadFavorites);

  useEffect(() => {
    async function init() {
      await loadFavorites();
      const ready = await setupPlayer();
      setIsPlayerReady(ready);
    }
    init();
  }, []);

  if (!isPlayerReady) {
    return null;
  }

  return (
    <NavigationContainer theme={musicDarkTheme}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
