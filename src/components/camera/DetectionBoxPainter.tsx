import React from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { DetectionBox } from './DetectionBox';
import { DetectedBox } from '../../models/DetectedBox';

interface Props {
  boxes: DetectedBox[];
  activeBoxId: string | null;
  isScanning: boolean;
  onTapBox: (box: DetectedBox) => void;
}

/**
 * Lays out detection boxes over its parent. Uses plain RN Views + Reanimated
 * rather than Skia so it runs in Expo Go (managed workflow). Boxes are drawn
 * with normalized coordinates scaled to the measured container size.
 */
export const DetectionBoxPainter: React.FC<Props> = ({
  boxes,
  activeBoxId,
  isScanning,
  onTapBox,
}) => {
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {size.width > 0 &&
        boxes.map((box) => (
          <DetectionBox
            key={box.boxId}
            box={box}
            containerWidth={size.width}
            containerHeight={size.height}
            isActive={activeBoxId === box.boxId}
            isScanning={isScanning && activeBoxId === box.boxId}
            anotherActive={activeBoxId !== null && activeBoxId !== box.boxId}
            onTap={onTapBox}
          />
        ))}
    </View>
  );
};
