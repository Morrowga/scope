import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { isOnboardingDone } from '../src/services/storageService';

/** Splash/redirect: send first-time users to onboarding, others to home. */
export default function Index() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const done = await isOnboardingDone();
      // setTarget('/onboarding');
      setTarget(done ? '/home' : '/onboarding');
    })();
  }, []);

  if (!target) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return <Redirect href={target as any} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});