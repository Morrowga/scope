/**
 * Ad service — PLACEHOLDER IMPLEMENTATION
 * --------------------------------------------------------------------------
 * Real ads require the `react-native-google-mobile-ads` library with a custom
 * development build (does not run in Expo Go).
 *
 * TO ENABLE REAL ADS later:
 *   1. `npx expo install react-native-google-mobile-ads`
 *   2. Add the config plugin + app ids to app.json
 *   3. Create a development build: `npx expo run:android` / `run:ios` (or EAS)
 *   4. Replace the bodies below with BannerAd / InterstitialAd
 *      from react-native-google-mobile-ads.
 */
import { Platform } from 'react-native';
import { Config } from '../constants/config';

let scansSinceInterstitial = 0;

export const initAds = async (): Promise<void> => {
  // Real SDK: await mobileAds().initialize();
};

export const getBannerAdUnitId = (): string =>
  Platform.OS === 'ios' ? Config.admobBannerIos : Config.admobBannerAndroid;

/**
 * Call after every successful scan.
 * Shows an interstitial every 2 scans automatically.
 * No-op if adsEnabled is false.
 */
export const maybeShowInterstitial = async (): Promise<boolean> => {
  if (!Config.adsEnabled) return false;

  scansSinceInterstitial++;
  if (scansSinceInterstitial < Config.interstitialEveryNScans) return false;

  scansSinceInterstitial = 0;

  // Real SDK: load + show an InterstitialAd here.
  if (__DEV__) {
    console.log('[ads] interstitial shown after', Config.interstitialEveryNScans, 'scans');
  }

  return true;
};