import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '../../store/languageStore';

interface Props {
  goodPoints: string[];
  badPoints: string[];
}

export const GoodBadSection: React.FC<Props> = ({ goodPoints, badPoints }) => {
  const language = useLanguageStore((s) => s.selectedLanguage);
  const isBurmese = language === 'my';
  const mm = isBurmese ? styles.textMM : null;
  const rowStyle = [styles.row, isBurmese && styles.rowMM];

  if (goodPoints.length === 0 && badPoints.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {goodPoints.slice(0, 3).map((point, i) => (
        <View style={rowStyle} key={`good_${i}`}>
          <Ionicons name="arrow-up" size={14} color="#fff" style={styles.icon} />
          <Text style={[styles.text, mm]}>{point}</Text>
        </View>
      ))}
      {badPoints.slice(0, 3).map((point, i) => (
        <View style={rowStyle} key={`bad_${i}`}>
          <Ionicons name="arrow-down" size={14} color="#555" style={styles.icon} />
          <Text style={[styles.text, styles.textMuted, mm]}>{point}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginTop: 20, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowMM: { alignItems: 'center' },
  icon: { marginTop: 1 },
  text: { flex: 1, color: '#fff', fontSize: 14, lineHeight: 20, fontWeight: '400', textTransform: 'capitalize' },
  textMuted: { color: '#555' },
  textMM: {
    fontFamily: 'Padauk',
    lineHeight: 28,
    includeFontPadding: true,
  },
});