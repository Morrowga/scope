// src/store/premiumStore.ts
// Toggle IS_PREMIUM to test free vs premium experience
// When RevenueCat is ready, replace IS_PREMIUM with RevenueCat check

import { create } from 'zustand';

const IS_PREMIUM = true; // change to false to test free user flow

interface PremiumStore {
  isPremium: boolean;
  setPremium: (value: boolean) => void;
}

export const usePremiumStore = create<PremiumStore>((set) => ({
  isPremium: IS_PREMIUM,
  setPremium: (value) => set({ isPremium: value }),
}));