import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHistoryStore } from '../../src/store/historyStore';
import { useScanStore } from '../../src/store/scanStore';
import { HistoryItem } from '../../src/components/history/HistoryItem';
import { ObjectPickerRow } from '../../src/components/common/ObjectPickerRow';
import { SwipeableSheet } from '../../src/components/common/SwipeableSheet';
import { ScanHistory } from '../../src/models/ScanHistory';
import { ScannedObject } from '../../src/models/ScanResult';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { history, deleteHistory, clearHistory } = useHistoryStore();
  const { setCurrentResult } = useScanStore();
  const [pickerItem, setPickerItem] = useState<ScanHistory | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const isClosing = useRef(false);

  const openResult = useCallback((item: ScanHistory) => {
    if (isClosing.current) return;
    if (item.result.objects.length === 1) {
      setCurrentResult(item.result.objects[0], item.thumbnailUri ?? null);
      router.push('/result');
      return;
    }
    setPickerItem(item);
    setPickerVisible(true);
  }, [setCurrentResult, router]);

  const handleClose = useCallback(() => {
    isClosing.current = true;
    setPickerVisible(false);
    setTimeout(() => {
      setPickerItem(null);
      isClosing.current = false;
    }, 300);
  }, []);

  const handleSelectObject = useCallback((obj: ScannedObject) => {
    isClosing.current = true;
    setPickerVisible(false);
    const thumb = pickerItem?.thumbnailUri ?? null;
    setTimeout(() => {
      setPickerItem(null);
      isClosing.current = false;
      setCurrentResult(obj, thumb);
      router.push('/result');
    }, 50);
  }, [pickerItem, setCurrentResult, router]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear history',
      'This will permanently delete all scan history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear all', style: 'destructive', onPress: () => clearHistory() },
      ]
    );
  }, [clearHistory]);

  const renderItem = useCallback(({ item }: { item: ScanHistory }) => (
    <HistoryItem item={item} onPress={openResult} onDelete={deleteHistory} />
  ), [openResult, deleteHistory]);

  const renderPickerItem = useCallback(({ item }: { item: ScannedObject }) => (
    <ObjectPickerRow obj={item} onPress={handleSelectObject} />
  ), [handleSelectObject]);

  const keyExtractor = useCallback((item: ScanHistory) => item.id, []);
  const pickerKeyExtractor = useCallback((obj: ScannedObject, index: number) => `${obj.object_id}_${index}`, []);
  const pickerSeparator = useCallback(() => <View style={styles.separator} />, []);

  if (history.length === 0) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        <Ionicons name="time-outline" size={56} color="#222" />
        <Text style={styles.emptyTitle}>No scans yet</Text>
        <Text style={styles.emptyText}>Start scanning to build your history.</Text>
        <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/camera')}>
          <Ionicons name="scan-outline" size={16} color="#fff" />
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
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={15}
      />

      <SwipeableSheet
        visible={pickerVisible}
        onClose={handleClose}
        bottomInset={insets.bottom}
      >
        <Text style={styles.sheetTitle}>
          {pickerItem?.objectCount ?? 0} Objects found
        </Text>
        <Text style={styles.sheetSubtitle}>Select one to view details</Text>
        <FlatList
          data={pickerItem?.result.objects ?? []}
          keyExtractor={pickerKeyExtractor}
          scrollEnabled={false}
          renderItem={renderPickerItem}
          ItemSeparatorComponent={pickerSeparator}
        />
      </SwipeableSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080808', paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  header: { color: '#E8E8E8', fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, backgroundColor: '#0F0F0F',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#1E1E1E',
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
  sheetTitle: { color: '#fff', fontSize: 17, fontWeight: '600', letterSpacing: -0.3, marginBottom: 4, textTransform: 'capitalize' },
  sheetSubtitle: { color: '#555', fontSize: 13, marginBottom: 16 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#1E1E1E' },
});