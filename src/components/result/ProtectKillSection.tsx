import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  protectAdvice: string | null;
  killAdvice: string | null;
}

export const ProtectKillSection: React.FC<Props> = ({ protectAdvice, killAdvice }) => {
  if (!protectAdvice && !killAdvice) return null;

  return (
    <View style={styles.wrap}>
      {protectAdvice ? (
        <View style={styles.row}>
          <Ionicons name="shield-outline" size={14} color="#888" style={styles.icon} />
          <View style={styles.content}>
            <Text style={styles.label}>PROTECT</Text>
            <Text style={styles.body}>{protectAdvice}</Text>
          </View>
        </View>
      ) : null}
      {killAdvice ? (
        <View style={styles.row}>
          <Ionicons name="cut-outline" size={14} color="#888" style={styles.icon} />
          <View style={styles.content}>
            <Text style={styles.label}>REMOVE</Text>
            <Text style={styles.body}>{killAdvice}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#222',
    gap: 14,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  icon: { marginTop: 2 },
  content: { flex: 1 },
  label: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  body: { color: '#fff', fontSize: 14, lineHeight: 20 },
});