import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DangerLevel } from '../../models/ScanResult';

interface Props {
  level: DangerLevel;
}

const CONFIG: Record<DangerLevel, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  safe:      { label: 'SAFE',        color: '#555', icon: 'checkmark-circle-outline' },
  caution:   { label: 'USE CAUTION', color: '#888', icon: 'information-circle-outline' },
  dangerous: { label: 'DANGEROUS',   color: '#fff', icon: 'warning-outline' },
};

export const DangerBadge: React.FC<Props> = ({ level }) => {
  const cfg = CONFIG[level];
  return (
    <View style={styles.badge}>
      <Ionicons name={cfg.icon} size={13} color={cfg.color} />
      <Text style={[styles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#222',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});