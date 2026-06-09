import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  description: string;
}

export const UnknownObjectCard: React.FC<Props> = ({ description }) => (
  <View style={styles.wrap}>
    <Text style={styles.heading}>🔍 EXACT MATCH UNAVAILABLE</Text>
    <Text style={styles.sub}>Describing what is visible:</Text>
    <Text style={styles.body}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.caution,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  heading: {
    color: Colors.caution,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  sub: { color: Colors.textMuted, fontSize: 12, marginTop: 8 },
  body: { color: Colors.text, fontSize: 14, lineHeight: 20, marginTop: 4 },
});
