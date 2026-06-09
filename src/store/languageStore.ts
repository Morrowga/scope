import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageStore {
  selectedLanguage: string;
  setLanguage: (code: string) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  selectedLanguage: 'en',
  setLanguage: async (code) => {
    set({ selectedLanguage: code });
    await AsyncStorage.setItem('output_language', code);
  },
  loadLanguage: async () => {
    const saved = await AsyncStorage.getItem('output_language');
    if (saved) set({ selectedLanguage: saved });
  },
}));
