import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannedObject } from '../../models/ScanResult';
import { CategoryBadge } from '../common/CategoryBadge';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { useLanguageStore } from '../../store/languageStore';

interface Props {
  result: ScannedObject;
}

export const WhatIsItSection: React.FC<Props> = ({ result }) => {
  const language = useLanguageStore((s) => s.selectedLanguage);
  const isBurmese = language === 'my';

  return (
    <View style={styles.wrap}>
      <Text style={[styles.name, isBurmese && styles.nameMM]}>{result.name}</Text>

      {result.brand ? (
        <Text style={[styles.brand, isBurmese && styles.brandMM]}>{result.brand}</Text>
      ) : null}

      {result.type ? (
        <Text style={[styles.type, isBurmese && styles.typeMM]}>{result.type}</Text>
      ) : null}

      {result.count > 1 && (
        <View style={styles.pill}>
          <Ionicons name="layers-outline" size={11} color="#888" />
          <Text style={styles.pillText}>× {result.count}</Text>
        </View>
      )}

      {result.is_celebrity && (
        <View style={styles.pill}>
          <Ionicons name="star-outline" size={11} color="#888" />
          <Text style={styles.pillText}>Public Figure</Text>
        </View>
      )}

      <View style={styles.badges}>
        <CategoryBadge category={result.category} />
        <ConfidenceBadge confidence={result.confidence} />
      </View>

      {result.is_unknown && result.reason && (
        <View style={styles.reasonRow}>
          <Ionicons name="information-circle-outline" size={14} color="#555" />
          <Text style={[styles.reasonText, isBurmese && styles.reasonTextMM]}>{result.reason}</Text>
        </View>
      )}

      {result.calories ? (
        <View style={styles.metaRow}>
          <Ionicons name="flame-outline" size={14} color="#555" />
          <Text style={[styles.metaText, isBurmese && styles.metaTextMM]}>{result.calories}</Text>
        </View>
      ) : null}

      {result.buy_at ? (
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#555" />
          <Text style={[styles.metaText, isBurmese && styles.metaTextMM]}>{result.buy_at}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  name: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.5,
    includeFontPadding: true,
    textAlignVertical: 'center',
    textTransform: 'capitalize',
  },
  nameMM: {
    fontFamily: 'Padauk',
    lineHeight: 46,
    letterSpacing: 0,
    includeFontPadding: true,
  },
  brand: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 22,
    includeFontPadding: true,
    textTransform: 'capitalize',
  },
  brandMM: {
    fontFamily: 'Padauk',
    lineHeight: 28,
    includeFontPadding: true,
  },
  type: {
    color: '#444',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 20,
    includeFontPadding: true,
    textTransform: 'capitalize',
  },
  typeMM: {
    fontFamily: 'Padauk',
    lineHeight: 26,
    includeFontPadding: true,
  },
  badges: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 4, flexWrap: 'wrap' },
  pill: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#222',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  pillText: { color: '#888', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#111',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#222',
  },
  reasonText: { flex: 1, color: '#888', fontSize: 13, lineHeight: 20, textTransform: 'capitalize' },
  reasonTextMM: {
    fontFamily: 'Padauk',
    lineHeight: 26,
    includeFontPadding: true,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  metaText: { color: '#555', fontSize: 13, lineHeight: 20, flex: 1, textTransform: 'capitalize' },
  metaTextMM: {
    fontFamily: 'Padauk',
    lineHeight: 26,
    includeFontPadding: true,
  },
});