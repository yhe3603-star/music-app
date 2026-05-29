import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TrackPlayer from 'react-native-track-player';
import AppNavigator from './src/navigation/AppNavigator';
import { setupPlayer } from './src/services/audioService';
import PlaybackService from './src/services/PlaybackService';
import { usePlaylistStore } from './src/stores/playlistStore';

TrackPlayer.registerPlaybackService(() => PlaybackService);

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
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
