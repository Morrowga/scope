import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

interface Props {
  onPress: () => void;
  isScanning: boolean;
}

export const ScanButton: React.FC<Props> = ({ onPress, isScanning }) => {
  const pulse = useSharedValue(1);
  const press = useSharedValue(1);

  useEffect(() => {
    if (isScanning) {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 150 });
    } else {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
    return () => cancelAnimation(pulse);
  }, [isScanning, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={isScanning}
      onPressIn={() => (press.value = withTiming(0.9, { duration: 100 }))}
      onPressOut={() => (press.value = withTiming(1, { duration: 120 }))}
      hitSlop={16}
    >
      <Animated.View style={[styles.ring, ringStyle]}>
        <Animated.View style={[styles.inner, innerStyle]}>
          {isScanning ? (
            <ActivityIndicator color={Colors.background} size="small" />
          ) : (
            <Animated.View style={styles.core} />
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const SIZE = 78;
const styles = StyleSheet.create({
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: SIZE - 16,
    height: SIZE - 16,
    borderRadius: (SIZE - 16) / 2,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: SIZE - 30,
    height: SIZE - 30,
    borderRadius: (SIZE - 30) / 2,
    backgroundColor: Colors.text,
  },
});
