import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  confidence: number; // 0..1
}

export const ConfidenceBadge: React.FC<Props> = ({ confidence }) => {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 80 ? Colors.safe : pct >= 50 ? Colors.caution : Colors.danger;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{pct}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  text: { fontSize: 11, fontWeight: '700' },
});
