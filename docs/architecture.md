# PriceFinder BD - System Architecture

## 1. System Overview

PriceFinder BD is a full-stack product price comparison and nearby shop discovery platform built specifically for the Bangladesh retail market. The system allows Bangladeshi consumers to scan barcodes, search products, compare prices across verified local physical shops and permitted online retailers, view stock status, and locate nearby shops on an interactive map with direct Google Maps navigation.

## 2. High-Level Architecture

```
                       +---------------------------------------+
                       |       PriceFinder BD Mobile App       |
                       | (React Native / Expo / TypeScript /   |
                       |  Expo Router / Camera & Barcode Scanner)|
                       +-------------------+-------------------+
                                           |
                                   REST / HTTPS API
                                           |
                                           v
                       +---------------------------------------+
                       |       FastAPI Application Backend     |
                       |  - Authentication & RLS Coordination  |
                       |  - Product Identification Engine      |
                       |  - Price Comparison & Sorting Engine  |
                       |  - Geospatial Distance / Nearby Shops |
                       |  - Shopkeeper Portal & Verification   |
                       |  - Vision AI Adapter (Optional / Safe)|
                       +-------------------+-------------------+
                                           |
                         +-----------------+-----------------+
                         |                                   |
                         v                                   v
        +---------------------------------+ +---------------------------------+
        |  PostgreSQL Database (Supabase) | | Google Maps / Geolocation APIs  |
        |  - Normalized Retail Tables     | | - Nearby shop routing           |
        |  - Row Level Security (RLS)     | | - Turn-by-turn directions links |
        |  - BDT Decimal Pricing          | +---------------------------------+
        |  - Price History & Auditing     |
        +---------------------------------+
```

## 3. Technology Stack Breakdown

### Frontend (Mobile App)
- **Framework**: React Native with Expo (Managed Workflow, Expo SDK 52/53)
- **Language**: TypeScript (strict mode)
- **Routing**: Expo Router (file-based navigation)
- **Barcode Scanning**: `expo-camera` / `expo-barcode-scanner`
- **Image Capture & Picker**: `expo-image-picker`
- **Maps**: `react-native-maps` with Google Maps provider on Android/iOS, with universal Google Maps intent links
- **State Management & Querying**: Lightweight React hooks / context with native fetch client
- **Styling**: Tailwind/NativeWind style utility tokens or React Native StyleSheet with clean responsive theming and BDT currency formatting

### Backend
- **Framework**: FastAPI (Python 3.11 - 3.13)
- **ORM & Migrations**: SQLAlchemy 2.0 (Async/Sync hybrid support), Alembic
- **Data Validation**: Pydantic v2
- **Testing**: Pytest, HTTPX test client, SQLite in-memory / test PostgreSQL database
- **Security**: Supabase JWT authentication verification, role-based access control (consumer, shopkeeper, admin)
- **Geospatial Processing**: Haversine distance calculations and spatial filtering for nearby shops

### Database & Auth
- **Engine**: Supabase PostgreSQL
- **Security**: Row Level Security (RLS) policies ensuring shopkeepers can only manage their own shop listings
- **Storage**: Supabase Storage for shop photos and product verification images
- **Currency**: Bangladeshi Taka (BDT, ৳) represented as `NUMERIC(12, 2)`

## 4. Subsystem Design

### 4.1 Product Identification Pipeline
Identification follows strict priority rules:
1. **Barcode Lookup**: Direct query on indexed EAN-13, UPC-A, and custom local barcodes.
2. **Text Search**: Full-text trigram / ILIKE search matching product name, brand, model, and category.
3. **Vision AI Identification**: Backend-only optional integration. AI identifies candidate brand and model, but results are marked unverified until catalog match or human review. Low confidence requires explicit user confirmation.
4. **Fallback & Feedback**: Clear reporting if a barcode or product is not yet in the catalog.

### 4.2 Price Comparison Engine
- Compares exact variants (size, weight, model, capacity). Never conflates distinct packaging or units (e.g., 500g vs 1kg).
- Filters by active listings.
- Distinguishes **Lowest Listed Price** from **Lowest Verified & In-Stock Price**.
- Maintains immutable `price_observations` audit log so historical trends and price stability can be tracked.

### 4.3 Nearby Shops & Geolocation Engine
- Reads shop branch geographic coordinates (Latitude, Longitude).
- Calculates straight-line distance (Haversine formula in km).
- Allows user location input via GPS coordinates or manual district/thana fallback (e.g., Dhanmondi, Gulshan, Mirpur, Chittagong).
- Generates direct Google Maps universal navigation links (`https://www.google.com/maps/dir/?api=1&destination=LAT,LNG`).

### 4.4 Shopkeeper Portal & Verification Lifecycle
- Shopkeeper submits ownership registration for a shop branch.
- Shop listings remain in an `unverified` or `pending_verification` state until approved.
- Shopkeepers can update inventory status (`in_stock`, `low_stock`, `out_of_stock`) and prices for their shop branch only.
