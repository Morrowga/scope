import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, Easing, cancelAnimation,
} from 'react-native-reanimated';
import { Colors } from '../../src/constants/colors';

const CIRCLE = 130;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Pulse waves
  const scale1 = useSharedValue(1);
  const opacity1 = useSharedValue(0.6);
  const scale2 = useSharedValue(1);
  const opacity2 = useSharedValue(0.4);
  const scale3 = useSharedValue(1);
  const opacity3 = useSharedValue(0.2);

  useEffect(() => {
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

  const wave1Style = useAnimatedStyle(() => ({ transform: [{ scale: scale1.value }], opacity: opacity1.value }));
  const wave2Style = useAnimatedStyle(() => ({ transform: [{ scale: scale2.value }], opacity: opacity2.value }));
  const wave3Style = useAnimatedStyle(() => ({ transform: [{ scale: scale3.value }], opacity: opacity3.value }));

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

        {/* Scan button */}
        <TouchableOpacity
          onPress={() => router.push('/camera')}
          activeOpacity={0.85}
          style={styles.scanBtnWrap}
        >
          <Animated.View style={[styles.wave, wave3Style]} />
          <Animated.View style={[styles.wave, wave2Style]} />
          <Animated.View style={[styles.wave, wave1Style]} />
          <View style={styles.outerRing}>
            <View style={styles.innerCircle}>
              {!logoLoaded && (
                <ActivityIndicator
                  size="small"
                  color={Colors.accent}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Image
                source={require('../../assets/images/logo.png')}
                style={[styles.logo, !logoLoaded && { opacity: 0 }]}
                resizeMode="contain"
                onLoad={() => setLogoLoaded(true)}
              />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.hint}>Tap to start scanning</Text>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Journal button */}
        <TouchableOpacity
        style={styles.journalBtn}
        onPress={() => router.push('/journal-camera')}  // ← goes to journal camera
        activeOpacity={0.8}
        >
            <View style={styles.journalBtnInner}>
                <Ionicons name="leaf-outline" size={20} color={Colors.accent} />
                <View style={styles.journalBtnText}>
                <Text style={styles.journalBtnTitle}>Capture a Moment</Text>
                <Text style={styles.journalBtnSub}>Save to your daily journey</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </View>
        </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  top: { alignItems: 'center', marginTop: 52, gap: 12 },
  appName: { color: Colors.text, fontSize: 42, fontWeight: '700', letterSpacing: -1.5 },
  taglineRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taglineLine: { width: 20, height: 1, backgroundColor: Colors.accentDark },
  tagline: { color: Colors.textDim, fontSize: 11, fontWeight: '500', letterSpacing: 3 },
  center: { alignItems: 'center', gap: 20, width: '100%', paddingHorizontal: 32 },
  scanBtnWrap: {
    width: CIRCLE * 1.5, height: CIRCLE * 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: CIRCLE, height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 1.5, borderColor: Colors.accent,
  },
  outerRing: {
    width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2,
    borderWidth: 1, borderColor: Colors.accentDark,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.accentSubtle,
  },
  innerCircle: {
    width: CIRCLE * 0.72, height: CIRCLE * 0.72,
    borderRadius: (CIRCLE * 0.72) / 2,
    backgroundColor: Colors.accentSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  logo: { width: CIRCLE * 1, height: CIRCLE * 1 },
  hint: { color: Colors.textDim, fontSize: 12, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  dividerText: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1 },

  // Journal button
  journalBtn: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  journalBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  journalBtnText: { flex: 1 },
  journalBtnTitle: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  journalBtnSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },

  // History shortcut
  historyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 20, borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border, backgroundColor: Colors.card,
  },
  historyText: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },
});