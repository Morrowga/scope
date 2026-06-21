import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { Config } from '../../constants/config';
import { BANNER_ID } from '../../services/adService';
import { usePremiumStore } from '../../store/premiumStore';

export const BannerAdWidget: React.FC = () => {
  const isPremium = usePremiumStore((s) => s.isPremium);

  // No ads for premium users or if ads disabled
  if (isPremium || !Config.adsEnabled) return null;

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={(e) => console.warn('BannerAd failed:', e)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    alignItems: 'center',
  },
});