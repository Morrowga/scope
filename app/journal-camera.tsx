import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Image, Animated, Modal, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Foundation, Ionicons } from '@expo/vector-icons';
import { CameraView as ExpoCameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { ScanCamera } from '../src/components/camera/CameraView';
import { Colors } from '../src/constants/colors';
import { compressImage } from '../src/utils/imageHelper';
import { pickImageFromGallery } from '../src/utils/permissionHelper';
import { saveJournalEntry } from '../src/services/journalService';
import { useLanguageStore } from '../src/store/languageStore';
import { getLanguageByCode } from '../src/constants/languages';
import { LanguageSelector } from '../src/components/common/LanguageSelector';
import { checkFace } from '../src/services/faceService';
import { useDeviceStore } from '../src/store/deviceStore';

export default function JournalCameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<ExpoCameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isSaving, setIsSaving] = useState(false);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [facePopoverVisible, setFacePopoverVisible] = useState(false);

  // Popover
  const [popoverVisible, setPopoverVisible] = useState(false);
  const popoverOpacity = useRef(new Animated.Value(0)).current;
  const popoverY = useRef(new Animated.Value(20)).current;

  const { selectedLanguage } = useLanguageStore();
  const lang = getLanguageByCode(selectedLanguage);
  const deviceId = useDeviceStore((s) => s.deviceId);

  // Check face on mount
  useEffect(() => {
    const check = async () => {
      try {
        if (!deviceId) return;
        const { has_face } = await checkFace(deviceId);
        if (!has_face) setFacePopoverVisible(true);
      } catch {
        // silently fail — don't block journal camera
      }
    };
    check();
  }, [deviceId]);

  const showPopover = () => {
    setPopoverVisible(true);
    Animated.parallel([
      Animated.timing(popoverOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(popoverY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    setTimeout(() => dismissPopover(), 4000);
  };

  const dismissPopover = () => {
    Animated.parallel([
      Animated.timing(popoverOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(popoverY, { toValue: 20, duration: 200, useNativeDriver: true }),
    ]).start(() => setPopoverVisible(false));
  };

  const getLocation = async (): Promise<{ country: string; city: string; address: string } | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      return {
        country: geo.country ?? '',
        city: geo.city ?? geo.subregion ?? '',
        address: [geo.street, geo.name].filter(Boolean).join(', '),
      };
    } catch {
      return null;
    }
  };

  const runCapture = async (uri: string) => {
    setFrozenFrame(uri);
    setIsSaving(true);
    try {
      const [base64, location] = await Promise.all([
        compressImage(uri),
        getLocation(),
      ]);

      await saveJournalEntry({
        imageBase64: base64,
        imageUri: uri,
        location,
        language: selectedLanguage,
      });

      showPopover();
    } catch (e: any) {
      if (e?.response?.status === 403) {
        Alert.alert(
          'Day Already Summarized',
          "You've already summarized today. Start fresh tomorrow! 🌱",
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/journal') }]
        );
        return;
      }
      Alert.alert('Error', 'Could not save to journal. Please try again.');
    } finally {
      setIsSaving(false);
      setFrozenFrame(null);
    }
  };

  const handleCapture = async () => {
    if (isSaving) return;
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) return;
      await runCapture(photo.uri);
    } catch {
      Alert.alert('Error', 'Could not capture photo.');
    }
  };

  const handleGallery = async () => {
    if (isSaving) return;
    const uri = await pickImageFromGallery();
    if (!uri) return;
    await runCapture(uri);
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.permContainer, { paddingTop: insets.top }]}>
        <Ionicons name="camera-outline" size={64} color="#333" />
        <Text style={styles.permTitle}>Camera access needed</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {frozenFrame ? (
        <>
          <Image source={{ uri: frozenFrame }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          {isSaving && (
            <View style={styles.savingOverlay}>
              <View style={styles.savingBox}>
                <Text style={styles.savingText}>Saving to journal...</Text>
              </View>
            </View>
          )}
        </>
      ) : (
        <ScanCamera ref={cameraRef} facing="back" flash={flash}>

          {/* Top bar */}
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.topTitle}>Journal Capture</Text>
            <View style={styles.topRight}>
              {/* Face setup */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push('/face-setup')}
              >
                <Ionicons name="person-circle-outline" size={20} color="#fff" />
              </TouchableOpacity>
              {/* Language selector */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setLangOpen(true)}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
              </TouchableOpacity>
              {/* Journal history */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.replace('/(tabs)/journal')}
              >
                <Foundation name="trees" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hint */}
          <View style={styles.hintPill}>
            <Ionicons name="leaf-outline" size={12} color="#888" />
            <Text style={styles.hintText}>Capture your moment</Text>
          </View>

          {/* Bottom controls */}
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
            {/* Gallery */}
            <TouchableOpacity style={styles.sideBtn} onPress={handleGallery}>
              <Ionicons name="images-outline" size={22} color="#fff" />
            </TouchableOpacity>

            {/* Shutter */}
            <TouchableOpacity
              style={[styles.shutter, isSaving && styles.shutterDisabled]}
              onPress={handleCapture}
              activeOpacity={0.8}
              disabled={isSaving}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            {/* Flash — bottom right */}
            <TouchableOpacity
              style={styles.sideBtn}
              onPress={() => setFlash(f => f === 'on' ? 'off' : 'on')}
            >
              <Ionicons
                name={flash === 'on' ? 'flash' : 'flash-off'}
                size={22}
                color={flash === 'on' ? Colors.accent : '#fff'}
              />
            </TouchableOpacity>
          </View>

        </ScanCamera>
      )}

      {/* Saved popover */}
      {popoverVisible && (
        <Animated.View
          style={[
            styles.popover,
            { bottom: insets.bottom + 100 },
            { opacity: popoverOpacity, transform: [{ translateY: popoverY }] },
          ]}
        >
          <View style={styles.popoverContent}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
            <View style={styles.popoverText}>
              <Text style={styles.popoverTitle}>Saved to your Journey</Text>
              <Text style={styles.popoverSub}>
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.popoverBtn}
              onPress={() => {
                dismissPopover();
                router.replace('/(tabs)/journal');
              }}
            >
              <Text style={styles.popoverBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Face not set up popup */}
      <Modal
        visible={facePopoverVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFacePopoverVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setFacePopoverVisible(false)}
        >
          <Pressable style={[styles.facePopup, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.facePopupIconWrap}>
              <Ionicons name="person-circle-outline" size={40} color={Colors.accent} />
            </View>
            <Text style={styles.facePopupTitle}>Set up your face</Text>
            <Text style={styles.facePopupDesc}>
              Add a photo of yourself so we can recognize you in your journal moments — to know if you're alone, with friends, or behind the camera.
            </Text>
            <TouchableOpacity
              style={styles.facePopupBtn}
              onPress={() => {
                setFacePopoverVisible(false);
                router.push('/face-setup');
              }}
            >
              <Ionicons name="camera-outline" size={16} color="#000" />
              <Text style={styles.facePopupBtnText}>Set up now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.facePopupSkip}
              onPress={() => setFacePopoverVisible(false)}
            >
              <Text style={styles.facePopupSkipText}>Maybe later</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <LanguageSelector visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: -0.3 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  flag: { fontSize: 22 },
  hintPill: {
    position: 'absolute', top: '15%', alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  hintText: { color: '#888', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', paddingHorizontal: 24,
  },
  sideBtn: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  shutter: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  shutterDisabled: { borderColor: '#333', opacity: 0.5 },
  shutterInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.accent,
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  savingBox: {
    backgroundColor: Colors.card, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 16,
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border,
  },
  savingText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  popover: { position: 'absolute', left: 16, right: 16 },
  popoverContent: {
    backgroundColor: Colors.card, borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  popoverText: { flex: 1 },
  popoverTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  popoverSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  popoverBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border,
  },
  popoverBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },

  // Face popup
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  facePopup: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#1a1a1a',
    paddingHorizontal: 24, paddingTop: 28,
    alignItems: 'center',
  },
  facePopupIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#222',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  facePopupTitle: {
    color: '#fff', fontSize: 20, fontWeight: '700',
    letterSpacing: -0.4, marginBottom: 10, textAlign: 'center',
  },
  facePopupDesc: {
    color: '#555', fontSize: 14, lineHeight: 22,
    textAlign: 'center', marginBottom: 28,
  },
  facePopupBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 32,
    width: '100%', justifyContent: 'center',
    marginBottom: 12,
  },
  facePopupBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  facePopupSkip: { paddingVertical: 12 },
  facePopupSkipText: { color: '#333', fontSize: 14 },

  // Permission
  permContainer: {
    flex: 1, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16,
  },
  permTitle: { color: '#fff', fontSize: 20, fontWeight: '600' },
  permBtn: {
    backgroundColor: Colors.accent, borderRadius: 12,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});