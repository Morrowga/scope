import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

interface DeviceStore {
  deviceId: string;
  loadDeviceId: () => Promise<void>;
}

const DEVICE_ID_KEY = 'device_id';

export const useDeviceStore = create<DeviceStore>((set) => ({
  deviceId: '',

  loadDeviceId: async () => {
    try {
      let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (!id) {
        id = Crypto.randomUUID();
        await AsyncStorage.setItem(DEVICE_ID_KEY, id);
      }
      set({ deviceId: id });
    } catch {
      set({ deviceId: Crypto.randomUUID() });
    }
  },
}));