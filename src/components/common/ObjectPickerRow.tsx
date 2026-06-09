import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannedObject, ScanCategory } from '../../models/ScanResult';

// Reusable object row for camera picker and history picker
interface Props {
  obj: ScannedObject;
  onPress: (obj: ScannedObject) => void;
}

const CATEGORY_ICONS: Record<ScanCategory, keyof typeof Ionicons.glyphMap> = {
  plant:   'leaf-outline',
  animal:  'paw-outline',
  food:    'restaurant-outline',
  object:  'cube-outline',
  text:    'document-text-outline',
  place:   'location-outline',
  product: 'bag-outline',
  person:  'person-outline',
  unknown: 'help-circle-outline',
};

export const ObjectPickerRow: React.FC<Props> = ({ obj, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={() => onPress(obj)} activeOpacity={0.6}>
    <View style={styles.iconWrap}>
      <Ionicons name={CATEGORY_ICONS[obj.category] ?? 'cube-outline'} size={18} color="#555" />
    </View>
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>{obj.name}</Text>
      <Text style={styles.type}>{obj.type}</Text>
    </View>
    {obj.danger && obj.danger !== 'safe' && (
      <View style={styles.dangerPill}>
        <Ionicons
          name={obj.danger === 'dangerous' ? 'warning-outline' : 'information-circle-outline'}
          size={12}
          color={obj.danger === 'dangerous' ? '#fff' : '#888'}
        />
        <Text style={[
          styles.dangerText,
          { color: obj.danger === 'dangerous' ? '#fff' : '#888' }
        ]}>
          {obj.danger === 'dangerous' ? 'Dangerous' : 'Caution'}
        </Text>
      </View>
    )}
    <Ionicons name="chevron-forward" size={16} color="#333" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { color: '#fff', fontSize: 15, fontWeight: '500' },
  type: { color: '#555', fontSize: 12, marginTop: 2 },
  dangerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#222',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dangerText: { fontSize: 11, fontWeight: '600' },
});