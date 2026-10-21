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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${API_PREFIX}${endpoint}`;
  try {
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
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        }
      } catch {
        // fallback to default error message
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error: any) {
    console.error(`API Request Failed: ${url}`, error.message);
    throw error;
  }
}

export const api = {
  // Barcode Lookup
  async lookupBarcode(barcode: string): Promise<ProductVariant> {
    return request<ProductVariant>(`/products/barcode/${encodeURIComponent(barcode)}`);
  },

  // Catalog Search
  async searchProducts(query: string, category?: string): Promise<ProductSearchItem[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    return request<ProductSearchItem[]>(`/products/search?${params.toString()}`);
  },

  // Product Details
  async getProduct(productId: string): Promise<Product> {
    return request<Product>(`/products/${productId}`);
  },

  // Variant Details
  async getVariant(variantId: string): Promise<ProductVariant> {
    return request<ProductVariant>(`/products/variants/${variantId}`);
  },

  // Price Comparison
  async comparePrices(
    variantId: string,
    lat?: number,
    lng?: number,
    inStockOnly: boolean = false
  ): Promise<PriceComparisonResponse> {
    const params = new URLSearchParams();
    if (lat !== undefined && lat !== null) params.append('lat', lat.toString());
    if (lng !== undefined && lng !== null) params.append('lng', lng.toString());
    if (inStockOnly) params.append('in_stock_only', 'true');
    return request<PriceComparisonResponse>(`/prices/compare/${variantId}?${params.toString()}`);
  },

  // Nearby Shops
  async getNearbyShops(
    lat: number,
    lng: number,
    radiusKm: number = 10,
    thanaArea?: string
  ): Promise<NearbyShopResponse[]> {
    const params = new URLSearchParams();
    params.append('lat', lat.toString());
    params.append('lng', lng.toString());
    params.append('radius_km', radiusKm.toString());
    if (thanaArea) params.append('thana_area', thanaArea);
    return request<NearbyShopResponse[]>(`/shops/nearby?${params.toString()}`);
  },

  // AI Vision Identification
  async identifyImage(imageUri: string, mimeType: string = 'image/jpeg'): Promise<ImageIdentificationResponse> {
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
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Vision analysis failed with status ${res.status}`);
    }

    return await res.json();
  },

  // Authentication
  async register(email: string, fullName: string, phoneNumber?: string, role: string = 'consumer'): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, full_name: fullName, phone_number: phoneNumber, role }),
    });
  },

  async login(email: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Shopkeeper Listing Management
  async updateListing(
    token: string,
    variantId: string,
    shopBranchId: string,
    price: number,
    stockStatus: string
  ): Promise<any> {
    return request<any>('/shopkeeper/listings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        variant_id: variantId,
        shop_branch_id: shopBranchId,
        price,
        stock_status: stockStatus,
      }),
    });
  },
};
