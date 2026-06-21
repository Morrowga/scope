import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, Modal, Pressable,
  ActivityIndicator, Image, Animated, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { usePremiumStore } from '../../src/store/premiumStore';
import { useLanguageStore } from '../../src/store/languageStore';
import { getJournalDay, summarizeJournalDay, JournalEntry } from '../../src/services/journalService';
import { PricingPopup } from '../../src/components/common/PricingPopup';

const GOLD = '#C9A84C';
const GOLD_DIM = '#7A6030';
const GOLD_SUBTLE = 'rgba(201,168,76,0.08)';

const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const toDateString = (date: Date): string =>
  date.toISOString().split('T')[0];

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const isTooEarly = (): boolean => new Date().getHours() < 12;

// ── Typing Effect ─────────────────────────────────────────────────────────────
const useTypingEffect = (text: string) => {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!text) return;
    setDone(false);
    const timer = setTimeout(() => setDone(true), text.length * 35 + 600);
    return () => clearTimeout(timer);
  }, [text]);
  return { chars: text.split(''), done };
};

const AnimatedChar: React.FC<{ char: string; index: number }> = memo(({ char, index }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      delay: index * 35,
      useNativeDriver: true,
    }).start();
  }, []);
  return <Animated.Text style={[sumStyles.summaryText, { opacity }]}>{char}</Animated.Text>;
});

// ── Stacked Photo ─────────────────────────────────────────────────────────────
const StackedPhoto: React.FC<{ uri: string; index: number; total: number }> = memo(({ uri, index, total }) => {
  const rotation = useRef(new Animated.Value(index % 2 === 0 ? -6 + index * 2 : 6 - index * 2)).current;
  const scale = useRef(new Animated.Value(1 - index * 0.04)).current;
  const [flipped, setFlipped] = useState(false);

  const handleTap = useCallback(() => {
    const targetRot = flipped
      ? index % 2 === 0 ? -6 + index * 2 : 6 - index * 2
      : (Math.random() - 0.5) * 20;
    Animated.parallel([
      Animated.spring(rotation, { toValue: targetRot, useNativeDriver: true, bounciness: 8 }),
      Animated.spring(scale, { toValue: flipped ? 1 - index * 0.04 : 1.05, useNativeDriver: true, bounciness: 6 }),
    ]).start();
    setFlipped(f => !f);
  }, [flipped, index]);

  return (
    <Animated.View style={[photoStyles.wrap, {
      transform: [
        { rotate: rotation.interpolate({ inputRange: [-20, 20], outputRange: ['-20deg', '20deg'] }) },
        { scale },
      ],
      zIndex: total - index,
      marginLeft: index > 0 ? -45 : 0,
      marginTop: index * 4,
    }]}>
      <TouchableOpacity onPress={handleTap} activeOpacity={0.9}>
        <View style={photoStyles.card}>
          <Image source={{ uri }} style={photoStyles.image} resizeMode="cover" />
          <View style={photoStyles.cardBottom} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const photoStyles = StyleSheet.create({
  wrap: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  card: { width: 160, height: 200, borderRadius: 8, overflow: 'hidden', borderWidth: 3, borderColor: '#fff', backgroundColor: '#111' },
  image: { width: '100%', height: '100%' },
  cardBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, backgroundColor: '#fff' },
});

// ── Tree Node ─────────────────────────────────────────────────────────────────
const TreeNode: React.FC<{ entry: JournalEntry; isLast: boolean; onImagePress: (uri: string) => void }> = memo(({ entry, isLast, onImagePress }) => {
  const time = formatTime(entry.captured_at);
  const cityCountry = [entry.location?.city, entry.location?.country].filter(Boolean).join(', ');
  const address = entry.location?.address ?? '';
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleImagePress = useCallback(() => {
    if (entry.image_url) onImagePress(entry.image_url);
  }, [entry.image_url, onImagePress]);

  const handleLoad = useCallback(() => setImgLoaded(true), []);

  return (
    <View style={treeStyles.nodeWrap}>
      <View style={treeStyles.lineCol}>
        <Foundation name="trees" size={20} color={Colors.accent} />
        {!isLast && <View style={treeStyles.line} />}
      </View>
      <View style={treeStyles.card}>
        {entry.image_url ? (
          <TouchableOpacity onPress={handleImagePress} activeOpacity={0.9}>
            <View style={treeStyles.thumbWrap}>
              {!imgLoaded && <ActivityIndicator color={Colors.accent} style={StyleSheet.absoluteFill} />}
              <Image
                source={{ uri: entry.image_url }}
                style={[treeStyles.thumb, !imgLoaded && { opacity: 0 }]}
                resizeMode="cover"
                onLoad={handleLoad}
              />
              <View style={treeStyles.thumbHint}>
                <Ionicons name="expand-outline" size={12} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
        ) : null}
        <View style={treeStyles.cardBody}>
          <Text style={treeStyles.thought}>{entry.thought}</Text>
          <View style={treeStyles.metaRow}>
            <Ionicons name="time-outline" size={11} color={GOLD_DIM} />
            <Text style={treeStyles.metaText}>{time}</Text>
          </View>
          {(cityCountry || address) && (
            <View style={treeStyles.locationWrap}>
              <Foundation name="target" size={13} color={GOLD_DIM} />
              <View style={treeStyles.locationText}>
                {cityCountry ? <Text style={treeStyles.locationLine}>{cityCountry}</Text> : null}
                {address ? <Text style={treeStyles.locationAddress}>{address}</Text> : null}
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const ConfirmModal: React.FC<{ visible: boolean; tooEarly: boolean; onConfirm: () => void; onCancel: () => void }> = memo(({ visible, tooEarly, onConfirm, onCancel }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <Pressable style={confirmStyles.overlay} onPress={onCancel}>
      <Pressable style={confirmStyles.box}>
        <Foundation name="target" size={28} color={tooEarly ? GOLD : Colors.accent} />
        <Text style={confirmStyles.title}>Summarize Today?</Text>
        {tooEarly && (
          <View style={confirmStyles.warningRow}>
            <Ionicons name="time-outline" size={14} color={GOLD} />
            <Text style={confirmStyles.warningText}>
              It's still early — your day isn't over yet. You might miss some moments if you summarize now.
            </Text>
          </View>
        )}
        <Text style={confirmStyles.sub}>System will read your moments and write a personal summary of your day.</Text>
        <TouchableOpacity style={confirmStyles.confirmBtn} onPress={onConfirm} activeOpacity={0.85}>
          <Text style={confirmStyles.confirmText}>{tooEarly ? 'Summarize anyway' : 'Yes, summarize'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={confirmStyles.cancelBtn} onPress={onCancel}>
          <Text style={confirmStyles.cancelText}>Not now</Text>
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
));



// ── Summary View ──────────────────────────────────────────────────────────────
const SummaryView: React.FC<{
  summary: string;
  entries: JournalEntry[];
  dateLabel: string;
  summaryExisted: boolean;
  replayKey: number;
  onBack: () => void;
  onReplay: () => void;
}> = memo(({ summary, entries, dateLabel, summaryExisted, onBack, onReplay, replayKey }) => {
  const { chars, done } = useTypingEffect(summary);
  const images = entries.filter(e => e.image_url).map(e => e.image_url as string);

  return (
    <View style={sumStyles.wrap}>
      <View style={sumStyles.header}>
        <TouchableOpacity onPress={onBack} style={sumStyles.backBtn}>
          <Ionicons name="chevron-back" size={18} color={Colors.accent} />
          <Text style={sumStyles.backText}>Back to timeline</Text>
        </TouchableOpacity>
      </View>
      <Text style={sumStyles.dateLabel}>{dateLabel.toUpperCase()}</Text>
      <View key={replayKey} style={sumStyles.textWrap}>
        <Text style={sumStyles.summaryText}>
          {chars.map((char, i) => <AnimatedChar key={i} char={char} index={i} />)}
        </Text>
      </View>
      {done && images.length > 0 && (
        <View style={sumStyles.photosSection}>
          <Text style={sumStyles.photosLabel}>YOUR MOMENTS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={sumStyles.photosScroll}
            decelerationRate="fast"
          >
            {images.slice(0, 5).map((uri, i) => (
              <StackedPhoto key={i} uri={uri} index={i} total={Math.min(images.length, 5)} />
            ))}
          </ScrollView>
          <Text style={sumStyles.tapHint}>Tap a photo to shuffle</Text>
        </View>
      )}
      {done && (
        <>
          <View style={sumStyles.savedRow}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
            <Text style={sumStyles.savedText}>Summary saved for {dateLabel}</Text>
          </View>
          {summaryExisted && (
            <View style={sumStyles.existedNote}>
              <Ionicons name="information-circle-outline" size={13} color={Colors.textMuted} />
              <Text style={sumStyles.existedText}>You already summarized this day</Text>
            </View>
          )}
          <TouchableOpacity style={sumStyles.replayBtn} onPress={onReplay} activeOpacity={0.8}>
            <Ionicons name="play-outline" size={16} color={Colors.accent} />
            <Text style={sumStyles.replayText}>Play Again</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
});

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = memo(() => (
  <View style={styles.emptyWrap}>
    <Foundation name="trees" size={48} color={Colors.accentDark} />
    <Text style={styles.emptyTitle}>No moments yet</Text>
    <Text style={styles.emptySub}>Tap "Capture a Moment" on the home screen to start your journey</Text>
  </View>
));

// ── Journal Screen ────────────────────────────────────────────────────────────
export default function JournalScreen() {
  const [fullImage, setFullImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const [replayKey, setReplayKey] = useState(0);

  const { isPremium } = usePremiumStore();
  const { selectedLanguage } = useLanguageStore();
  const [pricingVisible, setPricingVisible] = useState(!isPremium);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryExisted, setSummaryExisted] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const canGoForward = toDateString(selectedDate) < toDateString(new Date());

  const loadEntries = useCallback(async (date: Date) => {
    setLoading(true);
    setSummary(null);
    setShowSummary(false);
    try {
      const data = await getJournalDay(toDateString(date));
      setEntries(data);
      const existingSummary = data.find((e: any) => e.summary);
      if (existingSummary?.summary) {
        setSummary(existingSummary.summary);
        setSummaryExisted(true);
      }
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isPremium) loadEntries(selectedDate);
    }, [selectedDate, isPremium, loadEntries])
  );

  const goBack = useCallback(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
    loadEntries(d);
  }, [selectedDate, loadEntries]);

  const goForward = useCallback(() => {
    if (!canGoForward) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
    loadEntries(d);
  }, [selectedDate, canGoForward, loadEntries]);

  const handleSummarize = useCallback(async () => {
    setConfirmVisible(false);
    setSummarizing(true);
    try {
      const result = await summarizeJournalDay(toDateString(selectedDate), selectedLanguage);
      setSummary(result.summary);
      setSummaryExisted(result.already_existed);
      setShowSummary(true);
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
    } catch {
      Alert.alert('Error', 'Could not summarize. Please try again.');
    } finally {
      setSummarizing(false);
    }
  }, [selectedDate, selectedLanguage]);

  const handleBackToTree = useCallback(() => {
    setShowSummary(false);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
  }, []);

  const handleReplay = useCallback(() => {
    setShowSummary(true);
    setReplayKey(k => k + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const renderEntry = useCallback(({ item, index }: { item: JournalEntry; index: number }) => (
    <TreeNode
      entry={item}
      isLast={index === entries.length - 1}
      onImagePress={setFullImage}
    />
  ), [entries.length]);

  const keyExtractor = useCallback((item: JournalEntry) => item.id, []);

  if (!isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.lockedWrap}>
          <Foundation name="trees" size={45} color={Colors.accent} />
          <Text style={styles.lockedTitle}>Daily Journal</Text>
          <Text style={styles.lockedSub}>Unlock to track your day and get personal AI summaries</Text>
          <TouchableOpacity style={styles.unlockBtn} onPress={() => setPricingVisible(true)}>
            <Text style={styles.unlockBtnText}>View Plans</Text>
          </TouchableOpacity>
        </View>
        <PricingPopup visible={pricingVisible} onClose={() => setPricingVisible(false)} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Journal</Text>
        <Text style={styles.headerSub}>Your day's journey</Text>
      </View>

      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateArrow} onPress={goBack}>
          <Ionicons name="chevron-back" size={18} color={Colors.accent} />
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <Text style={styles.scanCount}>
            {loading ? '...' : `${entries.length} moment${entries.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.dateArrow, !canGoForward && styles.dateArrowDisabled]}
          onPress={goForward}
          disabled={!canGoForward}
        >
          <Ionicons name="chevron-forward" size={18} color={canGoForward ? Colors.accent : Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 60 }} />
      ) : showSummary && summary ? (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        >
          <SummaryView
            summary={summary}
            entries={entries}
            dateLabel={formatDate(selectedDate)}
            summaryExisted={summaryExisted}
            onBack={handleBackToTree}
            onReplay={handleReplay}
            replayKey={replayKey}
          />
        </ScrollView>
      ) : entries.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={keyExtractor}
          renderItem={renderEntry}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          maxToRenderPerBatch={5}
          windowSize={8}
          initialNumToRender={6}
          ListFooterComponent={
            summary ? (
              <TouchableOpacity style={styles.replayBtnBottom} onPress={handleReplay} activeOpacity={0.8}>
                <Ionicons name="play-outline" size={16} color={Colors.accent} />
                <Text style={styles.replayBtnBottomText}>Play Summary Again</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.summarizeBtn}
                onPress={() => setConfirmVisible(true)}
                activeOpacity={0.85}
                disabled={summarizing}
              >
                {summarizing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Foundation name="target" size={18} color="#fff" />
                    <Text style={styles.summarizeBtnText}>Summarize My Day</Text>
                  </>
                )}
              </TouchableOpacity>
            )
          }
        />
      )}

      <ConfirmModal
        visible={confirmVisible}
        onConfirm={handleSummarize}
        tooEarly={isTooEarly()}
        onCancel={() => setConfirmVisible(false)}
      />

      <Modal visible={!!fullImage} transparent animationType="fade" onRequestClose={() => setFullImage(null)}>
        <Pressable style={styles.fullImageOverlay} onPress={() => setFullImage(null)}>
          <Image source={{ uri: fullImage! }} style={styles.fullImage} resizeMode="contain" />
          <TouchableOpacity style={styles.fullImageClose} onPress={() => setFullImage(null)}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </Pressable>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const treeStyles = StyleSheet.create({
  nodeWrap: { flexDirection: 'row', gap: 16, minHeight: 72 },
  lineCol: { alignItems: 'center', width: 20, paddingTop: 2 },
  line: { flex: 1, width: 1.5, backgroundColor: Colors.accentDark, marginTop: 4 },
  card: {
    flex: 1, backgroundColor: Colors.accentSubtle,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.accentBorder, marginBottom: 12, overflow: 'hidden',
  },
  thumbWrap: { width: '100%', height: 140, backgroundColor: '#111' },
  thumbHint: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: 4,
  },
  thumb: { width: '100%', height: 140 },
  cardBody: { padding: 14 },
  thought: { color: Colors.text, fontSize: 14, lineHeight: 30, letterSpacing: -0.2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  metaText: { color: GOLD_DIM, fontSize: 11 },
  locationWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, marginTop: 4 },
  locationText: { flex: 1 },
  locationLine: { color: GOLD_DIM, fontSize: 11 },
  locationAddress: { color: GOLD_DIM, fontSize: 11, opacity: 0.7 },
});

const sumStyles = StyleSheet.create({
  // photosStack: {  
  //   flexDirection: 'row', alignItems: 'flex-start',
  //   justifyContent: 'center', paddingHorizontal: 20,
  //   paddingVertical: 16, minHeight: 240,
  // },
  photosScroll: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,        
    minHeight: 240,
  },
  wrap: { paddingBottom: 8 },
  header: { marginBottom: 24 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  backText: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  dateLabel: { color: Colors.accentDark, fontSize: 10, fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginBottom: 24 },
  textWrap: { marginBottom: 20 },
  summaryText: { color: Colors.text, fontSize: 17, lineHeight: 32, letterSpacing: -0.2 },
  photosSection: { alignItems: 'center', gap: 12, marginBottom: 20 },
  photosLabel: { color: Colors.accentDark, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  photosStack: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 16, minHeight: 240 },
  tapHint: { color: Colors.textMuted, fontSize: 11 },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 6 },
  savedText: { color: Colors.accent, fontSize: 12 },
  existedNote: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 12 },
  existedText: { color: Colors.textMuted, fontSize: 11 },
  replayBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.accentBorder,
    borderRadius: 14, paddingVertical: 14, marginTop: 12, marginHorizontal: 20,
  },
  replayText: { color: Colors.accent, fontSize: 15, fontWeight: '600' },
});

const confirmStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  box: { backgroundColor: Colors.card, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border, padding: 28, alignItems: 'center', gap: 12, width: '100%' },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  sub: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  confirmBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 14, width: '100%', alignItems: 'center', marginTop: 8 },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelBtn: { paddingVertical: 10 },
  cancelText: { color: Colors.textMuted, fontSize: 14 },
  warningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(201,168,76,0.08)', borderWidth: StyleSheet.hairlineWidth, borderColor: GOLD_DIM, borderRadius: 10, padding: 12, width: '100%' },
  warningText: { color: GOLD, fontSize: 12, lineHeight: 18, flex: 1 },
});

const popStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#0a0a0a', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#1a1a1a', paddingHorizontal: 24, paddingTop: 12 },
  handle: { width: 36, height: 3, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: GOLD_SUBTLE, borderWidth: StyleSheet.hairlineWidth, borderColor: GOLD_DIM, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  iconEmoji: { fontSize: 28 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  featureText: { color: '#888', fontSize: 14 },
  pricingRow: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 16 },
  priceCard: { flex: 1, alignItems: 'center', backgroundColor: '#111', borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: '#222', paddingVertical: 16, gap: 2 },
  priceCardHighlight: { backgroundColor: GOLD_SUBTLE, borderColor: GOLD_DIM },
  priceRegion: { color: '#555', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  priceAmount: { color: '#fff', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  pricePer: { color: '#444', fontSize: 12 },
  ctaBtn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  ctaBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  dismissBtn: { alignItems: 'center', paddingVertical: 8 },
  dismissText: { color: '#444', fontSize: 14 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { color: Colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.8 },
  headerSub: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, marginBottom: 8 },
  dateArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.card, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  dateArrowDisabled: { opacity: 0.3 },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  scanCount: { color: Colors.accentDark, fontSize: 11, marginTop: 2 },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  treeWrap: { gap: 0 },
  summarizeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, marginTop: 24 },
  summarizeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  replayBtnBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: Colors.accentBorder, borderRadius: 14, paddingVertical: 14, marginTop: 24, marginHorizontal: 20 },
  replayBtnBottomText: { color: Colors.accent, fontSize: 15, fontWeight: '600' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 12 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '600' },
  emptySub: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  lockedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  lockedEmoji: { fontSize: 48, marginBottom: 8 },
  lockedTitle: { color: Colors.text, fontSize: 22, fontWeight: '700' },
  lockedSub: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  unlockBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 },
  unlockBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  fullImageOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  fullImage: { width: '100%', height: '80%' },
  fullImageClose: { position: 'absolute', top: 56, right: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});