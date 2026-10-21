import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

export default function AccountScreen() {
  const { user, login, register, logout, isLoading, isShopkeeper } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'consumer' | 'shopkeeper'>('consumer');

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('ত্রুটি', 'অনুগ্রহ করে আপনার ইমেইল প্রদান করুন।');
      return;
    }
    try {
      if (isRegisterMode) {
        if (!fullName.trim()) {
          Alert.alert('ত্রুটি', 'আপনার পুরো নাম লিখুন।');
          return;
        }
        await register(email.trim(), fullName.trim(), phone.trim(), role);
      } else {
        await login(email.trim());
      }
    } catch (err: any) {
      Alert.alert('লগইন ব্যর্থ', err.message || 'যাচাই করা যায়নি');
    }
  };

  const handleQuickLogin = (demoRole: 'shopkeeper' | 'consumer') => {
    if (demoRole === 'shopkeeper') {
      setEmail('shopkeeper.sample@pricefinderbd.local');
    } else {
      setEmail('user.sample@pricefinderbd.local');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="আমার অ্যাকাউন্ট" subtitle="প্রোফাইল ও দোকানদার পোর্টাল" />

      <ScrollView contentContainerStyle={styles.container}>
        {user ? (
          <View>
            {/* User Profile Card */}
            <View style={styles.card}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <Text style={styles.userName}>{user.full_name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>

              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user.role === 'shopkeeper'
                    ? '🏪 নিবন্ধিত দোকানদার (Shopkeeper)'
                    : '🛒 সাধারণ ক্রেতা (Consumer)'}
                </Text>
              </View>

              {user.phone_number ? (
                <Text style={styles.phoneText}>ফোন: {user.phone_number}</Text>
              ) : null}
            </View>

            {/* Shopkeeper Dashboard Button */}
            {isShopkeeper && (
              <TouchableOpacity
                style={styles.shopkeeperBtn}
                onPress={() => router.push('/shopkeeper/manage')}
                activeOpacity={0.85}
              >
                <View style={styles.shopkeeperBtnContent}>
                  <Text style={styles.shopkeeperIcon}>📊</Text>
                  <View>
                    <Text style={styles.shopkeeperBtnTitle}>দোকানদার ড্যাশবোর্ড</Text>
                    <Text style={styles.shopkeeperBtnSubtitle}>
                      পণ্য তালিকাভুক্ত করুন, দাম ও স্টক আপডেট করুন
                    </Text>
                  </View>
                </View>
                <Text style={styles.arrowText}>→</Text>
              </TouchableOpacity>
            )}

            {/* Settings & Info Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>অ্যাপ সেটিংস ও তথ্য</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>কারেন্সি (Currency)</Text>
                <Text style={styles.infoValue}>Bangladeshi Taka (BDT ৳)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ভাষা (Language)</Text>
                <Text style={styles.infoValue}>বাংলা / English</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ভার্সন</Text>
                <Text style={styles.infoValue}>v1.0.0 (Production Ready)</Text>
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Text style={styles.logoutText}>লগআউট করুন (Log Out)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Authentication Form */
          <View style={styles.card}>
            <Text style={styles.authTitle}>
              {isRegisterMode ? 'নতুন অ্যাকাউন্ট খুলুন' : 'লগইন করুন'}
            </Text>
            <Text style={styles.authSubtitle}>
              {isRegisterMode
                ? 'দোকানদার বা ক্রেতা হিসেবে অ্যাকাউন্ট তৈরি করুন'
                : 'আপনার সংরক্ষিত তালিকা এবং মূল্য পর্যবেক্ষণ দেখতে প্রবেশ করুন'}
            </Text>

            {isRegisterMode && (
              <>
                <Text style={styles.inputLabel}>পূর্ণ নাম *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="আপনার নাম লিখুন"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <Text style={styles.inputLabel}>মোবাইল নম্বর</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+88017xxxxxxxx"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>অ্যাকাউন্টের ধরন</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[styles.roleOption, role === 'consumer' && styles.roleOptionActive]}
                    onPress={() => setRole('consumer')}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        role === 'consumer' && styles.roleOptionTextActive,
                      ]}
                    >
                      🛒 ক্রেতা (Consumer)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleOption, role === 'shopkeeper' && styles.roleOptionActive]}
                    onPress={() => setRole('shopkeeper')}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        role === 'shopkeeper' && styles.roleOptionTextActive,
                      ]}
                    >
                      🏪 দোকানদার (Shopkeeper)
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Text style={styles.inputLabel}>ইমেইল ঠিকানা *</Text>
            <TextInput
              style={styles.input}
              placeholder="example@mail.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isRegisterMode ? 'নিবন্ধন সম্পন্ন করুন' : 'প্রবেশ করুন'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeBtn}
              onPress={() => setIsRegisterMode(!isRegisterMode)}
            >
              <Text style={styles.switchModeText}>
                {isRegisterMode
                  ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন'
                  : 'অ্যাকাউন্ট নেই? নতুন অ্যাকাউন্ট তৈরি করুন'}
              </Text>
            </TouchableOpacity>

            {/* Quick Demo Logins */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>কুইক টেস্ট অ্যাক্সেস (Quick Demo Login):</Text>
              <View style={styles.demoBtnRow}>
                <TouchableOpacity
                  style={styles.demoBtn}
                  onPress={() => handleQuickLogin('shopkeeper')}
                >
                  <Text style={styles.demoBtnText}>🏪 দোকানদার টেস্ট</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoBtn}
                  onPress={() => handleQuickLogin('consumer')}
                >
                  <Text style={styles.demoBtnText}>🛒 ক্রেতা টেস্ট</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#059669',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  roleText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
  phoneText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#4B5563',
    marginTop: 8,
  },
  shopkeeperBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shopkeeperBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  shopkeeperIcon: {
    fontSize: 28,
  },
  shopkeeperBtnTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  shopkeeperBtnSubtitle: {
    color: '#A7F3D0',
    fontSize: 11,
    marginTop: 2,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  authSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  roleOption: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleOptionActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  roleOptionText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  roleOptionTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  switchModeBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchModeText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 13,
  },
  demoSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
});
