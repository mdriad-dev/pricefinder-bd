import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Header } from '../../components/Header';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/EmptyState';
import { api } from '../../services/api';
import { ProductSearchItem } from '../../types';

const CATEGORIES = [
  'All',
  'Edible Oil',
  'Dairy',
  'Beverages',
  'Spices',
  'Smartphones',
];

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [items, setItems] = useState<ProductSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (searchQuery: string = query, cat: string = selectedCategory) => {
    setLoading(true);
    setError(null);
    try {
      const categoryParam = cat === 'All' ? undefined : cat;
      const data = await api.searchProducts(searchQuery, categoryParam);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'পণ্য অনুসন্ধান ব্যর্থ হয়েছে (Failed to fetch products)');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(query, selectedCategory);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(query, selectedCategory);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="PriceFinder BD" subtitle="পণ্যের সেরা দাম ও নির্ভরযোগ্য দোকান খুঁজুন" />

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="পণ্য বা ব্র্যান্ড খুঁজুন (যেমন: Teer, Aarong, Samsung)..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Product List / Status */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>পণ্য লোড হচ্ছে...</Text>
        </View>
      ) : error ? (
        <EmptyState
          title="সংযোগ সমস্যা (Connection Issue)"
          description={`সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি: ${error}\nদয়া করে ব্যাকএন্ড চালু আছে কি না পরীক্ষা করুন।`}
          actionText="আবার চেষ্টা করুন"
          onAction={() => fetchProducts(query, selectedCategory)}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.product_id}-${item.variant_id}`}
          renderItem={({ item }) => <ProductCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
          }
          ListEmptyComponent={
            <EmptyState
              title="কোনো পণ্য পাওয়া যায়নি"
              description={`"${query || selectedCategory}" এর সাথে মিলিয়ে কোনো পণ্য খুঁজে পাওয়া যায়নি।\nসরাসরি বারকোড স্ক্যান করতে নিচে "বারকোড" ট্যাবে চাপুন।`}
              actionText="অনুসন্ধান মুছুন"
              onAction={() => {
                setQuery('');
                setSelectedCategory('All');
              }}
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
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  clearBtn: {
    fontSize: 16,
    color: '#9CA3AF',
    padding: 4,
  },
  categoryList: {
    paddingTop: 12,
    gap: 8,
  },
  categoryPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#059669',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});
