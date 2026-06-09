import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScannedObject } from '../models/ScanResult';

interface ScanStore {
  currentResult: ScannedObject | null;
  currentThumbnail: string | null;
  setCurrentResult: (result: ScannedObject | null, thumbnail?: string | null) => void;

  isScanning: boolean;
  setIsScanning: (v: boolean) => void;

  scanCount: number;
  incrementScanCount: () => void;

  deepScan: boolean;
  setDeepScan: (v: boolean) => Promise<void>;
  loadDeepScan: () => Promise<void>;

  reset: () => void;
}

const DEEP_SCAN_KEY = 'deep_scan_enabled';

export const useScanStore = create<ScanStore>((set) => ({
  currentResult: null,
  currentThumbnail: null,
  setCurrentResult: (result, thumbnail = null) =>
    set({ currentResult: result, currentThumbnail: thumbnail }),

  isScanning: false,
  setIsScanning: (v) => set({ isScanning: v }),

  scanCount: 0,
  incrementScanCount: () => set((s) => ({ scanCount: s.scanCount + 1 })),

  deepScan: false,
  setDeepScan: async (v) => {
    set({ deepScan: v });
    await AsyncStorage.setItem(DEEP_SCAN_KEY, JSON.stringify(v));
  },
  loadDeepScan: async () => {
    const saved = await AsyncStorage.getItem(DEEP_SCAN_KEY);
    if (saved !== null) {
      set({ deepScan: JSON.parse(saved) });
    }
  },

  reset: () => set({ currentResult: null, currentThumbnail: null, isScanning: false }),
}));