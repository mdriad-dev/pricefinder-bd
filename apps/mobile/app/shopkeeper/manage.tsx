import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const SAMPLE_BRANCHES = [
  { id: 'branch-shwapno-dhanmondi', name: 'Shwapno - Dhanmondi 27 Branch' },
  { id: 'branch-bhai-bhai', name: 'Bhai Bhai General Store - Dhanmondi 32' },
];

const SAMPLE_VARIANTS = [
  { id: 'var-teer-5l', name: 'Teer Fortified Soyabean Oil - 5 Litre Can' },
  { id: 'var-teer-1l', name: 'Teer Fortified Soyabean Oil - 1 Litre Pet' },
  { id: 'var-ghee-400g', name: 'Aarong Dairy Pure Ghee - 400g Glass Jar' },
  { id: 'var-sam-128', name: 'Samsung Galaxy A15 - 6GB/128GB' },
];

export default function ShopkeeperManageScreen() {
  const { user, token, isShopkeeper } = useAuth();
  const [selectedBranchId, setSelectedBranchId] = useState(SAMPLE_BRANCHES[0].id);
  const [selectedVariantId, setSelectedVariantId] = useState(SAMPLE_VARIANTS[0].id);
  const [priceInput, setPriceInput] = useState('845');
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>('in_stock');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (!token) {
      Alert.alert('অনুমতি নেই', 'দয়া করে দোকানদার অ্যাকাউন্টে লগইন করুন।');
      return;
    }
    const priceNum = parseFloat(priceInput);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('ভুল ইনপুট', 'সঠিক মূল্য (BDT) লিখুন।');
      return;
    }

    setLoading(true);
    setSuccessMsg(null);
    try {
      await api.updateListing(token, selectedVariantId, selectedBranchId, priceNum, stockStatus);
      setSuccessMsg(`দাম ও স্টক সফলভাবে আপডেট হয়েছে: ৳${priceNum.toFixed(2)} (${stockStatus})`);
      Alert.alert('সফল', 'মূল্য সফলভাবে আপডেট ও নিরীক্ষণ রেকর্ডে যুক্ত করা হয়েছে।');
    } catch (err: any) {
      Alert.alert('আপডেট ব্যর্থ', err.message || 'তালিকা আপডেট করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  if (!isShopkeeper) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="অনুমতি সংরক্ষিত" subtitle="দোকানদার অ্যাকাউন্ট প্রয়োজন" />
        <View style={styles.deniedContainer}>
          <Text style={styles.deniedIcon}>🔒</Text>
          <Text style={styles.deniedTitle}>দোকানদার অ্যাক্সেস প্রয়োজন</Text>
          <Text style={styles.deniedDesc}>
            এই পাতাটি কেবল নিবন্ধিত দোকানদারদের পণ্য ও মূল্য ব্যবস্থাপনার জন্য সংরক্ষিত।
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/(tabs)/account')}
          >
            <Text style={styles.backBtnText}>অ্যাকাউন্ট পেজে যান</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="দোকানদার ড্যাশবোর্ড" subtitle="পণ্য তালিকা, মূল্য ও স্টক ব্যবস্থাপনা" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>মূল্য ও মজুদ আপডেট করুন</Text>
          <Text style={styles.cardDesc}>
            আপনার দোকানের সঠিক দাম ও মজুদের তথ্য আপডেট করুন। প্রতিটি পরিবর্তন পর্যবেক্ষণ লগ এ সংরক্ষিত থাকবে।
          </Text>

          {/* Branch Picker */}
          <Text style={styles.fieldLabel}>দোকানের শাখা নির্বাচন করুন:</Text>
          {SAMPLE_BRANCHES.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.radioItem, selectedBranchId === b.id && styles.radioItemActive]}
              onPress={() => setSelectedBranchId(b.id)}
            >
              <Text
                style={[styles.radioText, selectedBranchId === b.id && styles.radioTextActive]}
              >
                {selectedBranchId === b.id ? '🔘 ' : '⚪ '}
                {b.name}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Product Variant Picker */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>পণ্য ও নির্দিষ্ট ভ্যারিয়েন্ট:</Text>
          {SAMPLE_VARIANTS.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[styles.radioItem, selectedVariantId === v.id && styles.radioItemActive]}
              onPress={() => setSelectedVariantId(v.id)}
            >
              <Text
                style={[styles.radioText, selectedVariantId === v.id && styles.radioTextActive]}
              >
                {selectedVariantId === v.id ? '🔘 ' : '⚪ '}
                {v.name}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Price Input */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>বর্তমান খুচরা মূল্য (BDT ৳):</Text>
          <TextInput
            style={styles.input}
            value={priceInput}
            onChangeText={setPriceInput}
            keyboardType="decimal-pad"
            placeholder="মূল্য লিখুন (যেমন: 845)"
          />

          {/* Stock Status Selector */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>মজুদ অবস্থা (Stock Status):</Text>
          <View style={styles.stockOptionsRow}>
            {(['in_stock', 'low_stock', 'out_of_stock'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.stockBtn,
                  stockStatus === status && styles.stockBtnActive,
                ]}
                onPress={() => setStockStatus(status)}
              >
                <Text
                  style={[
                    styles.stockBtnText,
                    stockStatus === status && styles.stockBtnTextActive,
                  ]}
                >
                  {status === 'in_stock'
                    ? 'স্টক আছে'
                    : status === 'low_stock'
                    ? 'স্বল্প স্টক'
                    : 'স্টক নেই'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>তালিকা ও দাম আপডেট করুন</Text>
            )}
          </TouchableOpacity>

          {successMsg && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✓ {successMsg}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  radioItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#F9FAFB',
  },
  radioItemActive: {
    backgroundColor: '#ECFDF5',
  },
  radioText: {
    fontSize: 13,
    color: '#4B5563',
  },
  radioTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  stockOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stockBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stockBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  stockBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  stockBtnTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  successBox: {
    backgroundColor: '#DEF7EC',
    borderRadius: 6,
    padding: 10,
    marginTop: 14,
    alignItems: 'center',
  },
  successText: {
    color: '#03543F',
    fontWeight: '700',
    fontSize: 12,
  },
  deniedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  deniedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  deniedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  deniedDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  backBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
