import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { ScanHistory } from '../../models/ScanHistory';
import { CategoryBadge } from '../common/CategoryBadge';
import { ScanCategory } from '../../models/ScanResult';

interface Props {
  item: ScanHistory;
  onPress: (item: ScanHistory) => void;
  onDelete: (id: string) => void;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const HistoryItem: React.FC<Props> = ({ item, onPress, onDelete }) => {
  const swipeRef = useRef<Swipeable>(null);

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => {
        swipeRef.current?.close();
        onDelete(item.id);
      }}
    >
      <Ionicons name="trash" size={22} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => onPress(item)}
      >
        {/* Thumbnail */}
        {item.thumbnailUri ? (
          <Image source={{ uri: item.thumbnailUri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name="image" size={22} color={Colors.textMuted} />
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.previewName}
          </Text>
          <View style={styles.metaRow}>
            <CategoryBadge category={item.previewCategory as ScanCategory} />
            {item.objectCount > 1 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>+{item.objectCount - 1} more</Text>
              </View>
            )}
            <Text style={styles.date}>{formatDate(item.scannedAt)}</Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  thumb: { width: 54, height: 54, borderRadius: 12, marginRight: 12 },
  thumbPlaceholder: {
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { color: Colors.text, fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  date: { color: Colors.textMuted, fontSize: 12 },
  countBadge: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { color: Colors.accent, fontSize: 11, fontWeight: '600' },
  deleteAction: {
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderRadius: 16,
    marginBottom: 10,
  },
});