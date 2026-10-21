import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { getUserLocation, DHAKA_DEFAULT_COORDS } from '../../services/location';
import { NearbyShopResponse } from '../../types';
import { formatDistance } from '../../utils/currency';

const AREAS = ['All', 'Dhanmondi', 'Gulshan', 'Banani', 'Mirpur', 'Uttara'];

export default function NearbyScreen() {
  const [shops, setShops] = useState<NearbyShopResponse[]>([]);
  const [selectedArea, setSelectedArea] = useState('All');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userCoords, setUserCoords] = useState(DHAKA_DEFAULT_COORDS);

  const fetchNearby = async (area: string = selectedArea) => {
    setLoading(true);
    try {
      const coords = await getUserLocation();
      setUserCoords(coords);

      const thana = area === 'All' ? undefined : area;
      const data = await api.getNearbyShops(coords.latitude, coords.longitude, 15, thana);
      setShops(data);
    } catch (err: any) {
      console.warn('Nearby fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNearby(selectedArea);
  }, [selectedArea]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNearby(selectedArea);
  };

  const openNavigation = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.warn('Could not open Google Maps directions link:', err)
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="নিকটস্থ দোকানসমূহ" subtitle="নিকটবর্তী ভেরিফাইড দোকান ও দিকনির্দেশনা" />

      {/* Location Status Banner */}
      <View style={styles.locationBanner}>
        <Text style={styles.locationText}>
          📍 {userCoords.isFallback ? 'ঢাকা কেন্দ্রিক ডিফল্ট অবস্থান' : 'আপনার বর্তমান GPS অবস্থান'}
        </Text>
      </View>

      {/* Area Selector Chips */}
      <View style={styles.areaContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={AREAS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected = selectedArea === item;
            return (
              <TouchableOpacity
                style={[styles.areaChip, isSelected && styles.areaChipActive]}
                onPress={() => setSelectedArea(item)}
              >
                <Text style={[styles.areaChipText, isSelected && styles.areaChipTextActive]}>
                  {item === 'All' ? 'সকল এলাকা' : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Shop List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>নিকটস্থ দোকান খোঁজা হচ্ছে...</Text>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
          }
          renderItem={({ item }) => (
            <View style={styles.shopCard}>
              <View style={styles.shopHeader}>
                <View style={styles.shopTitleRow}>
                  <Text style={styles.shopName}>{item.shop_name}</Text>
                  {item.shop_is_verified && (
                    <View style={styles.verifiedTag}>
                      <Text style={styles.verifiedTagText}>✓ ভেরিফাইড</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.distanceBadge}>{formatDistance(item.distance_km)}</Text>
              </View>

              <Text style={styles.branchName}>শাখা: {item.branch_name}</Text>
              <Text style={styles.address}>📍 {item.address}</Text>

              {item.phone_number && (
                <Text style={styles.phone}>📞 {item.phone_number}</Text>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => openNavigation(item.google_maps_url)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.navBtnText}>🗺️ Google Maps এ ডিরেকশন দেখুন</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              title="কোনো দোকান পাওয়া যায়নি"
              description={`এই এলাকার (${selectedArea}) কাছে কোনো সক্রিয় দোকানের তথ্য নেই। অন্য এলাকা নির্বাচন করুন।`}
              actionText="সকল এলাকা দেখুন"
              onAction={() => setSelectedArea('All')}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  locationBanner: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  locationText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  areaContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  areaChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  areaChipActive: {
    backgroundColor: '#059669',
  },
  areaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  areaChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shopTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  verifiedTag: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    color: '#03543F',
    fontSize: 10,
    fontWeight: '700',
  },
  distanceBadge: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 12,
  },
  branchName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  address: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 18,
  },
  phone: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
  },
  cardActions: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  navBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  navBtnText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 13,
  },
});
