import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, Easing, cancelAnimation,
} from 'react-native-reanimated';
import { Colors } from '../src/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Pulse animation for outer ring
  const scale1 = useSharedValue(1);
  const opacity1 = useSharedValue(0.6);
  const scale2 = useSharedValue(1);
  const opacity2 = useSharedValue(0.4);
  const scale3 = useSharedValue(1);
  const opacity3 = useSharedValue(0.2);

  useEffect(() => {
    const config = (delay: number) => ({
      duration: 2000,
      easing: Easing.out(Easing.ease),
    });

    scale1.value = withRepeat(
      withSequence(withTiming(1, { duration: 0 }), withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.ease) })),
      -1, false
    );
    opacity1.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 0 }), withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) })),
      -1, false
    );

    setTimeout(() => {
      scale2.value = withRepeat(
        withSequence(withTiming(1, { duration: 0 }), withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.ease) })),
        -1, false
      );
      opacity2.value = withRepeat(
        withSequence(withTiming(0.35, { duration: 0 }), withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) })),
        -1, false
      );
    }, 650);

    setTimeout(() => {
      scale3.value = withRepeat(
        withSequence(withTiming(1, { duration: 0 }), withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.ease) })),
        -1, false
      );
      opacity3.value = withRepeat(
        withSequence(withTiming(0.2, { duration: 0 }), withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) })),
        -1, false
      );
    }, 1300);

    return () => {
      cancelAnimation(scale1); cancelAnimation(opacity1);
      cancelAnimation(scale2); cancelAnimation(opacity2);
      cancelAnimation(scale3); cancelAnimation(opacity3);
    };
  }, []);

  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));
  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));
  const wave3Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
    opacity: opacity3.value,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>

      {/* Top — app name */}
      <View style={styles.top}>
        <Text style={styles.appName}>Scope</Text>
        <View style={styles.taglineRow}>
          <View style={styles.taglineLine} />
          <Text style={styles.tagline}>POINT · SCAN · KNOW</Text>
          <View style={styles.taglineLine} />
        </View>
      </View>

      {/* Center — scan button with waves */}
      <View style={styles.center}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/camera')}
          activeOpacity={0.85}
          style={styles.scanBtnWrap}
        >
          {/* Ripple waves */}
          <Animated.View style={[styles.wave, wave3Style]} />
          <Animated.View style={[styles.wave, wave2Style]} />
          <Animated.View style={[styles.wave, wave1Style]} />

          {/* Outer static ring */}
          <View style={styles.outerRing}>
            {/* Inner circle */}
            <View style={styles.innerCircle}>
              {/* Center dot */}
                <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.hint}>Tap to start scanning</Text>
      </View>

      {/* Bottom — history shortcut */}
      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => router.push('/(tabs)/history')}
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
        <Text style={styles.historyText}>View history</Text>
      </TouchableOpacity>

    </View>
  );
}

const CIRCLE = 130;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  top: {
    alignItems: 'center',
    marginTop: 52,
    gap: 12,
  },
  appName: {
    color: Colors.text,
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taglineLine: {
    width: 20,
    height: 1,
    backgroundColor: Colors.accentDark,
  },
  tagline: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 3,
  },
  logo: {
    width: CIRCLE * 1,
    height: CIRCLE * 1, 
 },
  center: {
    alignItems: 'center',
    gap: 28,
  },
  scanBtnWrap: {
    width: CIRCLE * 1.5,
    height: CIRCLE * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  outerRing: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 1,
    borderColor: Colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentSubtle,
  },
  innerCircle: {
    width: CIRCLE * 0.72,
    height: CIRCLE * 0.72,
    borderRadius: (CIRCLE * 0.72) / 2,
    backgroundColor: Colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  hint: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  historyText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});