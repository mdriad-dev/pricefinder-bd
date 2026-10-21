import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatBDT } from '../utils/currency';

interface PriceBadgeProps {
  price: number;
  isVerified?: boolean;
  stockStatus?: string;
  size?: 'small' | 'medium' | 'large';
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({
  price,
  isVerified = false,
  stockStatus = 'in_stock',
  size = 'medium',
}) => {
  const isOutOfStock = stockStatus === 'out_of_stock';
  const isLowStock = stockStatus === 'low_stock';

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.priceText,
          size === 'small' && styles.priceSmall,
          size === 'large' && styles.priceLarge,
          isOutOfStock && styles.priceOutOfStock,
        ]}
      >
        {formatBDT(price)}
      </Text>

      <View style={styles.badgesRow}>
        {isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
        <View
          style={[
            styles.stockBadge,
            isOutOfStock && styles.stockOut,
            isLowStock && styles.stockLow,
          ]}
        >
          <Text
            style={[
              styles.stockText,
              isOutOfStock && styles.stockTextOut,
              isLowStock && styles.stockTextLow,
            ]}
          >
            {isOutOfStock ? 'স্টক নেই (Out of Stock)' : isLowStock ? 'স্বল্প স্টক (Low Stock)' : 'স্টক আছে (In Stock)'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#064E3B',
  },
  priceSmall: {
    fontSize: 15,
  },
  priceLarge: {
    fontSize: 24,
  },
  priceOutOfStock: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  verifiedBadge: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    color: '#03543F',
    fontSize: 10,
    fontWeight: '700',
  },
  stockBadge: {
    backgroundColor: '#E1EFFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockOut: {
    backgroundColor: '#FDE8E8',
  },
  stockLow: {
    backgroundColor: '#FEF08A',
  },
  stockText: {
    color: '#1E429F',
    fontSize: 10,
    fontWeight: '600',
  },
  stockTextOut: {
    color: '#9B1C1C',
  },
  stockTextLow: {
    color: '#713F12',
  },
});
