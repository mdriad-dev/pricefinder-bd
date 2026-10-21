# PriceFinder BD - Database Design Specification

## 1. Schema Principles
- **Relational Integrity**: Foreign keys with appropriate delete/update cascades.
- **Normalization**: Separates master product definition, variant packaging, shop owners, physical branches, product listings, and historical price observations.
- **Strict Currency Precision**: Prices stored as `NUMERIC(12, 2)` (BDT Taka). Float types are prohibited for financial values.
- **Audit Trails**: Every price change appends to `price_observations`.
- **Row Level Security (RLS)**: Enforced in PostgreSQL / Supabase.

---

## 2. Table Specifications

### 2.1 `profiles`
Represents application users (both regular consumers and registered shopkeepers).
- `id` (UUID, PK) - references `auth.users(id)`
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `full_name` (VARCHAR(255), NOT NULL)
- `phone_number` (VARCHAR(30))
- `role` (VARCHAR(20), NOT NULL, DEFAULT 'consumer') - CHECK ('consumer', 'shopkeeper', 'admin')
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

### 2.2 `products`
Master catalog items representing a canonical product.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `name` (VARCHAR(255), NOT NULL)
- `brand` (VARCHAR(150), NOT NULL)
- `category` (VARCHAR(100), NOT NULL)
- `description` (TEXT)
- `image_url` (VARCHAR(500))
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- *Indexes*: `idx_products_name_brand` (name, brand), `idx_products_category` (category)

### 2.3 `product_variants`
Specific size, unit, packaging, or model of a product.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `product_id` (UUID, FK -> `products.id`, ON DELETE CASCADE)
- `variant_name` (VARCHAR(150), NOT NULL) - e.g. "500g Jar", "1 Litre Bottle", "128GB Black"
- `unit` (VARCHAR(50)) - e.g. "gram", "ml", "pcs"
- `unit_value` (NUMERIC(10, 2)) - e.g. 500, 1000
- `sku` (VARCHAR(100))
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- *Indexes*: `idx_variants_product_id` (product_id)

### 2.4 `product_barcodes`
Barcodes mapped to specific product variants.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `variant_id` (UUID, FK -> `product_variants.id`, ON DELETE CASCADE)
- `barcode` (VARCHAR(64), UNIQUE, NOT NULL) - EAN-13, UPC-A, Code-128
- `barcode_type` (VARCHAR(30), DEFAULT 'EAN-13')
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- *Indexes*: `idx_barcodes_barcode` UNIQUE (barcode)

### 2.5 `shops`
Retail entities / business organizations (e.g. "Shwapno", "Agora", "Bhai Bhai General Store").
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `name` (VARCHAR(255), NOT NULL)
- `owner_id` (UUID, FK -> `profiles.id`, NULLABLE if chain or scraped with permission)
- `logo_url` (VARCHAR(500))
- `website_url` (VARCHAR(500))
- `is_verified` (BOOLEAN, NOT NULL, DEFAULT FALSE)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

### 2.6 `shop_branches`
Physical shop outlets with exact geographic coordinates in Bangladesh.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `shop_id` (UUID, FK -> `shops.id`, ON DELETE CASCADE)
- `branch_name` (VARCHAR(255), NOT NULL) - e.g. "Dhanmondi 27 Branch"
- `address` (TEXT, NOT NULL)
- `city` (VARCHAR(100), NOT NULL, DEFAULT 'Dhaka')
- `thana_area` (VARCHAR(100)) - e.g. "Dhanmondi", "Gulshan", "Mirpur"
- `latitude` (NUMERIC(10, 7), NOT NULL)
- `longitude` (NUMERIC(10, 7), NOT NULL)
- `phone_number` (VARCHAR(30))
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- *Indexes*: `idx_branches_shop_id` (shop_id), `idx_branches_coords` (latitude, longitude)

### 2.7 `product_listings`
Current listing of a specific product variant at a specific shop branch or online source.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `variant_id` (UUID, FK -> `product_variants.id`, ON DELETE CASCADE)
- `shop_branch_id` (UUID, FK -> `shop_branches.id`, NULLABLE for pure online stores)
- `price` (NUMERIC(12, 2), NOT NULL, CHECK (price >= 0)) - current price in BDT
- `source_type` (VARCHAR(30), NOT NULL, DEFAULT 'shopkeeper') - 'shopkeeper', 'authorized_partner', 'verified_crowd'
- `stock_status` (VARCHAR(30), NOT NULL, DEFAULT 'in_stock') - 'in_stock', 'low_stock', 'out_of_stock', 'unknown'
- `is_verified` (BOOLEAN, NOT NULL, DEFAULT FALSE)
- `product_url` (VARCHAR(500))
- `last_verified_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- *Indexes*: `idx_listings_variant_price` (variant_id, price), `idx_listings_branch` (shop_branch_id)

### 2.8 `price_observations`
Immutable historical log of observed prices.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `listing_id` (UUID, FK -> `product_listings.id`, ON DELETE CASCADE)
- `variant_id` (UUID, FK -> `product_variants.id`, ON DELETE CASCADE)
- `price` (NUMERIC(12, 2), NOT NULL)
- `stock_status` (VARCHAR(30), NOT NULL)
- `recorded_by` (UUID, FK -> `profiles.id`, NULLABLE)
- `observed_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- *Indexes*: `idx_observations_listing_time` (listing_id, observed_at DESC)

### 2.9 `favorites`
Consumer saved items.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `user_id` (UUID, FK -> `profiles.id`, ON DELETE CASCADE)
- `variant_id` (UUID, FK -> `product_variants.id`, ON DELETE CASCADE)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- *Constraints*: UNIQUE(user_id, variant_id)

### 2.10 `price_reports`
User-submitted price corrections or updates.
- `id` (UUID, PK, DEFAULT gen_random_uuid())
- `variant_id` (UUID, FK -> `product_variants.id`)
- `shop_branch_id` (UUID, FK -> `shop_branches.id`)
- `user_id` (UUID, FK -> `profiles.id`)
- `reported_price` (NUMERIC(12, 2), NOT NULL)
- `receipt_image_url` (VARCHAR(500))
- `status` (VARCHAR(20), NOT NULL, DEFAULT 'pending') - 'pending', 'approved', 'rejected'
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

---

## 3. RLS Policies Outline
- `profiles`: Users can select their own profile. Admins can view all.
- `products`, `product_variants`, `product_barcodes`, `shops`, `shop_branches`: Publicly readable (`SELECT` for all authenticated and anonymous users).
- `product_listings`: Publicly readable. Only owners of the shop (`shops.owner_id = auth.uid()`) can INSERT, UPDATE, or DELETE their branch's listings.
- `favorites`: Consumers can only read, create, and delete their own favorites (`user_id = auth.uid()`).
