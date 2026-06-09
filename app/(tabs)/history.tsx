import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Modal, Pressable, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHistoryStore } from '../../src/store/historyStore';
import { useScanStore } from '../../src/store/scanStore';
import { HistoryItem } from '../../src/components/history/HistoryItem';
import { ObjectPickerRow } from '../../src/components/common/ObjectPickerRow';
import { ScanHistory } from '../../src/models/ScanHistory';
import { ScannedObject } from '../../src/models/ScanResult';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { history, deleteHistory, clearHistory } = useHistoryStore();
  const { setCurrentResult } = useScanStore();
  const [pickerItem, setPickerItem] = useState<ScanHistory | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  

  const openResult = (item: ScanHistory) => {
    if (item.result.objects.length === 1) {
      setCurrentResult(item.result.objects[0], item.thumbnailUri ?? null);
      router.push('/result');
      return;
    }
    setPickerItem(item);
    setPickerVisible(true);
  };

  const handleSelectObject = (obj: ScannedObject) => {
    setPickerVisible(false);
    setCurrentResult(obj, pickerItem?.thumbnailUri ?? null);
    router.push('/result');
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear history',
      'This will permanently delete all scan history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: async () => await clearHistory(),
        },
      ]
    );
  };

  if (history.length === 0) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        <Ionicons name="time-outline" size={56} color="#222" />
        <Text style={styles.emptyTitle}>No scans yet</Text>
        <Text style={styles.emptyText}>Start scanning to build your history.</Text>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => router.push('/(tabs)/camera')}
        >
          <Ionicons name="scan-outline" size={16} color="#000" />
          <Text style={styles.scanBtnText}>Start scanning</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>History</Text>
        <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
          <Ionicons name="trash-outline" size={16} color="#555" />
          <Text style={styles.clearBtnText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryItem item={item} onPress={openResult} onDelete={deleteHistory} />
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPickerVisible(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>
              {pickerItem?.objectCount ?? 0} objects found
            </Text>
            <Text style={styles.sheetSubtitle}>Select one to view details</Text>
            <FlatList
              data={pickerItem?.result.objects ?? []}
              keyExtractor={(obj, index) => `${obj.object_id}_${index}`}
              scrollEnabled={false}
              renderItem={({ item: obj }) => (
                <ObjectPickerRow obj={obj} onPress={handleSelectObject} />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808', paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  header: { color: '#E8E8E8', fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#0F0F0F',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1E1E1E',
  },
  clearBtnText: { color: '#555', fontSize: 13, fontWeight: '500' },
  empty: {
    flex: 1, backgroundColor: '#080808',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40,
  },
  emptyTitle: { color: '#E8E8E8', fontSize: 18, fontWeight: '600', marginTop: 20, letterSpacing: -0.3 },
  emptyText: { color: '#555', fontSize: 14, textAlign: 'center', marginTop: 8 },
  scanBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#C0152A', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14, marginTop: 28,
  },
  scanBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#0F0F0F',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#1E1E1E',
    paddingHorizontal: 20, paddingTop: 12,
  },
  handle: {
    width: 36, height: 3, backgroundColor: '#2A2A2A',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { color: '#E8E8E8', fontSize: 17, fontWeight: '600', letterSpacing: -0.3, marginBottom: 4 },
  sheetSubtitle: { color: '#555', fontSize: 13, marginBottom: 16 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#1E1E1E' },
});