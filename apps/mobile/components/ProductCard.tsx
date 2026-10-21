import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { ProductSearchItem } from '../types';
import { formatBDT } from '../utils/currency';

interface ProductCardProps {
  item: ProductSearchItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const handlePress = () => {
    router.push({
      pathname: '/compare/[variantId]',
      params: { variantId: item.variant_id },
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.categoryRow}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.category} numberOfLines={1}>
            {item.category}
          </Text>
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.variantBadge}>
          <Text style={styles.variantText} numberOfLines={1}>
            {item.variant_name}
          </Text>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>দাম (Price):</Text>
            {item.lowest_price !== null && item.lowest_price !== undefined ? (
              <Text style={styles.priceValue}>
                {item.lowest_price === item.highest_price
                  ? formatBDT(item.lowest_price)
                  : `${formatBDT(item.lowest_price)} - ${formatBDT(item.highest_price)}`}
              </Text>
            ) : (
              <Text style={styles.noPrice}>দাম তালিকাভুক্ত নয়</Text>
            )}
          </View>

          <View style={styles.compareBtn}>
            <Text style={styles.compareBtnText}>
              {item.listings_count > 0 ? `${item.listings_count} দোকানে তুলনা` : 'মূল্য দেখুন'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageContainer: {
    width: 88,
    height: 88,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  dot: {
    marginHorizontal: 4,
    color: '#9CA3AF',
  },
  category: {
    fontSize: 11,
    color: '#6B7280',
    flexShrink: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  variantBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  variantText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#064E3B',
  },
  noPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  compareBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  compareBtnText: {
    color: '#047857',
    fontWeight: '700',
    fontSize: 11,
  },
});
