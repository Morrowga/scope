import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { setOnboardingDone } from '../src/services/storageService';
import { LanguageSelector } from '../src/components/common/LanguageSelector';
import { useLanguageStore } from '../src/store/languageStore';
import { getLanguageByCode } from '../src/constants/languages';

const { width } = Dimensions.get('window');

interface Slide {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    key: '1',
    icon: 'scan-outline',
    title: 'Point at anything',
    subtitle: 'Aim your camera at any object, plant, animal, or food.',
  },
  {
    key: '2',
    icon: 'sparkles-outline',
    title: 'Get instant answers',
    subtitle: 'AI identifies it and shows a clean, structured breakdown.',
  },
  {
    key: '3',
    icon: 'language-outline',
    title: 'Choose your language',
    subtitle: 'Results are delivered in the language you prefer.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const { selectedLanguage } = useLanguageStore();
  const lang = getLanguageByCode(selectedLanguage);

  const finish = async () => {
    await setOnboardingDone();
    router.replace('/home');
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      finish();
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      {/* Icon container — crimson ring + dark fill */}
      <View style={styles.iconOuter}>
        <View style={styles.iconInner}>
          <Ionicons name={item.icon} size={52} color={Colors.accent} />
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>

      {/* Crimson accent line under title */}
      <View style={styles.titleUnderline} />

      <Text style={styles.subtitle}>{item.subtitle}</Text>

      {item.key === '3' && (
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLangOpen(true)}
        >
          <Text style={styles.langFlag}>{lang.flag}</Text>
          <Text style={styles.langName}>{lang.name}</Text>
          <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* App name top left */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>Scope</Text>
        <TouchableOpacity style={styles.skip} onPress={finish} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity style={styles.nextBtn} onPress={next} activeOpacity={0.85}>
          <Text style={styles.nextText}>
            {index === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={index === SLIDES.length - 1 ? 'checkmark' : 'arrow-forward'}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <LanguageSelector visible={langOpen} onClose={() => setLangOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  appName: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  skip: {},
  skipText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  iconOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: Colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  iconInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: Colors.accentSubtle,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  titleUnderline: {
    width: 32,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    marginTop: 12,
    marginBottom: 16,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 32,
    backgroundColor: Colors.card,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  langFlag: { fontSize: 22 },
  langName: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  footer: {
    paddingHorizontal: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.cardElevated,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    width: 24,
  },
  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.accentDark,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});