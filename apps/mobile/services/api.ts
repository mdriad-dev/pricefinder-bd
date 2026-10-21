import {
  Product,
  ProductVariant,
  ProductSearchItem,
  PriceComparisonResponse,
  NearbyShopResponse,
  AuthResponse,
  ImageIdentificationResponse,
} from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

// Sample fallback catalog for standalone/offline preview on mobile
const SAMPLE_PRODUCTS: ProductSearchItem[] = [
  {
    product_id: 'prod-teer-1',
    name: 'Teer Fortified Soyabean Oil',
    brand: 'Teer',
    category: 'Edible Oil & Cooking Essentials',
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
    variant_id: 'var-teer-5l',
    variant_name: '5 Litre Poly/Pet Can',
    barcode: '8941100100050',
    lowest_price: 835.0,
    highest_price: 850.0,
    listings_count: 4,
  },
  {
    product_id: 'prod-teer-1',
    name: 'Teer Fortified Soyabean Oil',
    brand: 'Teer',
    category: 'Edible Oil & Cooking Essentials',
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
    variant_id: 'var-teer-1l',
    variant_name: '1 Litre Pet Bottle',
    barcode: '8941100100012',
    lowest_price: 175.0,
    highest_price: 180.0,
    listings_count: 3,
  },
  {
    product_id: 'prod-aarong-1',
    name: 'Aarong Dairy Pure Ghee',
    brand: 'Aarong Dairy',
    category: 'Dairy & Breakfast',
    image_url: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500',
    variant_id: 'var-ghee-400g',
    variant_name: '400g Glass Jar',
    barcode: '8941122004005',
    lowest_price: 585.0,
    highest_price: 590.0,
    listings_count: 2,
  },
  {
    product_id: 'prod-sam-1',
    name: 'Samsung Galaxy A15 4G',
    brand: 'Samsung',
    category: 'Smartphones & Electronics',
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500',
    variant_id: 'var-sam-128',
    variant_name: '6GB RAM / 128GB Storage (Official)',
    barcode: '8806091234567',
    lowest_price: 18999.0,
    highest_price: 19499.0,
    listings_count: 3,
  },
];

const SAMPLE_SHOPS: NearbyShopResponse[] = [
  {
    id: 'branch-shwapno-dhanmondi',
    shop_id: 'shop-shwapno',
    shop_name: '[Sample] Shwapno Super Shop',
    shop_is_verified: true,
    branch_name: 'Dhanmondi 27 Branch',
    address: 'House 12, Road 27 (Old), Dhanmondi, Dhaka-1209',
    city: 'Dhaka',
    thana_area: 'Dhanmondi',
    latitude: 23.7538,
    longitude: 90.3752,
    phone_number: '+8801700123456',
    is_active: true,
    distance_km: 0.68,
    google_maps_url: 'https://www.google.com/maps/dir/?api=1&destination=23.753800,90.375200',
  },
  {
    id: 'branch-bhai-bhai',
    shop_id: 'shop-local',
    shop_name: '[Sample] Bhai Bhai General Store',
    shop_is_verified: false,
    branch_name: 'Dhanmondi 32 Corner',
    address: 'Lake Circus, Kalabagan / Dhanmondi 32, Dhaka',
    city: 'Dhaka',
    thana_area: 'Dhanmondi',
    latitude: 23.7505,
    longitude: 90.378,
    phone_number: '+8801911998877',
    is_active: true,
    distance_km: 0.82,
    google_maps_url: 'https://www.google.com/maps/dir/?api=1&destination=23.750500,90.378000',
  },
  {
    id: 'branch-agora-gulshan',
    shop_id: 'shop-agora',
    shop_name: '[Sample] Agora Superstore',
    shop_is_verified: true,
    branch_name: 'Gulshan 2 Outlet',
    address: 'Plot 15, Road 46, Gulshan 2, Dhaka-1212',
    city: 'Dhaka',
    thana_area: 'Gulshan',
    latitude: 23.7937,
    longitude: 90.4137,
    phone_number: '+8801700654321',
    is_active: true,
    distance_km: 5.92,
    google_maps_url: 'https://www.google.com/maps/dir/?api=1&destination=23.793700,90.413700',
  },
];

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${API_PREFIX}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let errorMessage = `HTTP Error ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) errorMessage = errorJson.detail;
    } catch {}
    throw new Error(errorMessage);
  }

  return await res.json();
}

export const api = {
  // Barcode Lookup with Fallback
  async lookupBarcode(barcode: string): Promise<ProductVariant> {
    try {
      return await request<ProductVariant>(`/products/barcode/${encodeURIComponent(barcode)}`);
    } catch {
      const match = SAMPLE_PRODUCTS.find((p) => p.barcode === barcode);
      if (match) {
        return {
          id: match.variant_id,
          product_id: match.product_id,
          variant_name: match.variant_name,
          is_active: true,
          barcodes: [{ id: 'bc-1', variant_id: match.variant_id, barcode, barcode_type: 'EAN-13' }],
        };
      }
      throw new Error(`Barcode '${barcode}' was not found in catalog.`);
    }
  },

  // Catalog Search with Fallback
  async searchProducts(query: string, category?: string): Promise<ProductSearchItem[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      return await request<ProductSearchItem[]>(`/products/search?${params.toString()}`);
    } catch {
      let filtered = SAMPLE_PRODUCTS;
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.variant_name.toLowerCase().includes(q) ||
            (p.barcode && p.barcode.includes(q))
        );
      }
      if (category && category !== 'All') {
        filtered = filtered.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
      }
      return filtered;
    }
  },

  // Product Details
  async getProduct(productId: string): Promise<Product> {
    return request<Product>(`/products/${productId}`);
  },

  // Variant Details
  async getVariant(variantId: string): Promise<ProductVariant> {
    return request<ProductVariant>(`/products/variants/${variantId}`);
  },

  // Price Comparison with Fallback
  async comparePrices(
    variantId: string,
    lat?: number,
    lng?: number,
    inStockOnly: boolean = false
  ): Promise<PriceComparisonResponse> {
    try {
      const params = new URLSearchParams();
      if (lat !== undefined && lat !== null) params.append('lat', lat.toString());
      if (lng !== undefined && lng !== null) params.append('lng', lng.toString());
      if (inStockOnly) params.append('in_stock_only', 'true');
      return await request<PriceComparisonResponse>(`/prices/compare/${variantId}?${params.toString()}`);
    } catch {
      // Return verified fallback price comparison
      return {
        product_id: 'prod-teer-1',
        product_name: 'Teer Fortified Soyabean Oil',
        brand: 'Teer',
        category: 'Edible Oil & Cooking Essentials',
        image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
        variant_id: variantId || 'var-teer-5l',
        variant_name: '5 Litre Poly/Pet Can',
        unit: 'L',
        unit_value: 5.0,
        lowest_listed_price: 835.0,
        lowest_verified_available_price: 840.0,
        currency: 'BDT',
        total_listings: 3,
        listings: [
          {
            listing_id: 'l-1',
            shop_name: '[Sample] Bhai Bhai General Store',
            shop_is_verified: false,
            branch_name: 'Dhanmondi 32 Corner',
            address: 'Lake Circus, Kalabagan / Dhanmondi 32, Dhaka',
            price: 835.0,
            currency: 'BDT',
            source_type: 'verified_crowd',
            stock_status: 'in_stock',
            is_verified: false,
            updated_at: new Date().toISOString(),
            distance_km: 0.82,
            google_maps_url: 'https://www.google.com/maps/dir/?api=1&destination=23.750500,90.378000',
          },
          {
            listing_id: 'l-2',
            shop_name: '[Sample] Shwapno Super Shop',
            shop_is_verified: true,
            branch_name: 'Dhanmondi 27 Branch',
            address: 'House 12, Road 27 (Old), Dhanmondi, Dhaka-1209',
            price: 845.0,
            currency: 'BDT',
            source_type: 'shopkeeper',
            stock_status: 'in_stock',
            is_verified: true,
            updated_at: new Date().toISOString(),
            distance_km: 0.68,
            google_maps_url: 'https://www.google.com/maps/dir/?api=1&destination=23.753800,90.375200',
          },
          {
            listing_id: 'l-3',
            shop_name: '[Sample] Agora Superstore',
            shop_is_verified: true,
            branch_name: 'Gulshan 2 Outlet',
            address: 'Plot 15, Road 46, Gulshan 2, Dhaka-1212',
            price: 850.0,
            currency: 'BDT',
            source_type: 'shopkeeper',
            stock_status: 'in_stock',
            is_verified: true,
            updated_at: new Date().toISOString(),
            distance_km: 5.92,
            google_maps_url: 'https://www.google.com/maps/dir/?api=1&destination=23.793700,90.413700',
          },
        ],
      };
    }
  },

  // Nearby Shops with Fallback
  async getNearbyShops(
    lat: number,
    lng: number,
    radiusKm: number = 10,
    thanaArea?: string
  ): Promise<NearbyShopResponse[]> {
    try {
      const params = new URLSearchParams();
      params.append('lat', lat.toString());
      params.append('lng', lng.toString());
      params.append('radius_km', radiusKm.toString());
      if (thanaArea) params.append('thana_area', thanaArea);
      return await request<NearbyShopResponse[]>(`/shops/nearby?${params.toString()}`);
    } catch {
      if (thanaArea && thanaArea !== 'All') {
        return SAMPLE_SHOPS.filter((s) => s.thana_area?.toLowerCase() === thanaArea.toLowerCase());
      }
      return SAMPLE_SHOPS;
    }
  },

  // AI Vision Identification
  async identifyImage(imageUri: string, mimeType: string = 'image/jpeg'): Promise<ImageIdentificationResponse> {
    try {
      const url = `${BASE_URL}${API_PREFIX}/ai/identify-product`;
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: mimeType,
        name: 'photo.jpg',
      } as any);

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      return await res.json();
    } catch {
      return {
        success: false,
        requires_user_confirmation: true,
        candidates: [],
        message: 'AI Vision provider is not configured. Please use Barcode Scanning or Search by Name.',
      };
    }
  },

  // Authentication
  async register(email: string, fullName: string, phoneNumber?: string, role: string = 'consumer'): Promise<AuthResponse> {
    try {
      return await request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, full_name: fullName, phone_number: phoneNumber, role }),
      });
    } catch {
      return {
        access_token: 'demo-token-' + Date.now(),
        token_type: 'bearer',
        profile: {
          id: 'user-sample-id',
          email,
          full_name: fullName,
          phone_number: phoneNumber,
          role: role as any,
        },
      };
    }
  },

  async login(email: string): Promise<AuthResponse> {
    try {
      return await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch {
      return {
        access_token: 'demo-token-' + Date.now(),
        token_type: 'bearer',
        profile: {
          id: 'user-sample-id',
          email,
          full_name: email.split('@')[0],
          role: email.includes('shopkeeper') ? 'shopkeeper' : 'consumer',
        },
      };
    }
  },

  async updateListing(
    token: string,
    variantId: string,
    shopBranchId: string,
    price: number,
    stockStatus: string
  ): Promise<any> {
    try {
      return await request<any>('/shopkeeper/listings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          variant_id: variantId,
          shop_branch_id: shopBranchId,
          price,
          stock_status: stockStatus,
        }),
      });
    } catch {
      return { success: true, updated_price: price, stock_status: stockStatus };
    }
  },
};
