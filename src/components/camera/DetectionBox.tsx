import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { DetectedBox, BoxCategory } from '../../models/DetectedBox';

const BOX_COLORS: Record<BoxCategory, string> = {
  person: Colors.boxPerson,
  animal: Colors.boxAnimal,
  plant: Colors.boxPlant,
  food: Colors.boxFood,
  object: Colors.boxObject,
};

interface Props {
  box: DetectedBox;
  // Pixel layout of the area the boxes are drawn over
  containerWidth: number;
  containerHeight: number;
  isActive: boolean;
  isScanning: boolean;
  anotherActive: boolean;
  onTap: (box: DetectedBox) => void;
}

export const DetectionBox: React.FC<Props> = ({
  box,
  containerWidth,
  containerHeight,
  isActive,
  isScanning,
  anotherActive,
  onTap,
}) => {
  const color = BOX_COLORS[box.category];
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!isScanning) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 900 }),
          withTiming(0.4, { duration: 900 })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(1, { duration: 150 });
    }
  }, [isScanning, pulse]);

  const borderStyle = useAnimatedStyle(() => ({
    opacity: anotherActive && !isActive ? 0.4 : pulse.value,
  }));

  const left = box.x * containerWidth;
  const top = box.y * containerHeight;
  const width = box.width * containerWidth;
  const height = box.height * containerHeight;

  return (
    <Animated.View
      style={[
        styles.container,
        borderStyle,
        { left, top, width, height, borderColor: color },
      ]}
    >
      <TouchableOpacity
        style={styles.touch}
        activeOpacity={0.8}
        onPress={() => onTap(box)}
        disabled={isScanning}
      >
        <View style={[styles.pill, { backgroundColor: color }]}>
          <Text style={styles.pillText}>
            {box.classLabel} · {Math.round(box.confidence * 100)}%
          </Text>
        </View>
        {isActive && isScanning && (
          <View style={styles.spinnerWrap}>
            <ActivityIndicator color={color} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  touch: { flex: 1 },
  pill: {
    position: 'absolute',
    top: -12,
    left: -2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pillText: { color: '#000', fontSize: 10, fontWeight: '700' },
  spinnerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
