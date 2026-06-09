import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  estimatedPrice: string;
}

export const PriceSection: React.FC<Props> = ({ estimatedPrice }) => (
  <View style={styles.wrap}>
    <View style={styles.row}>
      <Ionicons name="pricetag-outline" size={14} color="#888" />
      <Text style={styles.label}>ESTIMATED PRICE</Text>
    </View>
    <Text style={styles.price}>{estimatedPrice}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#222',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  price: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
});