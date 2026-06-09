import React, { useState, useMemo } from 'react';
import {
  Modal, View, Text, TextInput,
  FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LANGUAGES, Language } from '../../constants/languages';
import { useLanguageStore } from '../../store/languageStore';
import { Colors } from '../../constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const LanguageSelector: React.FC<Props> = ({ visible, onClose }) => {
  const { selectedLanguage, setLanguage } = useLanguageStore();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter((l) => l.name.toLowerCase().includes(q));
  }, [query]);

  const handleSelect = async (code: string) => {
    await setLanguage(code);
    onClose();
  };

  const renderItem = ({ item }: { item: Language }) => {
    const active = item.code === selectedLanguage;
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => handleSelect(item.code)}
        activeOpacity={0.6}
      >
        {/* Flag stays — no icon equivalent */}
        <Text style={styles.flag}>{item.flag}</Text>
        <Text style={[styles.name, active && styles.nameActive]}>
          {item.name}
        </Text>
        {active && (
          <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Language</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color="#555" />
            <TextInput
              style={styles.search}
              placeholder="Search"
              placeholderTextColor="#444"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={16} color="#555" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(l) => l.code}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.empty}>No languages found</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#222',
  },
  search: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#111',
  },
  flag: { fontSize: 20, marginRight: 14, width: 28 },
  name: { flex: 1, color: '#555', fontSize: 15 },
  nameActive: { color: '#fff', fontWeight: '500' },
  empty: { color: '#444', textAlign: 'center', padding: 24, fontSize: 14 },
});