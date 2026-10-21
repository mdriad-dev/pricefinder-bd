import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Switch,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../services/api';
import { getUserLocation } from '../../services/location';
import { PriceComparisonResponse } from '../../types';
import { formatBDT, formatDistance } from '../../utils/currency';
import { EmptyState } from '../../components/EmptyState';

export default function CompareScreen() {
  const { variantId } = useLocalSearchParams<{ variantId: string }>();
  const [data, setData] = useState<PriceComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async (stockFilter: boolean = inStockOnly) => {
    if (!variantId) return;
    setLoading(true);
    setError(null);
    try {
      const coords = await getUserLocation();
      const res = await api.comparePrices(variantId, coords.latitude, coords.longitude, stockFilter);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'মূল্য তুলনা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(inStockOnly);
  }, [variantId, inStockOnly]);

  const openNavigation = (url?: string | null) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.warn('Could not open Google Maps navigation link:', err)
      );
    }
  };

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>দোকানসমূহের মূল্য যাচাই করা হচ্ছে...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="মূল্য পাওয়া যায়নি"
        description={error || 'এই ভ্যারিয়েন্টের জন্য কোনো সক্রিয় লিস্টিং পাওয়া যায়নি।'}
        actionText="পুনরায় চেষ্টা করুন"
        onAction={() => fetchComparison(inStockOnly)}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Product Summary Header */}
      <View style={styles.productHeader}>
        {data.image_url ? (
          <Image source={{ uri: data.image_url }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={{ fontSize: 32 }}>🛍️</Text>
          </View>
        )}
        <View style={styles.headerDetails}>
          <Text style={styles.brandText}>{data.brand}</Text>
          <Text style={styles.productTitle}>{data.product_name}</Text>
          <View style={styles.variantTag}>
            <Text style={styles.variantTagText}>প্যাকেজ / সাইজ: {data.variant_name}</Text>
          </View>
        </View>
      </View>

      {/* Price Highlights Grid */}
      <View style={styles.highlightGrid}>
        {/* Lowest Verified Available Price */}
        <View style={[styles.highlightCard, styles.verifiedCard]}>
          <Text style={styles.highlightLabel}>সবচেয়ে কম যাচাইকৃত ও মজুদ মূল্য</Text>
          <Text style={styles.highlightSubLabel}>(Lowest Verified Available)</Text>
          <Text style={styles.highlightPrice}>
            {data.lowest_verified_available_price
              ? formatBDT(data.lowest_verified_available_price)
              : 'বর্তমানে নেই'}
          </Text>
          <View style={styles.verifiedCheck}>
            <Text style={styles.verifiedCheckText}>✓ নিশ্চিন্ত ক্রয়যোগ্য</Text>
          </View>
        </View>

        {/* Lowest Listed Price */}
        <View style={styles.highlightCard}>
          <Text style={styles.highlightLabel}>সর্বনিম্ন তালিকাভুক্ত মূল্য</Text>
          <Text style={styles.highlightSubLabel}>(Lowest Listed Price)</Text>
          <Text style={styles.highlightPriceListed}>
            {data.lowest_listed_price ? formatBDT(data.lowest_listed_price) : 'N/A'}
          </Text>
          <Text style={styles.listedNote}>*ক্রাউড / অনিশ্চিত হতে পারে</Text>
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <Text style={styles.filterText}>শুধুমাত্র স্টকে থাকা পণ্য দেখান</Text>
        <Switch
          value={inStockOnly}
          onValueChange={setInStockOnly}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Listings Section */}
      <Text style={styles.listingsHeader}>
        দোকানের তালিকা ({data.listings.length}টি দোকান - মূল্যানুসারে সাজানো):
      </Text>

      {data.listings.map((item, idx) => {
        const isLowest = idx === 0;
        return (
          <View key={item.listing_id} style={[styles.listingCard, isLowest && styles.lowestCard]}>
            <View style={styles.listingTop}>
              <View style={styles.shopInfo}>
                <View style={styles.shopNameRow}>
                  <Text style={styles.shopName}>{item.shop_name}</Text>
                  {item.is_verified && (
                    <View style={styles.smallVerified}>
                      <Text style={styles.smallVerifiedText}>✓ Verified</Text>
                    </View>
                  )}
                  {isLowest && (
                    <View style={styles.bestPriceBadge}>
                      <Text style={styles.bestPriceText}>সেরা দাম</Text>
                    </View>
                  )}
                </View>
                {item.branch_name && (
                  <Text style={styles.branchName}>শাখা: {item.branch_name}</Text>
                )}
                {item.address && <Text style={styles.address}>📍 {item.address}</Text>}
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.listingPrice}>{formatBDT(item.price)}</Text>
                <Text
                  style={[
                    styles.stockStatusText,
                    item.stock_status === 'out_of_stock' && styles.outOfStock,
                    item.stock_status === 'low_stock' && styles.lowStock,
                  ]}
                >
                  {item.stock_status === 'out_of_stock'
                    ? 'স্টক নেই'
                    : item.stock_status === 'low_stock'
                    ? 'স্বল্প স্টক'
                    : 'স্টক আছে'}
                </Text>
              </View>
            </View>

            {/* Bottom Actions & Distance */}
            <View style={styles.listingBottom}>
              <Text style={styles.distanceText}>
                {item.distance_km !== null && item.distance_km !== undefined
                  ? formatDistance(item.distance_km)
                  : 'দূরত্ব অজানা'}
              </Text>

              {item.google_maps_url && (
                <TouchableOpacity
                  style={styles.directionsBtn}
                  onPress={() => openNavigation(item.google_maps_url)}
                >
                  <Text style={styles.directionsBtnText}>🗺️ গুগল ম্যাপে দিকনির্দেশনা</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  productHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  variantTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  variantTagText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
  },
  highlightGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  verifiedCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  highlightLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  highlightSubLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 6,
  },
  highlightPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
  },
  highlightPriceListed: {
    fontSize: 20,
    fontWeight: '800',
    color: '#374151',
  },
  verifiedCheck: {
    marginTop: 6,
  },
  verifiedCheckText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  listedNote: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 6,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  listingsHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lowestCard: {
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  listingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shopInfo: {
    flex: 1,
    marginRight: 10,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  shopName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  smallVerified: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  smallVerifiedText: {
    color: '#03543F',
    fontSize: 9,
    fontWeight: '700',
  },
  bestPriceBadge: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestPriceText: {
    color: '#854D0E',
    fontSize: 10,
    fontWeight: '800',
  },
  branchName: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  address: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#064E3B',
  },
  stockStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
  outOfStock: {
    color: '#DC2626',
  },
  lowStock: {
    color: '#D97706',
  },
  listingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  directionsBtn: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  directionsBtnText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
});
