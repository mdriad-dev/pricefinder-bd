import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Header } from '../../components/Header';
import { api } from '../../services/api';
import { VisionCandidateProduct } from '../../types';

export default function IdentifyScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<VisionCandidateProduct[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const pickImage = async (useCamera: boolean = false) => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        handleAnalyzeImage(uri);
      }
    } catch (err: any) {
      Alert.alert('Error', 'ছবি নির্বাচন করতে সমস্যা হয়েছে: ' + err.message);
    }
  };

  const handleAnalyzeImage = async (imageUri: string) => {
    setLoading(true);
    setCandidates([]);
    setStatusMessage(null);

    try {
      const resp = await api.identifyImage(imageUri);
      setStatusMessage(resp.message);
      if (resp.candidates && resp.candidates.length > 0) {
        setCandidates(resp.candidates);
      } else {
        setStatusMessage(
          resp.message || 'ছবি থেকে নিশ্চিতভাবে পণ্য শনাক্ত করা সম্ভব হয়নি। নাম দিয়ে খুঁজুন।'
        );
      }
    } catch (err: any) {
      setStatusMessage(
        err.message || 'AI সেবা বর্তমানে সাড়া দিচ্ছে না। অনুগ্রহ করে সাধারণ সার্চ ব্যবহার করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCandidate = (candidate: VisionCandidateProduct) => {
    if (candidate.matched_variant_id) {
      router.push({
        pathname: '/compare/[variantId]',
        params: { variantId: candidate.matched_variant_id },
      });
    } else {
      // If variant wasn't directly mapped, navigate to search with candidate title
      router.push({
        pathname: '/(tabs)',
        params: { query: `${candidate.brand || ''} ${candidate.product_name}`.trim() },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="AI পণ্য শনাক্তকরণ" subtitle="পণ্যের ছবি তুলে বা আপলোড করে শনাক্ত করুন" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Upload Action Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>পণ্যের স্পষ্ট ছবি প্রদান করুন</Text>
          <Text style={styles.cardDesc}>
            প্যাকেটের লেবেল ও ব্র্যান্ডের নাম যাতে পরিষ্কার দেখা যায় সেভাবে ছবি তুলুন।
          </Text>

          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            </View>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cameraBtn]}
              onPress={() => pickImage(true)}
              disabled={loading}
            >
              <Text style={styles.btnText}>📷 ছবি তুলুন</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.galleryBtn]}
              onPress={() => pickImage(false)}
              disabled={loading}
            >
              <Text style={styles.galleryBtnText}>🖼️ গ্যালারি থেকে নিন</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>AI ছবির মোড়ক বিশ্লেষণ করছে...</Text>
          </View>
        )}

        {/* AI Disclaimer & Suggestions */}
        {candidates.length > 0 && (
          <View style={styles.resultSection}>
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerTitle}>⚠️ ব্যবহারকারী নিশ্চিতকরণ প্রয়োজন</Text>
              <Text style={styles.disclaimerText}>
                AI সনাক্তকরণ একটি প্রাথমিক অনুমান। সঠিক পণ্য ও ভ্যারিয়েন্ট নিশ্চিত করতে নিচে নির্বাচন করুন।
              </Text>
            </View>

            <Text style={styles.candidatesHeading}>সম্ভাব্য পণ্যের তালিকা (Candidates):</Text>

            {candidates.map((c, index) => (
              <View key={index} style={styles.candidateCard}>
                <View style={styles.candidateInfo}>
                  {c.brand && <Text style={styles.candidateBrand}>{c.brand}</Text>}
                  <Text style={styles.candidateName}>{c.product_name}</Text>
                  {c.suggested_variant && (
                    <Text style={styles.candidateVariant}>সাইজ/মডেল: {c.suggested_variant}</Text>
                  )}
                  <Text style={styles.confidenceScore}>
                    নির্ভরযোগ্যতা: {Math.round(c.confidence_score * 100)}%
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => handleConfirmCandidate(c)}
                >
                  <Text style={styles.confirmBtnText}>মূল্য যাচাই করুন →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {statusMessage && !loading && candidates.length === 0 && (
          <View style={styles.statusBox}>
            <Text style={styles.statusMsg}>{statusMessage}</Text>
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  previewContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    backgroundColor: '#059669',
  },
  galleryBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  galleryBtnText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#059669',
    fontWeight: '600',
  },
  resultSection: {
    marginTop: 20,
  },
  disclaimerBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  disclaimerTitle: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 13,
  },
  disclaimerText: {
    color: '#92400E',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  candidatesHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  candidateInfo: {
    flex: 1,
    marginRight: 12,
  },
  candidateBrand: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  candidateVariant: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  confidenceScore: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  confirmBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  statusBox: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  statusMsg: {
    color: '#4B5563',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
