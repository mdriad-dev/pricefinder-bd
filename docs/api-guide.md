# PriceFinder BD - API Documentation

Base URL: `/api/v1`

All responses follow standard JSON serialization. Monetary amounts are returned in Bangladeshi Taka (`BDT`).

---

## 1. Product Search & Identification

### Lookup by Barcode
- **Endpoint**: `GET /api/v1/products/barcode/{barcode}`
- **Description**: Returns exact product variant, master product information, and active listings matching the EAN/UPC barcode.
- **Errors**:
  - `404 Not Found`: If barcode is not cataloged.

### Product Catalog Search
- **Endpoint**: `GET /api/v1/products/search`
- **Query Params**:
  - `q` (string, required): Search query (product name, brand, or model).
  - `category` (string, optional): Filter by category.
  - `limit` (int, default 20): Results per page.
  - `offset` (int, default 0): Pagination offset.
- **Response**: Array of product matches with their available variants.

### Product Details & Variants
- **Endpoint**: `GET /api/v1/products/{product_id}`
- **Description**: Returns product profile and all packaging variants.

---

## 2. Price Comparison

### Compare Listings for a Variant
- **Endpoint**: `GET /api/v1/prices/compare/{variant_id}`
- **Query Params**:
  - `lat` (float, optional): User's current latitude.
  - `lng` (float, optional): User's current longitude.
  - `in_stock_only` (bool, default false): Filter to only in-stock listings.
- **Response**:
  ```json
  {
    "variant_id": "...",
    "product_name": "Teer Fortified Soyabean Oil",
    "variant_name": "5 Litre Poly/Pet Bottle",
    "lowest_listed_price": 840.00,
    "lowest_verified_available_price": 845.00,
    "currency": "BDT",
    "listings": [
      {
        "listing_id": "...",
        "shop_name": "Shwapno",
        "branch_name": "Dhanmondi 27",
        "price": 845.00,
        "stock_status": "in_stock",
        "is_verified": true,
        "last_verified_at": "2026-10-20T10:30:00Z",
        "distance_km": 1.25,
        "address": "House 12, Road 27, Dhanmondi, Dhaka",
        "google_maps_url": "https://www.google.com/maps/dir/?api=1&destination=23.7538,90.3752"
      }
    ]
  }
  ```

---

## 3. Nearby Shops & Map

### Find Nearby Branches
- **Endpoint**: `GET /api/v1/shops/nearby`
- **Query Params**:
  - `lat` (float, required): User latitude.
  - `lng` (float, required): User longitude.
  - `radius_km` (float, default 10.0): Search radius in kilometers.
  - `thana_area` (string, optional): Fallback district/thana filter (e.g. Dhanmondi, Gulshan).
- **Response**: Array of shop branches with address, contact, distance, and coordinates.

### Shop Details & Catalog
- **Endpoint**: `GET /api/v1/shops/branches/{branch_id}`
- **Response**: Branch info and its active product listings with prices and stock status.

---

## 4. Shopkeeper Portal

### Register / Claim Shop Branch
- **Endpoint**: `POST /api/v1/shopkeeper/shops`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Shop profile and branch coordinates.

### Create / Update Product Listing
- **Endpoint**: `POST /api/v1/shopkeeper/listings`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "shop_branch_id": "...",
    "variant_id": "...",
    "price": 845.00,
    "stock_status": "in_stock"
  }
  ```
- **Validation**: Enforces branch ownership verification. Automatically appends audit record in `price_observations`.

---

## 5. Vision AI Identification (Optional)

### Identify Product from Image
- **Endpoint**: `POST /api/v1/ai/identify-product`
- **Headers**: `Authorization: Bearer <token>` (optional for guests if configured)
- **Body**: `multipart/form-data` with `image` file.
- **Response**:
  ```json
  {
    "identified_name": "Teer Soyabean Oil",
    "suggested_brand": "Teer",
    "suggested_variant": "5 Litre",
    "confidence_score": 0.88,
    "matched_variant_id": "...",
    "requires_user_confirmation": true
  }
  ```
