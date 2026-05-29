import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Radius } from '../theme/colors';

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
      <Icon name="search" size={20} color={Colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder || '搜索歌曲、歌手...'}
        placeholderTextColor={Colors.textDisabled}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <Icon name="close-circle" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    margin: 12, paddingHorizontal: 12,
  },
  input: { flex: 1, height: 44, fontSize: 16, color: Colors.foreground, marginLeft: 8 },
  clearBtn: { padding: 6 },
});
