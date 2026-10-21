import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { api } from '../../services/api';
import { Header } from '../../components/Header';

export default function BarcodeScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleBarcodeLookup = async (barcode: string) => {
    if (!barcode || scanned) return;
    setScanned(true);
    setLoading(true);

    try {
      const variant = await api.lookupBarcode(barcode);
      // Navigate to price comparison for this variant
      router.push({
        pathname: '/compare/[variantId]',
        params: { variantId: variant.id },
      });
    } catch (err: any) {
      Alert.alert(
        'বারকোড পাওয়া যায়নি (Not Found)',
        `বারকোড '${barcode}' আমাদের ডাটাবেজে এখনও তালিকাভুক্ত হয়নি।\nদয়া করে পণ্যের নাম দিয়ে সার্চ করুন।`,
        [{ text: 'ঠিক আছে', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      handleBarcodeLookup(manualBarcode.trim());
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.statusText}>ক্যামেরা পারমিশন যাচাই করা হচ্ছে...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="বারকোড স্ক্যানার" subtitle="ক্যামেরা ব্যবহারের অনুমতি দিন" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>ক্যামেরা ব্যবহারের অনুমতি প্রয়োজন</Text>
          <Text style={styles.permissionDesc}>
            প্যাকেজিং এর বারকোড স্ক্যান করতে PriceFinder BD কে ক্যামেরা ব্যবহারের অনুমতি দিন।
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.btnText}>অনুমতি প্রদান করুন (Grant Permission)</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>অথবা ম্যানুয়ালি বারকোড লিখুন</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.manualBox}>
            <TextInput
              style={styles.manualInput}
              placeholder="বারকোড নম্বর লিখুন (যেমন: 8941100100050)"
              placeholderTextColor="#9CA3AF"
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 10 }]}
              onPress={handleManualSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>যাচাই করুন</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="বারকোড স্ক্যানার" subtitle="পণ্যের বারকোড ক্যামেরার সামনে রাখুন" />

      <View style={styles.cameraWrapper}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
          }}
          onBarcodeScanned={scanned || loading ? undefined : (res) => handleBarcodeLookup(res.data)}
        />

        {/* Viewfinder Target Overlay */}
        <View style={styles.overlay}>
          <View style={styles.targetFrame}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            <View style={styles.laserLine} />
          </View>
          <Text style={styles.overlayHint}>
            EAN-13 / UPC বারকোড ফ্রেমের মধ্যে স্থির রাখুন
          </Text>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingOverlayText}>পণ্যের তথ্য ও মূল্য খোঁজা হচ্ছে...</Text>
          </View>
        )}
      </View>

      {/* Manual Input Footer */}
      <View style={styles.footerControls}>
        {showManualInput ? (
          <View style={styles.manualInputRow}>
            <TextInput
              style={styles.footerInput}
              placeholder="বারকোড নম্বর (যেমন 8941100100050)"
              placeholderTextColor="#9CA3AF"
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.footerBtn} onPress={handleManualSubmit}>
              <Text style={styles.footerBtnText}>খুঁজুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.toggleManualBtn}
            onPress={() => setShowManualInput(true)}
          >
            <Text style={styles.toggleManualText}>⌨️ বারকোড নম্বর হাতে লিখে খুঁজুন</Text>
          </TouchableOpacity>
        )}
        {scanned && (
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 8 }]}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.btnText}>আবার স্ক্যান করুন (Scan Again)</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  targetFrame: {
    width: 260,
    height: 180,
    borderRadius: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#10B981',
  },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
  laserLine: {
    width: '90%',
    height: 2,
    backgroundColor: '#34D399',
    opacity: 0.8,
  },
  overlayHint: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlayText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  footerControls: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  footerInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
  },
  footerBtn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  footerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toggleManualBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleManualText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    marginTop: 12,
    color: '#6B7280',
  },
  permissionContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  permissionIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  permissionDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#9CA3AF',
  },
  manualBox: {
    width: '100%',
  },
  manualInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
});
