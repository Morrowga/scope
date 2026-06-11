import { create } from 'zustand';
import { ScanHistory } from '../models/ScanHistory';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HistoryStore {
  history: ScanHistory[];
  loadHistory: () => Promise<void>;
  addHistory: (item: ScanHistory) => Promise<void>;
  deleteHistory: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const STORAGE_KEY = 'scan_history_v2'; // v2 — clears old broken entries

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  history: [],
  loadHistory: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        set({ history: JSON.parse(raw) });
      } catch {
        set({ history: [] });
      }
    }
  },
  addHistory: async (item) => {
    // Dedupe by id — a cached re-scan returns the same scan_id, so remove any
    // existing entry with this id before prepending (prevents duplicate keys).
    const withoutDupe = get().history.filter((h) => h.id !== item.id);
    const updated = [item, ...withoutDupe].slice(0, 100);
    set({ history: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
  deleteHistory: async (id) => {
    const updated = get().history.filter((h) => h.id !== id);
    set({ history: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
  clearHistory: async () => {
    set({ history: [] });
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
}));