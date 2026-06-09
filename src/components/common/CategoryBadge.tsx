import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScanCategory } from '../../models/ScanResult';

const ICONS: Record<ScanCategory, keyof typeof Ionicons.glyphMap> = {
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

interface Props {
  category: ScanCategory;
}

export const CategoryBadge: React.FC<Props> = ({ category }) => (
  <View style={styles.badge}>
    <Ionicons name={ICONS[category]} size={12} color="#555" />
    <Text style={styles.label}>{category.toUpperCase()}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#222',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});