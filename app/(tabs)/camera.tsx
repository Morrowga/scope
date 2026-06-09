import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  FlatList, Modal, Pressable, Image, Switch,
} from 'react-native';
import { Colors } from '../../src/constants/colors';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, cancelAnimation, Easing,
} from 'react-native-reanimated';
import {
  CameraView as ExpoCameraView, FlashMode, useCameraPermissions,
} from 'expo-camera';

import { ScanCamera } from '../../src/components/camera/CameraView';
import { ScanButton } from '../../src/components/camera/ScanButton';
import { FlashToggle } from '../../src/components/camera/FlashToggle';
import { NoObjectsHint } from '../../src/components/camera/NoObjectsHint';
import { LanguageSelector } from '../../src/components/common/LanguageSelector';
import { ObjectPickerRow } from '../../src/components/common/ObjectPickerRow';
import { useScanStore } from '../../src/store/scanStore';
import { useLanguageStore } from '../../src/store/languageStore';
import { useHistoryStore } from '../../src/store/historyStore';
import { getLanguageByCode } from '../../src/constants/languages';
import { scanImage, ContentBlockedError, BurstLimitError } from '../../src/services/apiService';
import { maybeShowInterstitial } from '../../src/services/adService';
import { compressImage, makeThumbnail } from '../../src/utils/imageHelper';
import { pickImageFromGallery } from '../../src/utils/permissionHelper';
import { MultiScanResult, ScannedObject, ScanMode } from '../../src/models/ScanResult';

const SCAN_MODES: { key: ScanMode; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'multi',        label: 'Normal',      desc: 'Identify all objects',        icon: 'scan-outline' },
  { key: 'single',       label: 'Focus',       desc: 'Single prominent object',     icon: 'locate-outline' },
  { key: 'count',        label: 'Count',       desc: 'Count objects only',          icon: 'layers-outline' },
  { key: 'text_summary', label: 'Text',        desc: 'Summarize visible text',      icon: 'document-text-outline' },
  { key: 'scam_check',   label: 'Scam Check',  desc: 'Analyze message for scams',   icon: 'shield-checkmark-outline' },
];

const ScanOverlay: React.FC = () => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1,   { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ), -1, false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.97, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ), -1, true
    );
    return () => { cancelAnimation(opacity); cancelAnimation(scale); };
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.overlayDim} />
      <Animated.View style={[styles.bracketsContainer, animStyle]}>
        <View style={[styles.bracket, styles.tl]} />
        <View style={[styles.bracket, styles.tr]} />
        <View style={[styles.bracket, styles.bl]} />
        <View style={[styles.bracket, styles.br]} />
        <Text style={styles.scanningText}>SCANNING</Text>
      </Animated.View>
    </View>
  );
};

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<ExpoCameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<FlashMode>('off');
  const [langOpen, setLangOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('multi');
  const [scanResult, setScanResult] = useState<MultiScanResult | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const { isScanning, setIsScanning, setCurrentResult, deepScan, setDeepScan } = useScanStore();
  const { selectedLanguage } = useLanguageStore();
  const { addHistory } = useHistoryStore();
  const lang = getLanguageByCode(selectedLanguage);

  const currentMode = SCAN_MODES.find(m => m.key === scanMode) ?? SCAN_MODES[0];
  const [currentThumb, setCurrentThumb] = useState<string | null>(null);

  const runScan = async (uri: string) => {
    setFrozenFrame(uri);
    setIsScanning(true);
    try {
      const base64 = await compressImage(uri);
      const result = await scanImage(base64, selectedLanguage, scanMode, deepScan);
  
      let thumb: string | null = null;
      try { thumb = await makeThumbnail(uri); } catch { thumb = null; }
  
      setCurrentThumb(thumb);
  
      const firstObj = result.objects[0];
      if (firstObj) {
        await addHistory({
          id: result.scan_id,
          previewName: firstObj.name,
          previewCategory: firstObj.category,
          objectCount: result.objects.length,
          thumbnailUri: thumb,
          scannedAt: new Date().toISOString(),
          result,
        });
      }
  
      // single object or special modes — go straight to result
      if (result.objects.length === 1 || scanMode === 'single' || scanMode === 'count' || scanMode === 'text_summary' || scanMode === 'scam_check') {
        setFrozenFrame(null);
        setCurrentResult(result.objects[0], thumb); // ONE call — always with thumb
        router.push('/result');
        await maybeShowInterstitial();
        return;
      }
  
      // multi mode — show picker
      setScanResult(result);
      setPickerVisible(true);
  
    } catch (e) {
      setFrozenFrame(null);
      if (e instanceof ContentBlockedError) {
        Alert.alert('Not allowed', "We know what you're trying to do. We don't allow that here.", [{ text: 'OK' }]);
        return;
      }
      if (e instanceof BurstLimitError) {
        Alert.alert('Slow down', `Too many requests. Please wait ${e.retryAfter} seconds.`, [{ text: 'OK' }]);
        return;
      }
      Alert.alert('Error', 'Could not scan. Please check your connection and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectObject = async (obj: ScannedObject) => {
    setPickerVisible(false);
    setFrozenFrame(null);
    setCurrentResult(obj, currentThumb); // pass thumb here
    router.push('/result');
    await maybeShowInterstitial();
  };

  const handleDismissPicker = () => {
    setPickerVisible(false);
    setFrozenFrame(null);
  };

  const handleScan = async () => {
    if (isScanning) return;
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) return;
      await runScan(photo.uri);
    } catch {
      Alert.alert('Error', 'Could not capture a photo.');
    }
  };

  const handleGallery = async () => {
    if (isScanning) return;
    const uri = await pickImageFromGallery();
    if (!uri) return;
    await runScan(uri);
  };

  if (!permission) return <View style={styles.permissionContainer} />;

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { paddingTop: insets.top }]}>
        <Ionicons name="camera-outline" size={64} color="#333" />
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          Scope uses your camera to identify objects.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {frozenFrame ? (
        <>
          <Image source={{ uri: frozenFrame }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          {isScanning && <ScanOverlay />}
        </>
      ) : (
        <ScanCamera ref={cameraRef} facing="back" flash={flash}>
          {/* Top bar */}
            <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
              <View style={styles.nameRow}>
                <View style={styles.headerLogoWrap}>
                  <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.headerLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.appName}>Scope</Text>
              </View>
            {/* <Text style={styles.appName}>Scope</Text> */}
            <View style={styles.topRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setLangOpen(true)}>
                <Text style={styles.flag}>{lang.flag}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setSettingsOpen(true)}>
                <Ionicons name="settings-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/history')}>
                <Ionicons name="time-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* {!isScanning && <NoObjectsHint />} */}

          {/* Mode indicator pill */}
          <View style={styles.modePill}>
            <Ionicons name={currentMode.icon} size={12} color="#888" />
            <Text style={styles.modePillText}>{currentMode.label}</Text>
          </View>

          {/* Bottom controls */}
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity style={styles.sideBtn} onPress={handleGallery}>
              <Ionicons name="images-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <ScanButton onPress={handleScan} isScanning={isScanning} />
            <View style={styles.sideBtn}>
              <FlashToggle
                enabled={flash === 'on'}
                onToggle={() => setFlash((f) => (f === 'on' ? 'off' : 'on'))}
              />
            </View>
          </View>
        </ScanCamera>
      )}

      <LanguageSelector visible={langOpen} onClose={() => setLangOpen(false)} />

      {/* Settings modal */}
      <Modal visible={settingsOpen} transparent animationType="slide" onRequestClose={() => setSettingsOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSettingsOpen(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Scan mode</Text>
            <Text style={styles.sheetSubtitle}>Choose how objects are identified</Text>

            {SCAN_MODES.map((mode) => {
              const active = scanMode === mode.key;
              return (
                <TouchableOpacity
                  key={mode.key}
                  style={[styles.modeRow, active && styles.modeRowActive]}
                  onPress={() => { setScanMode(mode.key); setSettingsOpen(false); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.modeIconWrap, active && styles.modeIconWrapActive]}>
                    <Ionicons name={mode.icon} size={18} color={active ? '#fff' : '#555'} />
                  </View>
                  <View style={styles.modeInfo}>
                    <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{mode.label}</Text>
                    <Text style={styles.modeDesc}>{mode.desc}</Text>
                  </View>
                  {active && <Ionicons name="checkmark" size={16} color={Colors.accent} />}
                </TouchableOpacity>
              );
            })}

            {/* Deep scan toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleIconWrap}>
                <Ionicons name="layers-outline" size={18} color="#555" />
              </View>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Deep scan</Text>
                <Text style={styles.toggleDesc}>Detect all objects including background</Text>
              </View>
              <Switch
                value={deepScan}
                onValueChange={(v) => setDeepScan(v)}
                trackColor={{ false: Colors.border, true: Colors.accentDark }}
                thumbColor={deepScan ? Colors.accent : '#555'}
                ios_backgroundColor="#1a1a1a"
              />
            </View>

          </Pressable>
        </Pressable>
      </Modal>

      {/* Object picker */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={handleDismissPicker}>
        <Pressable style={styles.modalOverlay} onPress={handleDismissPicker}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{scanResult?.objects.length ?? 0} Objects found</Text>
            <Text style={styles.sheetSubtitle}>Select one to view details</Text>
            <FlatList
              data={scanResult?.objects ?? []}
              keyExtractor={(item, index) => `${item.object_id}_${index}`}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <ObjectPickerRow obj={item} onPress={handleSelectObject} />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const BRACKET_SIZE = 40;
const BRACKET_COLOR = '#C0152A';
const B = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  appName: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  flag: { fontSize: 18 },
  modePill: {
    position: 'absolute',
    top: '15%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modePillText: { color: '#888', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', paddingHorizontal: 24,
  },
  sideBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  permissionContainer: {
    flex: 1, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40,
  },
  permissionTitle: { color: '#fff', fontSize: 20, fontWeight: '600', marginTop: 24, letterSpacing: -0.3 },
  permissionText: { color: '#555', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  permissionBtn: {
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 32, paddingVertical: 14, marginTop: 32,
  },
  permissionBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#1a1a1a',
    paddingHorizontal: 20, paddingTop: 12,
  },
  handle: {
    width: 36, height: 3, backgroundColor: '#333',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { color: '#fff', fontSize: 17, fontWeight: '600', letterSpacing: -0.3, marginBottom: 4, textTransform: 'capitalize' },
  sheetSubtitle: { color: '#555', fontSize: 13, marginBottom: 20  },
  modeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#111',
  },
  modeRowActive: {},
  modeIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#222',
    alignItems: 'center', justifyContent: 'center',
  },
  modeIconWrapActive: { backgroundColor: Colors.accent, borderColor: Colors.accentDark },
  modeInfo: { flex: 1 },
  modeLabel: { color: '#555', fontSize: 15, fontWeight: '500' },
  modeLabelActive: { color: '#fff' },
  modeDesc: { color: '#333', fontSize: 12, marginTop: 2 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#1a1a1a',
  },
  toggleIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#222',
    alignItems: 'center', justifyContent: 'center',
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { color: '#fff', fontSize: 15, fontWeight: '500' },
  toggleDesc: { color: '#333', fontSize: 12, marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#1a1a1a' },
  overlayDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  bracketsContainer: {
    position: 'absolute',
    top: '20%', left: '10%', right: '10%', bottom: '20%',
    alignItems: 'center', justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogoWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accentSubtle,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  bracket: {
    position: 'absolute',
    width: BRACKET_SIZE, height: BRACKET_SIZE,
    borderColor: BRACKET_COLOR,
  },
  tl: { top: 0, left: 0, borderTopWidth: B, borderLeftWidth: B },
  tr: { top: 0, right: 0, borderTopWidth: B, borderRightWidth: B },
  bl: { bottom: 0, left: 0, borderBottomWidth: B, borderLeftWidth: B },
  br: { bottom: 0, right: 0, borderBottomWidth: B, borderRightWidth: B },
  scanningText: { color: '#C0152A', fontSize: 11, fontWeight: '700', letterSpacing: 3 },
});