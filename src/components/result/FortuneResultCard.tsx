import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannedObject } from '../../models/ScanResult';
import { BannerAdWidget } from './BannerAdWidget';
import { useLanguageStore } from '../../store/languageStore';

interface Props {
  result: ScannedObject;
}

export const FortuneResultCard: React.FC<Props> = ({ result }) => {
  const f = result.fortune_result;
  if (!f) return null;

  const language = useLanguageStore((s) => s.selectedLanguage);
  const isBurmese = language === 'my';
  const mm = isBurmese ? styles.textMM : null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${f.share_text}\n\nLucky number: ${f.lucky_number} · Lucky color: ${f.lucky_color}\n\nScope`,
      });
    } catch { /* ignore */ }
  };

  return (
    <View style={styles.card}>

      {/* Header strip */}
      <View style={styles.headerStrip}>
        <Ionicons name="sparkles-outline" size={14} color="#888" />
        <Text style={styles.headerLabel}>FORTUNE READING</Text>
      </View>

      {/* What the AI saw */}
      <View style={styles.subjectRow}>
        <Ionicons name="eye-outline" size={13} color="#555" />
        <Text style={styles.subjectText}>
          {f.subject.charAt(0).toUpperCase() + f.subject.slice(1)}
        </Text>
      </View>

      {/* Greeting */}
      <Text style={styles.greetingLabel}>TODAY'S READING</Text>
      <Text style={[styles.greeting, mm]}>{f.greeting}</Text>

      {/* Four readings */}
      <View style={styles.readingsWrap}>
        {f.readings.map((r, i) => (
          <View
            key={r.category}
            style={[styles.readingRow, i < f.readings.length - 1 && styles.readingRowBorder]}
          >
            <View style={styles.readingIconWrap}>
              <Ionicons name={CATEGORY_ICONS[r.category]} size={13} color="#555" />
            </View>
            <View style={styles.readingContent}>
              <Text style={styles.readingCategory}>{r.category.toUpperCase()}</Text>
              <Text style={[styles.readingText, mm]}>{r.text}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Lucky number + color */}
      <View style={styles.luckyRow}>
        <View style={styles.luckyChip}>
          <Ionicons name="star-outline" size={12} color="#555" />
          <Text style={styles.luckyLabel}>Lucky number</Text>
          <Text style={styles.luckyValue}>{f.lucky_number}</Text>
        </View>
        <View style={styles.luckyChip}>
          <Ionicons name="color-palette-outline" size={12} color="#555" />
          <Text style={styles.luckyLabel}>Lucky color</Text>
          <Text style={[styles.luckyValue, mm]}>{f.lucky_color}</Text>
        </View>
      </View>

      {/* Share */}
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
        <Ionicons name="share-outline" size={16} color="#888" />
        <Text style={styles.shareBtnText}>Share reading</Text>
      </TouchableOpacity>

      {/* Disclaimer */}
      <View style={styles.disclaimerRow}>
        <Ionicons name="information-circle-outline" size={14} color="#333" />
        <Text style={styles.disclaimerText}>For entertainment only.</Text>
      </View>

      <BannerAdWidget />
    </View>
  );
};

const CATEGORY_ICONS: Record<string, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
  love:   'heart-outline',
  career: 'briefcase-outline',
  money:  'cash-outline',
  energy: 'flash-outline',
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1a1a1a',
  },
  headerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0d0d0d',
    marginBottom: 20,
  },
  headerLabel:   { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: '#888' },
  subjectRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  subjectText:   { color: '#555', fontSize: 12, fontWeight: '600', flex: 1 },
  greetingLabel: { color: '#333', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  greeting: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  readingsWrap: {
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1a1a1a',
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  readingRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#111',
  },
  readingIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  textMM: {
    fontFamily: 'Padauk',
    lineHeight: 28,
    includeFontPadding: true,
  },
  readingContent:  { flex: 1 },
  readingCategory: { color: '#333', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  readingText:     { color: '#ddd', fontSize: 13, lineHeight: 19 },
  luckyRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1a1a1a',
  },
  luckyChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0d0d0d',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1e1e1e',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  luckyLabel: { color: '#444', fontSize: 11, flex: 1 },
  luckyValue: { color: '#888', fontSize: 12, fontWeight: '600' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1e1e1e',
    backgroundColor: '#0d0d0d',
  },
  shareBtnText: { color: '#888', fontSize: 13, fontWeight: '600' },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1a1a1a',
  },
  disclaimerText: { flex: 1, color: '#333', fontSize: 11, lineHeight: 17 },
});