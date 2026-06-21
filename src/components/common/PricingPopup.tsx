import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ActivityIndicator, Alert, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PurchasesPackage } from 'react-native-purchases';
import { usePremiumStore } from '../../store/premiumStore';
import { Colors } from '../../constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const FEATURES = [
  { icon: 'trees',            text: 'Daily Journal — capture your moments', lib: 'foundation' },
  { icon: 'ban-outline',      text: 'No ads — completely ad-free',           lib: 'ionicons'   },
  { icon: 'infinite-outline', text: 'Unlimited scans per day',               lib: 'ionicons'   },
  { icon: 'sparkles-outline', text: 'Priority AI processing',                lib: 'ionicons'   },
];

export const PricingPopup: React.FC<Props> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { packages, fetchPackages, purchasePackage, restorePurchases } = usePremiumStore();
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoadingPackages(true);
      fetchPackages().finally(() => setLoadingPackages(false));
    }
  }, [visible]);

  useEffect(() => {
    if (packages.length > 0 && !selectedPkg) {
      setSelectedPkg(packages[0]);
    }
  }, [packages]);

  const handlePurchase = async () => {
    if (!selectedPkg || purchasing) return;
    setPurchasing(true);
    try {
      const success = await purchasePackage(selectedPkg);
      if (success) {
        Alert.alert('Welcome Hawk!', 'You now have full access to all features.', [
          { text: "Let's go!", onPress: onClose },
        ]);
      }
      // user cancelled → no message, just close spinner silently
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert('Purchase Failed', 'Something went wrong. Please try again or restore your purchases.', [
          { text: 'OK' },
        ]);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const success = await restorePurchases();
    setRestoring(false);
    if (success) {
      Alert.alert('Restored!', 'Your premium access has been restored.', [
        { text: 'OK', onPress: onClose },
      ]);
    } else {
      Alert.alert('Nothing to restore', 'No previous purchases found for this account.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>

          {/* Handle */}
          <View style={styles.handle} />

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color="#555" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Scope Premium</Text>
            <Text style={styles.subtitle}>Unlock the full experience</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresWrap}>
            {FEATURES.map((f, i) => (
              <View style={styles.featureRow} key={i}>
                <View style={styles.featureIconWrap}>
                  {f.lib === 'foundation'
                    ? <Foundation name={f.icon as any} size={16} color={Colors.accent} />
                    : <Ionicons name={f.icon as any} size={16} color={Colors.accent} />
                  }
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Packages */}
          {loadingPackages ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.loadingText}>Loading plans...</Text>
            </View>
          ) : packages.length === 0 ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.loadingText}>Plans unavailable — try again later</Text>
            </View>
          ) : (
            <View style={styles.packagesWrap}>
              {packages.map((pkg) => {
                const selected = selectedPkg?.identifier === pkg.identifier;
                const price = pkg.product.priceString;
                const title = pkg.product.title || pkg.identifier;
                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    style={[styles.packageRow, selected && styles.packageRowSelected]}
                    onPress={() => setSelectedPkg(pkg)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.packageLeft}>
                      <View style={[styles.radio, selected && styles.radioSelected]}>
                        {selected && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.packageTitle, selected && styles.packageTitleSelected]}>
                        {title}
                      </Text>
                    </View>
                    <Text style={[styles.packagePrice, selected && styles.packagePriceSelected]}>
                      {price}/mo
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Purchase button */}
          <TouchableOpacity
            style={[
              styles.purchaseBtn,
              (purchasing || !selectedPkg || loadingPackages) && styles.purchaseBtnDisabled,
            ]}
            onPress={handlePurchase}
            disabled={purchasing || !selectedPkg || loadingPackages}
            activeOpacity={0.85}
          >
            {purchasing
              ? <ActivityIndicator color="#000" />
              : <Text style={styles.purchaseBtnText}>
                  {selectedPkg
                    ? `Start Premium — ${selectedPkg.product.priceString}/mo`
                    : 'Select a plan'
                  }
                </Text>
            }
          </TouchableOpacity>

          {/* Restore */}
          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={restoring}
          >
            {restoring
              ? <ActivityIndicator color="#555" size="small" />
              : <Text style={styles.restoreText}>Restore purchases</Text>
            }
          </TouchableOpacity>

          <Text style={styles.legalText}>
            Subscription renews automatically. Cancel anytime in your account settings.
          </Text>

        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#1a1a1a',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    width: 36, height: 3, backgroundColor: '#333',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 20,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#111',
    alignItems: 'center', justifyContent: 'center',
  },

  // Header
  headerWrap: { alignItems: 'center', marginBottom: 24 },
  crownWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#110000',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.accent + '33',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#fff', fontSize: 22, fontWeight: '700',
    letterSpacing: -0.4, marginBottom: 6,
  },
  subtitle: { color: '#555', fontSize: 14 },

  // Features
  featuresWrap: { gap: 12, marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#222',
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { color: '#888', fontSize: 14, flex: 1 },

  // Loading
  loadingWrap: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  loadingText: { color: '#555', fontSize: 14 },

  // Packages
  packagesWrap: { gap: 10, marginBottom: 20 },
  packageRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16, borderRadius: 14,
    backgroundColor: '#111',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#222',
  },
  packageRowSelected: {
    borderColor: Colors.accent,
    backgroundColor: '#1a0000',
  },
  packageLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#333',
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.accent },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  packageTitle: { color: '#555', fontSize: 15, fontWeight: '500' },
  packageTitleSelected: { color: '#fff' },
  packagePrice: { color: '#555', fontSize: 15, fontWeight: '600' },
  packagePriceSelected: { color: '#fff' },

  // Purchase button
  purchaseBtn: {
    backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    marginBottom: 12,
  },
  purchaseBtnDisabled: { opacity: 0.4 },
  purchaseBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },

  // Restore
  restoreBtn: { alignItems: 'center', paddingVertical: 10, marginBottom: 8 },
  restoreText: { color: '#444', fontSize: 13 },

  // Legal
  legalText: {
    color: '#333', fontSize: 11, textAlign: 'center', lineHeight: 16,
  },
});