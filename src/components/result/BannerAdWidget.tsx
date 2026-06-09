import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

/**
 * Banner ad placeholder.
 *
 * The original spec used `expo-ads-admob` (removed from Expo, incompatible with
 * SDK 51). Real banners require `react-native-google-mobile-ads` in a custom
 * dev build. Until that is wired up, this renders a labeled placeholder on every
 * platform (including web) so layouts stay correct and the app runs in Expo Go.
 *
 * See src/services/adService.ts for the upgrade path.
 */
export const BannerAdWidget: React.FC = () => (
  <View style={styles.banner}>
    <Text style={styles.label}>Ad</Text>
    <Text style={styles.sub}>Banner placeholder — see adService.ts</Text>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.cardElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  label: { color: Colors.textSecondary, fontWeight: '700', fontSize: 12 },
  sub: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
});
