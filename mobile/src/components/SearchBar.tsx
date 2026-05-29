import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, onSubmit, onClear, placeholder }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder || '搜索歌曲、歌手...'}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f0f0f0', borderRadius: 8, margin: 12, paddingHorizontal: 12,
  },
  input: { flex: 1, height: 40, fontSize: 16, color: '#333' },
  clearBtn: { padding: 6 },
  clearText: { fontSize: 16, color: '#999' },
});
