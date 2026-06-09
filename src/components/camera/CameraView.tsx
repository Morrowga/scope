import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  CameraView as ExpoCameraView,
  CameraType,
  FlashMode,
} from 'expo-camera';

interface Props {
  facing?: CameraType;
  flash?: FlashMode;
  children?: React.ReactNode;
}

/**
 * Thin wrapper around expo-camera's CameraView (SDK 51 API). Forwards a ref so
 * the parent screen can call takePictureAsync, and renders overlay children.
 */
export const ScanCamera = forwardRef<ExpoCameraView, Props>(
  ({ facing = 'back', flash = 'off', children }, ref) => (
    <View style={styles.fill}>
      <ExpoCameraView
        ref={ref}
        style={styles.fill}
        facing={facing}
        flash={flash}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        {children}
      </View>
    </View>
  )
);

ScanCamera.displayName = 'ScanCamera';

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject },
});
