import { create } from 'zustand';
import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

// ── Replace these with real keys from RevenueCat dashboard ──
const REVENUECAT_IOS_KEY     = 'test_gpwaqUskXpiLHuGhAsdVhQbNlGv';
const REVENUECAT_ANDROID_KEY = 'goog_XXXXXXXXXXXXXXXXXXXXXXXXXX';

// ── Replace with real product IDs from App Store / Play Store ──
export const PRODUCT_IDS = {
  sea:    'scope_premium_monthly_sea',    // $2.99 — SEA region
  global: 'scope_premium_monthly_global', // $8.99 — EU/US/AU
};

const ENTITLEMENT_ID = 'Scope Pro';

interface PremiumStore {
  isPremium: boolean;
  isLoading: boolean;
  packages: PurchasesPackage[];

  configure: () => Promise<void>;
  checkEntitlement: () => Promise<void>;
  fetchPackages: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

export const usePremiumStore = create<PremiumStore>((set, get) => ({
  isPremium: false,
  isLoading: false,
  packages: [],

  configure: async () => {
    try {
      Purchases.setLogLevel(LOG_LEVEL.ERROR);
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
      await Purchases.configure({ apiKey });
      await get().checkEntitlement();
    } catch (e) {
      console.warn('RevenueCat configure failed:', e);
    }
  },

  checkEntitlement: async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      set({ isPremium });
    } catch (e) {
      console.warn('checkEntitlement failed:', e);
      set({ isPremium: false });
    }
  },

  fetchPackages: async () => {
    try {
      set({ isLoading: true });
      const offerings = await Purchases.getOfferings();
      const pkgs = offerings.current?.availablePackages ?? [];
      set({ packages: pkgs });
    } catch (e) {
      console.warn('fetchPackages failed:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  purchasePackage: async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      set({ isLoading: true });
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      console.log('customerInfo:', JSON.stringify(customerInfo.entitlements.active)); // add this
      const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      console.log('isPremium:', isPremium); // add this
      set({ isPremium });
      return isPremium;
    } catch (e: any) {
      if (e?.userCancelled) return false;
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  restorePurchases: async (): Promise<boolean> => {
    try {
      set({ isLoading: true });
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      set({ isPremium });
      return isPremium;
    } catch (e) {
      console.warn('restorePurchases failed:', e);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));