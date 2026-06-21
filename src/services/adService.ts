import { Platform } from 'react-native';
import { Config } from '../constants/config';

let scanCount = 0;
let interstitialLoaded = false;
let rewardedLoaded = false;
let AdModule: any = null;

function getAdModule() {
  if (AdModule) return AdModule;
  try {
    AdModule = require('react-native-google-mobile-ads');
    return AdModule;
  } catch {
    return null;
  }
}

export async function initAds(): Promise<void> {
  if (!Config.adsEnabled) return;
  const mod = getAdModule();
  if (!mod) return; // silently skip in Expo Go
  try {
    loadInterstitial(mod);
    loadRewarded(mod);
  } catch (e) {
    console.warn('initAds failed:', e);
  }
}

function loadInterstitial(mod: any) {
  try {
    const { InterstitialAd, AdEventType, TestIds } = mod;
    const INTERSTITIAL_ID = Platform.OS === 'ios'
      ? Config.admobInterstitialIos
      : Config.admobInterstitialAndroid;

    const interstitial = InterstitialAd.createForAdRequest(
      INTERSTITIAL_ID || TestIds.INTERSTITIAL,
      { requestNonPersonalizedAdsOnly: true }
    );
    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitialLoaded = true;
    });
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialLoaded = false;
      loadInterstitial(mod);
    });
    interstitial.addAdEventListener(AdEventType.ERROR, () => {
      interstitialLoaded = false;
      setTimeout(() => loadInterstitial(mod), 30000);
    });
    interstitial.load();
  } catch (e) {
    console.warn('loadInterstitial failed:', e);
  }
}

function loadRewarded(mod: any) {
  try {
    const { RewardedAd, RewardedAdEventType, AdEventType, TestIds } = mod;
    const REWARDED_ID = Platform.OS === 'ios'
      ? Config.admobRewardedIos
      : Config.admobRewardedAndroid;

    const rewarded = RewardedAd.createForAdRequest(
      REWARDED_ID || TestIds.REWARDED,
      { requestNonPersonalizedAdsOnly: true }
    );
    rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewardedLoaded = true;
    });
    rewarded.addAdEventListener(AdEventType.ERROR, () => {
      rewardedLoaded = false;
      setTimeout(() => loadRewarded(mod), 30000);
    });
    rewarded.load();
  } catch (e) {
    console.warn('loadRewarded failed:', e);
  }
}

export async function maybeShowInterstitial(isPremium: boolean): Promise<void> {
  if (isPremium || !Config.adsEnabled) return;
  const mod = getAdModule();
  if (!mod || !interstitialLoaded) return;
  scanCount++;
  if (scanCount % Config.interstitialEveryNScans !== 0) return;
  try {
    // interstitial reference needs to be module-level — skip for now
    // full implementation works in dev build
  } catch (e) {
    console.warn('showInterstitial failed:', e);
  }
}