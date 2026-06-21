import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannedObject } from '../../models/ScanResult';
import { BannerAdWidget } from './BannerAdWidget';
import { useLanguageStore } from '../../store/languageStore';

interface Props {
  result: ScannedObject;
}

const RARITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'Legendary':       { label: 'LEGENDARY',       color: '#FFD700', bg: '#1a1500' },
  'Rare':            { label: 'RARE',             color: '#C084FC', bg: '#130d1a' },
  'Rare Find':       { label: 'RARE FIND',        color: '#C084FC', bg: '#130d1a' },
  'Uncommon':        { label: 'UNCOMMON',         color: '#60A5FA', bg: '#0d1220' },
  'Common':          { label: 'COMMON',           color: '#555',    bg: '#0d0d0d' },
  'Limited Edition': { label: 'LIMITED EDITION',  color: '#FB923C', bg: '#1a1000' },
  'Discontinued':    { label: 'DISCONTINUED',     color: '#888',    bg: '#111'    },
};

const CONSERVATION_CONFIG: Record<string, { label: string; color: string }> = {
  'Extinct':               { label: 'EXTINCT',               color: '#ef4444' },
  'Critically Endangered': { label: 'CRITICALLY ENDANGERED', color: '#f97316' },
  'Endangered':            { label: 'ENDANGERED',            color: '#fb923c' },
  'Vulnerable':            { label: 'VULNERABLE',            color: '#facc15' },
  'Near Threatened':       { label: 'NEAR THREATENED',       color: '#a3e635' },
  'Least Concern':         { label: 'LEAST CONCERN',         color: '#555'    },
};

const DANGER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  dangerous: { label: 'DANGEROUS',   color: '#fff', bg: '#111'    },
  caution:   { label: 'USE CAUTION', color: '#888', bg: '#0d0d0d' },
  safe:      { label: 'SAFE',        color: '#333', bg: '#0d0d0d' },
};

export const InspectResultCard: React.FC<Props> = ({ result }) => {
  const language = useLanguageStore((s) => s.selectedLanguage);
  const isBurmese = language === 'my';
  const mm = isBurmese ? styles.textMM : null;

  // Inspect-specific fields come from inspect_result
  const { rarity, conservation_status, condition, habitat, behavior } = result.inspect_result ?? {};

  // Shared fields read from result directly
  const rarityCfg       = rarity              ? RARITY_CONFIG[rarity]                       : null;
  const conservationCfg = conservation_status ? CONSERVATION_CONFIG[conservation_status]     : null;
  const dangerCfg       = result.danger       ? DANGER_CONFIG[result.danger]                 : null;
  const hasGoodBad      = (result.good?.length ?? 0) > 0 || (result.bad?.length ?? 0) > 0;

  return (
    <View style={styles.card}>

      {/* Danger strip */}
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

      {/* Name + brand + type */}
      <Text style={[styles.name, isBurmese && styles.nameMM]}>{result.name}</Text>
      {result.brand ? <Text style={[styles.brand, mm]}>{result.brand}</Text> : null}
      {result.type  ? <Text style={[styles.type,  mm]}>{result.type}</Text>  : null}

      {/* Rarity + conservation + condition badges */}
      <View style={styles.badgeRow}>
        {rarityCfg && (
          <View style={[styles.rarityBadge, { backgroundColor: rarityCfg.bg, borderColor: rarityCfg.color + '33' }]}>
            <Ionicons name="diamond-outline" size={11} color={rarityCfg.color} />
            <Text style={[styles.rarityText, { color: rarityCfg.color }]}>{rarityCfg.label}</Text>
          </View>
        )}
        {conservationCfg && (
          <View style={[styles.conservationBadge, { borderColor: conservationCfg.color + '44' }]}>
            <Ionicons name="leaf-outline" size={11} color={conservationCfg.color} />
            <Text style={[styles.conservationText, { color: conservationCfg.color }]}>
              {conservationCfg.label}
            </Text>
          </View>
        )}
        {condition && (
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{condition.toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Habitat */}
      {habitat ? (
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#555" />
          <Text style={[styles.metaText, mm]}>{habitat}</Text>
        </View>
      ) : null}

      {/* Behavior */}
      {behavior && behavior.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BEHAVIOR</Text>
          {behavior.slice(0, 3).map((b, i) => (
            <View style={styles.bulletRow} key={`beh_${i}`}>
              <View style={styles.bullet} />
              <Text style={[styles.bulletText, mm]}>{b}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Good / bad traits */}
      {hasGoodBad && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRAITS</Text>
          {(result.good ?? []).slice(0, 3).map((point, i) => (
            <View style={styles.traitRow} key={`good_${i}`}>
              <Ionicons name="arrow-up" size={14} color="#fff" style={styles.traitIcon} />
              <Text style={[styles.traitText, mm]}>{point}</Text>
            </View>
          ))}
          {(result.bad ?? []).slice(0, 3).map((point, i) => (
            <View style={styles.traitRow} key={`bad_${i}`}>
              <Ionicons name="arrow-down" size={14} color="#555" style={styles.traitIcon} />
              <Text style={[styles.traitText, styles.traitMuted, mm]}>{point}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Price */}
      {result.price ? (
        <>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>EST. VALUE</Text>
            <Text style={styles.priceValue}>{result.price}</Text>
          </View>
        </>
      ) : null}

      {/* Buy at */}
      {result.buy_at ? (
        <View style={styles.metaRow}>
          <Ionicons name="storefront-outline" size={14} color="#555" />
          <Text style={[styles.metaText, mm]}>{result.buy_at}</Text>
        </View>
      ) : null}

      {/* Protect advice */}
      {result.protect ? (
        <View style={[styles.adviceRow, styles.adviceProtect]}>
          <Ionicons name="shield-outline" size={14} color="#60A5FA" />
          <Text style={[styles.adviceText, styles.adviceProtectText, mm]}>{result.protect}</Text>
        </View>
      ) : null}

      {/* Kill advice */}
      {result.kill ? (
        <View style={[styles.adviceRow, styles.adviceKill]}>
          <Ionicons name="warning-outline" size={14} color="#888" />
          <Text style={[styles.adviceText, mm]}>{result.kill}</Text>
        </View>
      ) : null}

      {/* <BannerAdWidget /> */}
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

  // Danger
  dangerStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, marginBottom: 18,
  },
  dangerText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },

  // Name / brand / type
  name: {
    color: '#fff', fontSize: 26, fontWeight: '700',
    lineHeight: 34, letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  nameMM: { fontFamily: 'Padauk', lineHeight: 46, letterSpacing: 0, includeFontPadding: true },
  brand: { color: '#555', fontSize: 14, fontWeight: '500', marginTop: 6, textTransform: 'capitalize' },
  type:  { color: '#444', fontSize: 13, marginTop: 4, textTransform: 'capitalize' },

  // Badges
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  rarityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, borderWidth: StyleSheet.hairlineWidth,
  },
  rarityText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  conservationBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#0d0d0d',
  },
  conservationText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  conditionBadge: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#222', backgroundColor: '#111',
  },
  conditionText: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#1a1a1a', marginVertical: 18 },

  // Meta rows
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10 },
  metaText: { flex: 1, color: '#555', fontSize: 13, lineHeight: 20, textTransform: 'capitalize' },

  // Sections
  section: { marginTop: 18 },
  sectionLabel: {
    color: '#333', fontSize: 10, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 12,
  },

  // Behavior bullets
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  bullet: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#333', marginTop: 8,
  },
  bulletText: { flex: 1, color: '#888', fontSize: 14, lineHeight: 22 },

  // Traits
  traitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  traitIcon: { marginTop: 3 },
  traitText: { flex: 1, color: '#fff', fontSize: 14, lineHeight: 20, textTransform: 'capitalize' },
  traitMuted: { color: '#555' },

  // Price
  priceRow: {
    flexDirection: 'row', alignItems: 'baseline',
    justifyContent: 'space-between', marginBottom: 10,
  },
  priceLabel: { color: '#333', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  priceValue: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },

  // Advice
  adviceRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginTop: 12, padding: 12,
    borderRadius: 8, borderWidth: StyleSheet.hairlineWidth,
  },
  adviceProtect: { backgroundColor: '#0d1220', borderColor: '#1a2a40' },
  adviceKill:    { backgroundColor: '#111',    borderColor: '#222'    },
  adviceText: { flex: 1, color: '#555', fontSize: 13, lineHeight: 20 },
  adviceProtectText: { color: '#60A5FA' },

  // Burmese
  textMM: { fontFamily: 'Padauk', lineHeight: 28, includeFontPadding: true },
});