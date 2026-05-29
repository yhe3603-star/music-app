import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlayerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>正在播放</Text>
      <Text>封面、歌词、控制</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});
