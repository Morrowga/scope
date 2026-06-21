import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { ScanCamera } from '../src/components/camera/CameraView';
import { Colors } from '../src/constants/colors';
import { useDeviceStore } from '../src/store/deviceStore';
import { compressImage } from '../src/utils/imageHelper';
import { pickImageFromGallery } from '../src/utils/permissionHelper';
import { saveFace } from '../src/services/faceService';

export default function FaceSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<ExpoCameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [saved, setSaved] = useState(false);
  const deviceId = useDeviceStore((s) => s.deviceId);

  // Hint animation
  const hintOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(hintOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(hintOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleCapture = useCallback(async () => {
    if (capturing) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) setPreview(photo.uri);
    } catch {
      Alert.alert('Error', 'Could not capture photo.');
    } finally {
      setCapturing(false);
    }
  }, [capturing]);

  const handleGallery = useCallback(async () => {
    const uri = await pickImageFromGallery();
    if (uri) setPreview(uri);
  }, []);

  const handleRetake = useCallback(() => {
    setPreview(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!preview || !deviceId) return;
    setLoading(true);
    try {
      const base64 = await compressImage(preview);
      await saveFace(deviceId, base64);
      setSaved(true);
    } catch {
      Alert.alert('Error', 'Could not save your photo. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [preview, deviceId]);

  // ── Success screen ──────────────────────────────────────────────────────────
  if (saved) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <Ionicons name="checkmark-circle" size={72} color="#4ade80" />
        <Text style={styles.successTitle}>You're all set!</Text>
        <Text style={styles.successDesc}>
          We'll now recognize you in your journal moments.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace('/journal-camera')}
        >
          <Text style={styles.primaryBtnText}>Go to Journal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Permission screen ───────────────────────────────────────────────────────
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <Ionicons name="camera-outline" size={56} color="#333" />
        <Text style={styles.successTitle}>Camera needed</Text>
        <Text style={styles.successDesc}>
          We need your camera to take a clear photo of your face.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Grant Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={() => router.back()}>
          <Text style={styles.skipBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main screen ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* Camera or preview — fills entire screen */}
      {preview ? (
        <View style={StyleSheet.absoluteFill}>
          <Image source={{ uri: preview }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={styles.previewDim} />
        </View>
      ) : (
        <ScanCamera ref={cameraRef} facing="front" flash="off" />
      )}

      {/* Top bar — title + back button overlaid */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set up your face</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Animated hint — fades in then out */}
      {!preview && (
        <Animated.View style={[styles.hintWrap, { opacity: hintOpacity }]}>
          <View style={styles.hintPill}>
            <Ionicons name="sunny-outline" size={13} color="#fff" />
            <Text style={styles.hintText}>Face forward in good light</Text>
          </View>
          <View style={[styles.hintPill, { marginTop: 8 }]}>
            <Ionicons name="scan-outline" size={13} color="#fff" />
            <Text style={styles.hintText}>Keep your face centered</Text>
          </View>
        </Animated.View>
      )}

      {/* Bottom card — compact */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 20 }]}>
        {!preview ? (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.galleryBtn} onPress={handleGallery}>
              <Ionicons name="images-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={handleCapture}
              disabled={capturing}
              activeOpacity={0.8}
            >
              {capturing
                ? <ActivityIndicator color="#000" />
                : <Ionicons name="camera" size={26} color="#000" />
              }
            </TouchableOpacity>
            <View style={{ width: 50 }} />
          </View>
        ) : (
          <>
            <Text style={styles.confirmTitle}>Looks good?</Text>
            <View style={styles.confirmRow}>
              <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                <Ionicons name="refresh-outline" size={18} color="#fff" />
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading
                  ? <ActivityIndicator color="#000" size="small" />
                  : <>
                      <Ionicons name="checkmark" size={18} color="#000" />
                      <Text style={styles.saveBtnText}>Use this photo</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centeredContainer: {
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40,
  },

  // Success
  successTitle: {
    color: '#fff', fontSize: 22, fontWeight: '700',
    letterSpacing: -0.4, textAlign: 'center',
    marginTop: 20, marginBottom: 12,
  },
  successDesc: {
    color: '#555', fontSize: 14, lineHeight: 22,
    textAlign: 'center', marginBottom: 32,
  },
  primaryBtn: {
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 16,
    width: '100%', alignItems: 'center',
  },
  primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  skipBtn: { marginTop: 14, paddingVertical: 10 },
  skipBtnText: { color: '#333', fontSize: 14 },

  // Preview
  previewDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  // Header
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, zIndex: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: -0.3,
  },

  // Hint overlay
  hintWrap: {
    position: 'absolute',
    top: '35%',
    left: 0, right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  hintPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  hintText: { color: '#fff', fontSize: 13, fontWeight: '500' },

  // Bottom card — compact, just enough for controls
  bottomCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#1a1a1a',
    paddingHorizontal: 24, paddingTop: 20,
  },

  // Action row
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 8,
  },
  galleryBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#222',
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtn: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },

  // Confirm
  confirmTitle: {
    color: '#fff', fontSize: 17, fontWeight: '600',
    letterSpacing: -0.3, textAlign: 'center', marginBottom: 16,
  },
  confirmRow: { flexDirection: 'row', gap: 12 },
  retakeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#222',
  },
  retakeBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  saveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 14,
    backgroundColor: '#fff',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});