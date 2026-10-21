export interface ProductBarcode {
  id: string;
  variant_id: string;
  barcode: string;
  barcode_type: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  unit?: string | null;
  unit_value?: number | null;
  sku?: string | null;
  is_active: boolean;
  barcodes: ProductBarcode[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description?: string | null;
  image_url?: string | null;
  variants: ProductVariant[];
}

export interface ProductSearchItem {
  product_id: string;
  name: string;
  brand: string;
  category: string;
  image_url?: string | null;
  variant_id: string;
  variant_name: string;
  barcode?: string | null;
  lowest_price?: number | null;
  highest_price?: number | null;
  listings_count: number;
}

export interface PriceComparisonItem {
  listing_id: string;
  shop_id?: string | null;
  shop_name: string;
  shop_is_verified: boolean;
  branch_id?: string | null;
  branch_name?: string | null;
  address?: string | null;
  thana_area?: string | null;
  price: number;
  currency: string;
  source_type: string;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown';
  is_verified: boolean;
  last_verified_at?: string | null;
  updated_at: string;
  distance_km?: number | null;
  google_maps_url?: string | null;
  product_url?: string | null;
}

export interface PriceComparisonResponse {
  product_id: string;
  product_name: string;
  brand: string;
  category: string;
  image_url?: string | null;
  variant_id: string;
  variant_name: string;
  unit?: string | null;
  unit_value?: number | null;
  lowest_listed_price?: number | null;
  lowest_verified_available_price?: number | null;
  currency: string;
  total_listings: number;
  listings: PriceComparisonItem[];
}

export interface NearbyShopResponse {
  id: string;
  shop_id: string;
  shop_name: string;
  shop_is_verified: boolean;
  branch_name: string;
  address: string;
  city: string;
  thana_area?: string | null;
  latitude: number;
  longitude: number;
  phone_number?: string | null;
  is_active: boolean;
  distance_km: number;
  google_maps_url: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string | null;
  role: 'consumer' | 'shopkeeper' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  profile: Profile;
}

export interface VisionCandidateProduct {
  product_name: string;
  brand?: string | null;
  suggested_variant?: string | null;
  matched_variant_id?: string | null;
  confidence_score: number;
}

export interface ImageIdentificationResponse {
  success: boolean;
  requires_user_confirmation: boolean;
  candidates: VisionCandidateProduct[];
  message: string;
}
