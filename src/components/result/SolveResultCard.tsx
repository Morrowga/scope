import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannedObject } from '../../models/ScanResult';
import { useLanguageStore } from '../../store/languageStore';

interface Props {
  result: ScannedObject;
}

export const SolveResultCard: React.FC<Props> = ({ result }) => {
  const solve = result.solve_result;
  const language = useLanguageStore((s) => s.selectedLanguage);
  const isBurmese = language === 'my';
  const mm = isBurmese ? styles.mm : null;

  // Unsolvable case — show the reason
  if (!solve) {
    return (
      <View>
        <View style={styles.topicRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#555" />
          <Text style={[styles.topic, mm]}>Could not solve</Text>
        </View>
        {result.reason ? (
          <Text style={[styles.stepText, mm]}>{result.reason}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View>
      {/* Topic badge */}
      {solve.topic ? (
        <View style={styles.topicRow}>
          <Ionicons name="bulb-outline" size={13} color="#555" />
          <Text style={[styles.topic, mm]}>{solve.topic}</Text>
        </View>
      ) : null}

      {/* Answer */}
      <Text style={styles.answerLabel}>ANSWER</Text>
      <Text style={[styles.answer, isBurmese && styles.answerMM]}>{solve.answer}</Text>

      {/* Steps */}
      {solve.steps.length > 0 && (
        <View style={styles.stepsWrap}>
          <Text style={styles.stepsLabel}>STEPS</Text>
          {solve.steps.map((step, i) => (
            <View style={styles.stepRow} key={`step_${i}`}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, mm]}>{step}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  topic: { color: '#555', fontSize: 12, fontWeight: '600' },
  answerLabel: { color: '#333', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  answer: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.3,
    includeFontPadding: true,
  },
  answerMM: {
    fontFamily: 'Padauk',
    lineHeight: 38,
    letterSpacing: 0,
  },
  stepsWrap: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1a1a1a',
    gap: 12,
  },
  stepsLabel: { color: '#333', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: { color: '#888', fontSize: 11, fontWeight: '700' },
  stepText: { flex: 1, color: '#ddd', fontSize: 14, lineHeight: 20 },
  mm: {
    fontFamily: 'Padauk',
    lineHeight: 28,
    includeFontPadding: true,
  },
});