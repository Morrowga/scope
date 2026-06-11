import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannedObject } from '../../models/ScanResult';

interface Props {
  result: ScannedObject;
}

const VERDICT_CONFIG = {
  likely_scam:      { label: 'Likely Scam',      color: '#fff',  bg: '#111', icon: 'warning-outline' as const },
  suspicious:       { label: 'Suspicious',        color: '#888',  bg: '#0d0d0d', icon: 'alert-circle-outline' as const },
  likely_legitimate:{ label: 'Looks Legitimate',  color: '#555',  bg: '#0d0d0d', icon: 'checkmark-circle-outline' as const },
  unclear:          { label: 'Unclear',            color: '#444',  bg: '#0d0d0d', icon: 'help-circle-outline' as const },
};

export const ScamResultCard: React.FC<Props> = ({ result }) => {
  const scam = result.scam_result;
  if (!scam) return null;

  const cfg = VERDICT_CONFIG[scam.verdict] ?? VERDICT_CONFIG.unclear;

  return (
    <View style={styles.card}>

      {/* Verdict strip */}
      <View style={[styles.verdictStrip, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={14} color={cfg.color} />
        <Text style={[styles.verdictLabel, { color: cfg.color }]}>
          {cfg.label.toUpperCase()}
        </Text>
      </View>

      {/* Score bars */}
      <View style={styles.scoresWrap}>
        <ScoreRow
          label="Legitimate"
          value={scam.scores.legitimate}
          color="#fff"
        />
        <ScoreRow
          label="Suspicious"
          value={scam.scores.suspicious}
          color="#555"
        />
        <ScoreRow
          label="Scam"
          value={scam.scores.scam}
          color="#333"
        />
      </View>

      {/* Red flags */}
      {scam.red_flags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RED FLAGS</Text>
          {scam.red_flags.map((flag, i) => (
            <View style={styles.itemRow} key={`flag_${i}`}>
              <Ionicons name="arrow-down" size={13} color="#555" />
              <Text style={styles.itemTextMuted}>{flag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Safe signals */}
      {scam.safe_signals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SAFE SIGNALS</Text>
          {scam.safe_signals.map((signal, i) => (
            <View style={styles.itemRow} key={`signal_${i}`}>
              <Ionicons name="arrow-up" size={13} color="#fff" />
              <Text style={styles.itemText}>{signal}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Advice */}
      <View style={styles.adviceRow}>
        <Ionicons name="information-circle-outline" size={14} color="#555" />
        <Text style={styles.adviceText}>{scam.advice}</Text>
      </View>

    </View>
  );
};

// Score bar row component
const ScoreRow: React.FC<{ label: string; value: number; color: string }> = ({
  label, value, color,
}) => (
  <View style={scoreStyles.wrap}>
    <Text style={scoreStyles.label}>{label}</Text>
    <View style={scoreStyles.track}>
      <View style={[scoreStyles.fill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
    <Text style={scoreStyles.value}>{value}%</Text>
  </View>
);

const scoreStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  label: { color: '#444', fontSize: 12, width: 80 },
  track: {
    flex: 1, height: 3, backgroundColor: '#111',
    borderRadius: 2, overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
  value: { color: '#555', fontSize: 12, width: 36, textAlign: 'right' },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#1a1a1a',
  },
  verdictStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  verdictLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  scoresWrap: { marginBottom: 20 },
  section: {
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1a1a1a',
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#333',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  itemText: { flex: 1, color: '#fff', fontSize: 13, lineHeight: 18, textTransform: 'capitalize' },
  itemTextMuted: { flex: 1, color: '#555', fontSize: 13, lineHeight: 18 },
  adviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1a1a1a',
  },
  adviceText: { flex: 1, color: '#888', fontSize: 13, lineHeight: 19 },
});