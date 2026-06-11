import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannedObject } from '../../models/ScanResult';
import { BannerAdWidget } from './BannerAdWidget';
import { useLanguageStore } from '../../store/languageStore';

interface Props {
  result: ScannedObject;
}

export const CaptionResultCard: React.FC<Props> = ({ result }) => {
  const c = result.caption_result;
  if (!c) return null;

  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);
  const language = useLanguageStore((s) => s.selectedLanguage);
  const isBurmese = language === 'my';
  const textStyle = isBurmese ? styles.textMM : null;

  const handleCopy = (style: string, text: string) => {
    const tags = c.hashtags.map(h => `#${h}`).join(' ');
    Clipboard.setString(`${text}\n\n${tags}`);
    setCopiedStyle(style);
    setTimeout(() => setCopiedStyle(null), 2000);
  };

  return (
    <View style={styles.card}>

      <View style={styles.headerStrip}>
        <Ionicons name="chatbubble-ellipses-outline" size={14} color="#888" />
        <Text style={styles.headerLabel}>CAPTION</Text>
        <Text style={styles.summaryText} numberOfLines={1}>{c.image_summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>STYLES</Text>
        {c.captions.map((cap, i) => {
          const copied = copiedStyle === cap.style;
          const isLast = i === c.captions.length - 1;
          return (
            <View
              key={cap.style}
              style={[styles.captionRow, !isLast && styles.captionRowBorder]}
            >
              <Text style={[styles.capText, textStyle]}>{cap.text}</Text>
              <TouchableOpacity
                style={[styles.copyBtn, copied && styles.copyBtnDone]}
                onPress={() => handleCopy(cap.style, cap.text)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={14}
                  color={copied ? '#fff' : '#555'}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>HASHTAGS</Text>
        <View style={styles.hashtagsWrap}>
          {c.hashtags.map((h) => (
            <View key={h} style={styles.hashChip}>
              <Text style={styles.hashText}>#{h}</Text>
            </View>
          ))}
        </View>
      </View>

      <BannerAdWidget />
    </View>
  );
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
  headerLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: '#888' },
  summaryText:  { flex: 1, color: '#333', fontSize: 11, fontStyle: 'italic' },
  section: {
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1a1a1a',
    marginBottom: 4,
  },
  sectionLabel: {
    color: '#333',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  captionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#111',
  },
  capText: { flex: 1, color: '#ddd', fontSize: 13, lineHeight: 30 },
  textMM: {
    fontFamily: 'Padauk',
    lineHeight: 28,
    includeFontPadding: true,
  },
  copyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtnDone: { backgroundColor: '#1a1a1a', borderColor: '#333' },
  hashtagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  hashChip: {
    backgroundColor: '#111',
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1e1e1e',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hashText: { color: '#555', fontSize: 12 },
});