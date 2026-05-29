import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TrackPlayer from 'react-native-track-player';
import AppNavigator from './src/navigation/AppNavigator';
import { PlayerProvider } from './src/stores/playerStore';
import { setupPlayer } from './src/services/audioService';
import PlaybackService from './src/services/PlaybackService';

// Register playback service for background/notification controls
TrackPlayer.registerPlaybackService(() => PlaybackService);

const App = () => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    async function init() {
      const ready = await setupPlayer();
      setIsPlayerReady(ready);
    }
    init();
  }, []);

  if (!isPlayerReady) {
    return null; // or a loading screen
  }

  return (
    <PlayerProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PlayerProvider>
  );
};

export default App;
