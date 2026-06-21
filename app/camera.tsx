import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert,
  FlatList, Modal, Pressable, Image, Switch, ActivityIndicator
} from 'react-native';
import { Colors } from '../src/constants/colors';
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

import { ScanCamera } from '../src/components/camera/CameraView';
import { ScanButton } from '../src/components/camera/ScanButton';
import { FlashToggle } from '../src/components/camera/FlashToggle';
import { LanguageSelector } from '../src/components/common/LanguageSelector';
import { ObjectPickerRow } from '../src/components/common/ObjectPickerRow';
import { SwipeableSheet } from '../src/components/common/SwipeableSheet';
import { useScanStore } from '../src/store/scanStore';
import { useLanguageStore } from '../src/store/languageStore';
import { useHistoryStore } from '../src/store/historyStore';
import { getLanguageByCode } from '../src/constants/languages';
import { scanImage, ContentBlockedError, BurstLimitError } from '../src/services/apiService';
import { maybeShowInterstitial } from '../src/services/adService';
import { compressImage, makeThumbnail } from '../src/utils/imageHelper';
import { pickImageFromGallery } from '../src/utils/permissionHelper';
import { MultiScanResult, ScannedObject, ScanMode } from '../src/models/ScanResult';

const SCAN_MODES: { key: ScanMode; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'single',       label: 'Focus',        desc: 'Single prominent object',     icon: 'locate-outline' },
  { key: 'multi',        label: 'Multi Object', desc: 'Identify all objects',        icon: 'scan-outline' },
  { key: 'count',        label: 'Count',        desc: 'Count objects only',          icon: 'layers-outline' },
  { key: 'text_summary', label: 'Text',         desc: 'Summarize visible text',      icon: 'document-text-outline' },
  { key: 'scam_check',   label: 'Scam Check',   desc: 'Analyze message for scams',   icon: 'shield-checkmark-outline' },
  { key: 'solve',        label: 'Solve',        desc: 'Solve problems & questions',  icon: 'bulb-outline' },
  { key: 'caption',      label: 'Caption',      desc: 'Generate social captions',    icon: 'chatbubble-ellipses-outline' },
  { key: 'fortune',      label: 'Fortune',      desc: 'Read your daily fortune',     icon: 'sparkles-outline' },
  { key: 'inspect',      label: 'Inspect',      desc: 'Deep identify + rarity + value', icon: 'search-outline' },
  { key: 'diagnose', label: 'Diagnose', desc: 'Assess damage & get fix steps', icon: 'construct-outline' },

];

const BRACKET_SIZE = 40;
const BRACKET_COLOR = '#C0152A';
const B = 3;

// Defined outside component — never re-created
const ScanOverlay: React.FC = React.memo(() => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  React.useEffect(() => {
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
      <Animated.View style={[styles.bracketsContainer, animStyle]}>
        <View style={[styles.bracket, styles.tl]} />
        <View style={[styles.bracket, styles.tr]} />
        <View style={[styles.bracket, styles.bl]} />
        <View style={[styles.bracket, styles.br]} />
        <ActivityIndicator size="large" color={Colors.accent} />
      </Animated.View>
    </View>
  );
});

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<ExpoCameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<FlashMode>('off');
  const [langOpen, setLangOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('single');
  const [scanResult, setScanResult] = useState<MultiScanResult | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const { isScanning, setIsScanning, setCurrentResult, deepScan, setDeepScan } = useScanStore();
  const { selectedLanguage } = useLanguageStore();
  const { addHistory } = useHistoryStore();
  const lang = useMemo(() => getLanguageByCode(selectedLanguage), [selectedLanguage]);
  const currentThumb = useRef<string | null>(null);

  // Memoized — avoids .find() on every render
  const currentMode = useMemo(
    () => SCAN_MODES.find(m => m.key === scanMode) ?? SCAN_MODES[0],
    [scanMode]
  );

  const SPECIAL_MODES = useMemo(() => new Set([
    'single', 'count', 'text_summary', 'scam_check', 'solve', 'caption', 'fortune'
  ]), []);

  const runScan = useCallback(async (uri: string) => {
    setFrozenFrame(uri);
    setIsScanning(true);
    try {
      const base64 = await compressImage(uri);
      const result = await scanImage(base64, selectedLanguage, scanMode, deepScan);

      let thumb: string | null = null;
      try { thumb = await makeThumbnail(uri); } catch { thumb = null; }
      currentThumb.current = thumb;

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

      if (result.objects.length === 1 || SPECIAL_MODES.has(scanMode)) {
        setFrozenFrame(null);
        setCurrentResult(result.objects[0], thumb);
        router.push('/result');
        await maybeShowInterstitial();
        return;
      }

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
  }, [selectedLanguage, scanMode, deepScan, SPECIAL_MODES, addHistory, setCurrentResult, setIsScanning, router]);

  const handleSelectObject = useCallback((obj: ScannedObject) => {
    setPickerVisible(false);
    setFrozenFrame(null);
    setCurrentResult(obj, currentThumb.current);
    router.push('/result');
    maybeShowInterstitial();
  }, [setCurrentResult, router]);

  const handleDismissPicker = useCallback(() => {
    setPickerVisible(false);
    setFrozenFrame(null);
  }, []);

  const handleScan = useCallback(async () => {
    if (isScanning) return;
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) return;
      await runScan(photo.uri);
    } catch {
      Alert.alert('Error', 'Could not capture a photo.');
    }
  }, [isScanning, runScan]);

  const handleGallery = useCallback(async () => {
    if (isScanning) return;
    const uri = await pickImageFromGallery();
    if (!uri) return;
    await runScan(uri);
  }, [isScanning, runScan]);

  const handleFlashToggle = useCallback(() => {
    setFlash(f => f === 'on' ? 'off' : 'on');
  }, []);

  const handleModeSelect = useCallback((key: ScanMode) => {
    setScanMode(key);
    setSettingsOpen(false);
  }, []);

  const renderModeItem = useCallback(({ item: mode }: { item: typeof SCAN_MODES[0] }) => {
    const active = scanMode === mode.key;
    return (
      <TouchableOpacity
        style={[styles.modeRow, active && styles.modeRowActive]}
        onPress={() => handleModeSelect(mode.key)}
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
  }, [scanMode, handleModeSelect]);

  const renderPickerItem = useCallback(({ item }: { item: ScannedObject }) => (
    <ObjectPickerRow obj={item} onPress={handleSelectObject} />
  ), [handleSelectObject]);

  const pickerSeparator = useCallback(() => <View style={styles.separator} />, []);

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
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
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

          <View style={styles.modePill}>
            <Ionicons name={currentMode.icon} size={12} color="#888" />
            <Text style={styles.modePillText}>{currentMode.label}</Text>
          </View>

          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity style={styles.sideBtn} onPress={handleGallery}>
              <Ionicons name="images-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <ScanButton onPress={handleScan} isScanning={isScanning} />
            <View style={styles.sideBtn}>
              <FlashToggle enabled={flash === 'on'} onToggle={handleFlashToggle} />
            </View>
          </View>
        </ScanCamera>
      )}

      <LanguageSelector visible={langOpen} onClose={() => setLangOpen(false)} />

      <SwipeableSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} bottomInset={insets.bottom}>
        <Text style={styles.sheetTitle}>Scan mode</Text>
        <Text style={styles.sheetSubtitle}>Choose how objects are identified</Text>
        <FlatList
          data={SCAN_MODES}
          keyExtractor={item => item.key}
          renderItem={renderModeItem}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 320 }}
        />
        {/* <View style={styles.toggleRow}>
          <View style={styles.toggleIconWrap}>
            <Ionicons name="layers-outline" size={18} color="#555" />
          </View>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Deep scan</Text>
            <Text style={styles.toggleDesc}>Detect all objects including background</Text>
          </View>
          <Switch
            value={deepScan}
            onValueChange={setDeepScan}
            trackColor={{ false: Colors.border, true: Colors.accentDark }}
            thumbColor={deepScan ? Colors.accent : '#555'}
            ios_backgroundColor="#1a1a1a"
          />
        </View> */}
      </SwipeableSheet>

      <Modal visible={pickerVisible} transparent animationType="none" onRequestClose={handleDismissPicker}>
        <Pressable style={styles.modalOverlay} onPress={handleDismissPicker}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{scanResult?.objects.length ?? 0} Objects found</Text>
            <Text style={styles.sheetSubtitle}>Select one to view details</Text>
            <FlatList
              data={scanResult?.objects ?? []}
              keyExtractor={(item, index) => `${item.object_id}_${index}`}
              scrollEnabled={false}
              renderItem={renderPickerItem}
              ItemSeparatorComponent={pickerSeparator}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  modeList: {
    maxHeight: 340,
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
  sheetSubtitle: { color: '#555', fontSize: 13, marginBottom: 20 },
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
  bracket: {
    position: 'absolute',
    width: BRACKET_SIZE, height: BRACKET_SIZE,
    borderColor: BRACKET_COLOR,
  },
  scanningIndicator: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  tl: { top: 0, left: 0, borderTopWidth: B, borderLeftWidth: B },
  tr: { top: 0, right: 0, borderTopWidth: B, borderRightWidth: B },
  bl: { bottom: 0, left: 0, borderBottomWidth: B, borderLeftWidth: B },
  br: { bottom: 0, right: 0, borderBottomWidth: B, borderRightWidth: B },
  scanningText: { color: '#C0152A', fontSize: 11, fontWeight: '700', letterSpacing: 3 },
});