import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../src/constants/colors';
import { useLanguageStore } from '../src/store/languageStore';
import { useHistoryStore } from '../src/store/historyStore';
import { initAds } from '../src/services/adService';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const loadLanguage = useLanguageStore((s) => s.loadLanguage);
  const loadHistory = useHistoryStore((s) => s.loadHistory);
  const [fontsLoaded] = useFonts({
    Padauk: require('../assets/fonts/Padauk-Regular.ttf'),
  });

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadLanguage(), loadHistory(), initAds()]);
      } finally {
        setReady(true);
      }
    })();
  }, [loadLanguage, loadHistory]);

  useEffect(() => {
    if (ready && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready, fontsLoaded]);

  if (!ready || !fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="result"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}