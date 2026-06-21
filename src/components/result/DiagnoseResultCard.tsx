import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannedObject } from '../../models/ScanResult';
import { BannerAdWidget } from './BannerAdWidget';
import { useLanguageStore } from '../../store/languageStore';

interface Props {
  result: ScannedObject;
}

const SEVERITY_CONFIG = {
  Minor:    { label: 'MINOR',    color: '#555',    bg: '#0d0d0d', icon: 'checkmark-circle-outline' as const },
  Moderate: { label: 'MODERATE', color: '#facc15', bg: '#1a1600', icon: 'warning-outline' as const },
  Serious:  { label: 'SERIOUS',  color: '#fb923c', bg: '#1a0e00', icon: 'alert-circle-outline' as const },
  Critical: { label: 'CRITICAL', color: '#ef4444', bg: '#1a0000', icon: 'close-circle-outline' as const },
};

const URGENCY_CONFIG = {
  'Can wait': { label: 'CAN WAIT', color: '#555'    },
  'Fix soon': { label: 'FIX SOON', color: '#facc15' },
  'Fix now':  { label: 'FIX NOW',  color: '#ef4444' },
};

const DAMAGE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home:       'home-outline',
  Vehicle:    'car-outline',
  Plant:      'leaf-outline',
  Device:     'phone-portrait-outline',
  Object:     'cube-outline',
  Electrical: 'flash-outline',
};

export const DiagnoseResultCard: React.FC<Props> = ({ result }) => {
  const language = useLanguageStore((s) => s.selectedLanguage);
  const isBurmese = language === 'my';
  const mm = isBurmese ? styles.textMM : null;

  const d = result.diagnose_result;
  if (!d) return null;

  // Not diagnosable state
  if (!d.is_diagnosable) {
    const isClean =
      d.reason?.toLowerCase().includes('fine') ||
      d.reason?.toLowerCase().includes('no damage') ||
      d.reason?.toLowerCase().includes('looks good');

    return (
      <View style={styles.card}>
        <View style={styles.undiagnosableWrap}>
          <Ionicons
            name={isClean ? 'checkmark-circle-outline' : 'search-outline'}
            size={40}
            color={isClean ? '#4ade80' : '#333'}
          />
          <Text style={[styles.undiagnosableTitle, isClean && styles.undiagnosableTitleGreen]}>
            {isClean ? 'Looking Good!' : 'Cannot Assess'}
          </Text>
          <Text style={[styles.undiagnosableReason, mm]}>{d.reason}</Text>
        </View>
        {/* <BannerAdWidget /> */}
      </View>
    );
  }

  const severityCfg = SEVERITY_CONFIG[d.severity] ?? SEVERITY_CONFIG.Minor;
  const urgencyCfg  = URGENCY_CONFIG[d.urgency]   ?? URGENCY_CONFIG['Can wait'];
  const damageIcon  = DAMAGE_ICONS[d.damage_type] ?? 'construct-outline';

  return (
    <View style={styles.card}>

      {/* Severity strip */}
      <View style={[styles.severityStrip, { backgroundColor: severityCfg.bg }]}>
        <Ionicons name={severityCfg.icon} size={13} color={severityCfg.color} />
        <Text style={[styles.severityText, { color: severityCfg.color }]}>
          {severityCfg.label}
        </Text>
        <Text style={[styles.urgencyText, { color: urgencyCfg.color }]}>
          {urgencyCfg.label}
        </Text>
      </View>

      {/* Damage type + name */}
      <View style={styles.titleRow}>
        <View style={styles.damageIconWrap}>
          <Ionicons name={damageIcon} size={18} color="#555" />
        </View>
        <View style={styles.titleInfo}>
          <Text style={[styles.name, isBurmese && styles.nameMM]}>
            {d.sub_type && d.sub_type !== 'none' ? d.sub_type : result.name}
          </Text>
          <Text style={styles.damageType}>{d.damage_type}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Root cause */}
      {d.root_cause && d.root_cause !== 'none' ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ROOT CAUSE</Text>
          <View style={styles.causeRow}>
            <Ionicons name="information-circle-outline" size={14} color="#555" />
            <Text style={[styles.causeText, mm]}>{d.root_cause}</Text>
          </View>
        </View>
      ) : null}

      {/* Fix steps */}
      {d.fix_steps.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW TO FIX</Text>
          {d.fix_steps.map((step, i) => (
            <View style={styles.stepRow} key={`step_${i}`}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, mm]}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.divider} />

      {/* Cost + professional */}
      <View style={styles.metaGrid}>
        {d.cost_estimate ? (
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>EST. COST</Text>
            <Text style={styles.metaValue}>{d.cost_estimate}</Text>
          </View>
        ) : null}
        <View style={styles.metaBox}>
          <Text style={styles.metaLabel}>PROFESSIONAL</Text>
          <View style={styles.profRow}>
            <Ionicons
              name={d.professional_needed ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={d.professional_needed ? '#fb923c' : '#555'}
            />
            <Text style={[styles.profText, { color: d.professional_needed ? '#fb923c' : '#555' }]}>
              {d.professional_needed ? 'Required' : 'Not needed'}
            </Text>
          </View>
        </View>
      </View>

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

  // Not diagnosable
  undiagnosableWrap: {
    alignItems: 'center', paddingVertical: 32, gap: 12,
  },
  undiagnosableTitle: {
    color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: -0.3,
  },
  undiagnosableTitleGreen: {
    color: '#4ade80',
  },
  undiagnosableReason: {
    color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 22,
  },

  // Severity strip
  severityStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, marginBottom: 18,
  },
  severityText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, flex: 1 },
  urgencyText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  // Title
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  damageIconWrap: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#222',
    alignItems: 'center', justifyContent: 'center',
  },
  titleInfo: { flex: 1 },
  name: {
    color: '#fff', fontSize: 22, fontWeight: '700',
    letterSpacing: -0.4, textTransform: 'capitalize',
  },
  nameMM: { fontFamily: 'Padauk', lineHeight: 36, letterSpacing: 0, includeFontPadding: true },
  damageType: {
    color: '#444', fontSize: 12, marginTop: 3,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#1a1a1a', marginVertical: 18 },

  // Sections
  section: { marginBottom: 18 },
  sectionLabel: {
    color: '#333', fontSize: 10, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 12,
  },

  // Root cause
  causeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  causeText: { flex: 1, color: '#888', fontSize: 14, lineHeight: 22 },

  // Fix steps
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  stepNum: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#222',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: { color: '#555', fontSize: 11, fontWeight: '700' },
  stepText: { flex: 1, color: '#fff', fontSize: 14, lineHeight: 22 },

  // Meta grid
  metaGrid: { flexDirection: 'row', gap: 12 },
  metaBox: { flex: 1 },
  metaLabel: {
    color: '#333', fontSize: 10, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 8,
  },
  metaValue: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  profRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profText: { fontSize: 14, fontWeight: '500' },

  // Burmese
  textMM: { fontFamily: 'Padauk', lineHeight: 28, includeFontPadding: true },
});