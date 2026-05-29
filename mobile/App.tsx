import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { PlayerProvider } from './src/stores/playerStore';

const App = () => {
  return (
    <PlayerProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PlayerProvider>
  );
};

export default App;
