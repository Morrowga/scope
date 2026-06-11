import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannedObject } from '../../models/ScanResult';
import { WhatIsItSection } from './WhatIsItSection';
import { GoodBadSection } from './GoodBadSection';
import { PriceSection } from './PriceSection';
import { ProtectKillSection } from './ProtectKillSection';
import { ScamResultCard } from './ScamResultCard';
import { SolveResultCard } from './SolveResultCard';
import { CaptionResultCard } from './CaptionResultCard';
import { FortuneResultCard } from './FortuneResultCard';
import { BannerAdWidget } from './BannerAdWidget';
import { useLanguageStore } from '../../store/languageStore';

interface Props {
  result: ScannedObject;
}

const DANGER_CONFIG = {
  dangerous: { label: 'DANGEROUS',   color: '#fff',  bg: '#111' },
  caution:   { label: 'USE CAUTION', color: '#888',  bg: '#0d0d0d' },
  safe:      { label: 'SAFE',        color: '#333',  bg: '#0d0d0d' },
};

export const ResultCard: React.FC<Props> = ({ result }) => {
  const language = useLanguageStore((s) => s.selectedLanguage);
  const isBurmese = language === 'my';
  const dangerCfg = result.danger ? DANGER_CONFIG[result.danger] : null;

  if (result.solve_result) {
    return (
      <View style={styles.card}>
        <SolveResultCard result={result} />
        <BannerAdWidget />
      </View>
    );
  }

  if (result.scam_result) {
    return <ScamResultCard result={result} />;
  }

  if (result.text_summary) {
    return (
      <View style={styles.card}>
        <View style={styles.summaryHeader}>
          <Ionicons name="document-text-outline" size={14} color="#555" />
          <Text style={styles.summaryLabel}>TEXT SUMMARY</Text>
          {result.detected_language && (
            <Text style={styles.langBadge}>{result.detected_language.toUpperCase()}</Text>
          )}
        </View>
        <Text style={[styles.summaryText, isBurmese && styles.summaryTextMM]}>
          {result.text_summary}
        </Text>
        <BannerAdWidget />
      </View>
    );
  }

  if (result.caption_result) {
    return <CaptionResultCard result={result} />;
  }

  if (result.fortune_result) {
    return <FortuneResultCard result={result} />;
  }

  // Count mode — name + count only, no bad/good/price
  if (result.bad.length === 0 && result.good.length === 0 && !result.price && result.count >= 1) {
    return (
      <View style={styles.card}>
        <View style={styles.countRow}>
          <Text style={styles.countName}>{result.name}</Text>
          <Text style={styles.countNum}>×{result.count}</Text>
        </View>
        <Text style={styles.countCategory}>{result.type || result.category}</Text>
        <BannerAdWidget />
      </View>
    );
  }

  // Normal result
  return (
    <View style={styles.card}>
      {dangerCfg && (
        <View style={[styles.dangerStrip, { backgroundColor: dangerCfg.bg }]}>
          <Ionicons
            name={result.danger === 'dangerous' ? 'warning-outline' : 'information-circle-outline'}
            size={13}
            color={dangerCfg.color}
          />
          <Text style={[styles.dangerText, { color: dangerCfg.color }]}>
            {dangerCfg.label}
          </Text>
        </View>
      )}

      <WhatIsItSection result={result} />
      <GoodBadSection goodPoints={result.good} badPoints={result.bad} />
      {result.price ? <PriceSection estimatedPrice={result.price} /> : null}
      <ProtectKillSection protectAdvice={result.protect} killAdvice={result.kill} />

      {result.profile_alerts && result.profile_alerts.length > 0 && (
        <View style={styles.alertsWrap}>
          {result.profile_alerts.map((alert, i) => (
            <View style={styles.alertRow} key={`alert_${i}`}>
              <Ionicons name="alert-circle-outline" size={14} color="#555" />
              <Text style={styles.alertText}>{alert}</Text>
            </View>
          ))}
        </View>
      )}

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
  dangerStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, marginBottom: 18,
  },
  dangerText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  summaryLabel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 1, flex: 1 },
  langBadge: {
    color: '#333', fontSize: 10, fontWeight: '700', letterSpacing: 0.8,
    backgroundColor: '#111', borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#222', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  summaryText: { color: '#fff', fontSize: 15, lineHeight: 24 },
  summaryTextMM: {
    fontFamily: 'Padauk',
    lineHeight: 32,
    includeFontPadding: true,
  },
  countRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  countName: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.5, flex: 1 },
  countNum: { color: '#333', fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  countCategory: { color: '#444', fontSize: 13, marginTop: 4 },
  alertsWrap: {
    marginTop: 20, paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#1a1a1a', gap: 10,
  },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  alertText: { flex: 1, color: '#555', fontSize: 13, lineHeight: 19 },
});