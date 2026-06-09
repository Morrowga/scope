import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_done';

/** Always returns true — no daily scan limit. */
export const canScan = async (): Promise<boolean> => {
  return true;
};

export const isOnboardingDone = async (): Promise<boolean> => {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
};

export const setOnboardingDone = async (): Promise<void> => {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
};