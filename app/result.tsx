import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { useScanStore } from '../src/store/scanStore';
import { ResultCard } from '../src/components/result/ResultCard';

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentResult, currentThumbnail } = useScanStore();

  const close = () => router.back();

  const onShare = async () => {
    if (!currentResult) return;
    const lines = [
      currentResult.name,
      currentResult.type,
      currentResult.price ? `Estimated price: ${currentResult.price}` : '',
      currentResult.bad.length > 0 ? `⚠️ ${currentResult.bad.join(', ')}` : '',
      currentResult.good.length > 0 ? `✅ ${currentResult.good.join(', ')}` : '',
      'Identified with Scope',
    ].filter(Boolean);
    try {
      await Share.share({ message: lines.join('\n\n') });
    } catch {}
  };

  if (!currentResult) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No result to display.</Text>
        <TouchableOpacity style={styles.closeBtnLarge} onPress={close}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dark backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close} />

      {/* <Animated.View
        entering={FadeInUp.springify().damping(18)}
        style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
      > */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />

        {/* Thumbnail inside sheet at top */}
        {currentThumbnail && (
          <View style={styles.thumbContainer}>
            <Image
              source={{ uri: currentThumbnail }}
              style={styles.thumbImage}
              resizeMode="cover"
            />
            <View style={styles.thumbOverlay} />
            {/* Header on top of image */}
            <View style={styles.headerOnImage}>
              <TouchableOpacity onPress={close} hitSlop={12} style={styles.headerBtn}>
                <Ionicons name="chevron-down" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={2} adjustsFontSizeToFit>
                {currentResult.type ?? 'Result'}
              </Text>
              <TouchableOpacity onPress={onShare} hitSlop={12} style={styles.headerBtn}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Header without image */}
        {!currentThumbnail && (
          <View style={styles.header}>
            <TouchableOpacity onPress={close} hitSlop={12}>
              <Ionicons name="chevron-down" size={26} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={2} adjustsFontSizeToFit>
              {currentResult.type ?? 'Result'}
            </Text>
            <TouchableOpacity onPress={onShare} hitSlop={12}>
              <Ionicons name="share-outline" size={24} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <ResultCard result={currentResult} />
          <Text style={styles.savedNote}>✓ Saved to history</Text>
        </ScrollView>
      </View>
      {/* </Animated.View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
    zIndex: 10,
  },

  // Thumbnail banner inside sheet
  thumbContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    marginBottom: 4,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  headerOnImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header without image
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  savedNote: { color: Colors.safe, textAlign: 'center', fontSize: 13, marginTop: 16 },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: Colors.textSecondary, fontSize: 16 },
  closeBtnLarge: {
    marginTop: 16,
    backgroundColor: Colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeBtnText: { color: '#fff', fontWeight: '700' },
});