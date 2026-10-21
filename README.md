# PriceFinder BD (প্রাইসফাইন্ডার বিডি)

[![CI](https://github.com/mdriad-dev/pricefinder-bd/actions/workflows/ci.yml/badge.svg)](https://github.com/mdriad-dev/pricefinder-bd/actions/workflows/ci.yml)

**A full-stack product price comparison and nearby shop discovery prototype for Bangladesh.**

PriceFinder BD is a portfolio project that demonstrates how consumers could scan product barcodes, search a catalog, compare listed prices in Bangladeshi Taka (BDT ৳), and discover nearby stores with Google Maps directions. It also includes a shopkeeper listing and price management workflow. The included catalog and store records are sample data; live retailer partnerships and production deployment are not claimed.

---

## 🌟 Key Capabilities

1. **Barcode Scanning (`expo-camera`)**:
   - Instant camera viewfinder scanning for EAN-13, UPC-A, and local retail barcodes.
   - Built-in manual barcode entry fallback for damaged barcodes or test environments.
2. **Exact Variant Matching**:
   - Master products separated from concrete packaging sizes and models (e.g., *Teer Soyabean Oil 1 Litre* vs *5 Litre Can*; *Aarong Ghee 400g* vs *900g*; *Samsung Galaxy A15 128GB* vs *256GB*).
   - Strictly avoids conflating distinct package quantities or product tiers.
3. **Price Comparison Engine**:
   - Comparison of recorded sample prices across store branches. Live retailer feeds and retailer partnerships are not configured by default.
   - Distinguishes **Lowest Listed Price** from **Lowest Verified & Available Price**.
   - Immutable audit trail in `price_observations` whenever prices or stock statuses change.
4. **Geospatial Shop Discovery & Maps Navigation**:
   - Haversine distance calculations from user's GPS coordinates or manual Dhaka area fallback (*Dhanmondi, Gulshan, Banani, Mirpur, Uttara*).
   - Direct Google Maps navigation intent links (`https://www.google.com/maps/dir/?api=1&destination=LAT,LNG`).
5. **Shopkeeper Portal & Role-Based Security**:
   - Shop registration and branch coordinate management.
   - Branch ownership verification ensures shopkeepers can only modify their own listings.
   - Administrative review requirement before new shops are marked verified.
6. **AI Vision Identification Adapter (Optional)**:
   - Backend-only integration for Google Gemini Vision.
   - Safe error handling and graceful fallback when credentials are not configured.
   - Mandatory user confirmation card before any AI guess is matched to catalog prices.

---

## 🏗️ Architecture & Technology Stack

- **Mobile App**:
  - React Native with **Expo SDK 52** (Managed Workflow)
  - TypeScript (Strict Mode)
  - **Expo Router v4** (file-based navigation)
  - `expo-camera`, `expo-image-picker`, `expo-location`
- **Backend API**:
  - **FastAPI** (Python 3.13 / 3.11+)
  - **SQLAlchemy 2.0** ORM & **Alembic** migrations
  - **Pydantic v2** data validation & serialization
  - **Pytest** with HTTPX async test client
  - JWT Authentication (compatible with **Supabase Auth**)
- **Database**:
  - PostgreSQL (including Supabase PostgreSQL; production connection and RLS policies must be configured and verified)
  - SQLite supported out-of-the-box for zero-dependency local development and CI
  - Currency: Bangladeshi Taka stored as `NUMERIC(12, 2)`

```
pricefinder-bd/
├── apps/
│   └── mobile/           # React Native / Expo TypeScript App
│       ├── app/          # Expo Router file-based screens
│       │   ├── (tabs)/   # Main tab screens (Search, Scan, Identify, Nearby, Account)
│       │   ├── compare/  # Price comparison screen ([variantId].tsx)
│       │   └── shopkeeper/ # Listing management portal (manage.tsx)
│       ├── components/   # UI components (Header, ProductCard, PriceBadge, EmptyState)
│       ├── context/      # AuthContext for session management
│       ├── services/     # API Client & Geolocation services
│       ├── types/        # TypeScript interfaces
│       └── utils/        # Currency & distance formatting utilities
├── backend/              # Python FastAPI Application
│   ├── app/
│   │   ├── api/          # REST route handlers (products, prices, shops, shopkeeper, auth, ai)
│   │   ├── core/         # Settings, database session, JWT security
│   │   ├── models/       # SQLAlchemy 2.0 normalized models
│   │   ├── schemas/      # Pydantic v2 request/response schemas
│   │   └── services/     # Catalog, pricing, geo distance, and vision adapters
│   ├── alembic/          # Database migration revisions
│   ├── tests/            # Pytest automated test suite
│   ├── scripts/          # Database seeder and live verification runner
│   ├── requirements.txt
│   └── .env.example
├── docs/                 # Architecture, DB schema, and API specifications
└── .gitignore
```

---

## 📚 Contents

- [Key Capabilities](#-key-capabilities)
- [Architecture & Technology Stack](#-architecture--technology-stack)
- [Getting Started](#-getting-started)
- [Verification & Automated Testing](#-verification--automated-testing)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Screenshots and Demo](#-screenshots-and-demo)
- [Security and Production Readiness](#-security-and-production-readiness)
- [Known Limitations](#️-known-limitations--disclaimers)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20+ (Verified on v24.19.0)
- **Python**: v3.11 - v3.13 (Verified on v3.13.15)
- **Git**

---

### 2. Backend Setup

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```powershell
   # Windows PowerShell:
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS:
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment:
   ```bash
   cp .env.example .env
   ```
   *(Defaults to local SQLite `pricefinder_dev.db` for instant out-of-the-box operation).*
5. Apply database migrations:
   ```bash
   alembic upgrade head
   ```
6. Seed authentic sample Bangladesh catalog items (Teer, Aarong, Samsung, Shwapno, Agora, etc.):
   ```bash
   python scripts/seed_sample_data.py
   ```
7. Start the FastAPI development server:
   ```bash
   # Bind to 0.0.0.0 so physical mobile devices on the same Wi-Fi can access the API:
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - Interactive OpenAPI documentation is available at: `http://localhost:8000/docs`
   - Healthcheck: `http://localhost:8000/health`

---

### 3. Mobile App Setup (Expo & React Native)

1. Open a terminal in `apps/mobile/`:
   ```bash
   cd apps/mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure API base URL:
   ```bash
   cp .env.example .env
   ```
   - **For Web / Emulator**: `EXPO_PUBLIC_API_URL=http://localhost:8000`
   - **For Physical Phone (Expo Go)**: Set `EXPO_PUBLIC_API_URL=http://<YOUR-LAN-IP>:8000` (e.g. `http://192.168.10.186:8000`).
4. Start the Expo app:
   ```bash
   npx expo start
   ```
   - Press `w` to open in Web Browser.
   - Scan the QR code using the **Expo Go** app on Android or iOS.

---

## 🧪 Verification & Automated Testing

### 1. Backend Automated Tests (Pytest)
Run the 19 automated tests:
```bash
cd backend
python -m pytest -v
```
**Actual Test Results**:
```
tests/test_ai.py::test_ai_identification_unconfigured_fallback PASSED
tests/test_ai.py::test_ai_identification_invalid_filetype PASSED
tests/test_geo.py::test_calculate_haversine_distance PASSED
tests/test_geo.py::test_calculate_haversine_distance_same_point PASSED
tests/test_geo.py::test_build_google_maps_url PASSED
tests/test_prices.py::test_compare_prices_for_variant PASSED
tests/test_prices.py::test_compare_prices_nonexistent_variant PASSED
tests/test_products.py::test_lookup_by_barcode_success PASSED
tests/test_products.py::test_lookup_by_barcode_not_found PASSED
tests/test_products.py::test_search_catalog_by_name PASSED
tests/test_products.py::test_search_catalog_by_barcode PASSED
tests/test_products.py::test_get_product_detail PASSED
tests/test_shopkeeper.py::test_shopkeeper_register_shop PASSED
tests/test_shopkeeper.py::test_consumer_cannot_register_shop PASSED
tests/test_shopkeeper.py::test_shopkeeper_create_or_update_listing PASSED
tests/test_shopkeeper.py::test_shopkeeper_cannot_modify_other_shop PASSED
tests/test_shops.py::test_get_nearby_shops PASSED
tests/test_shops.py::test_get_nearby_shops_thana_filter PASSED
tests/test_shops.py::test_get_branch_details PASSED
======================== 19 passed in 0.77s ========================
```

### 2. Mobile TypeScript Compilation
Run typecheck across the Expo codebase:
```bash
cd apps/mobile
npx tsc --noEmit
```
**Result**: **0 errors**.

### 3. Live Runtime Integration Script
Verify all HTTP endpoints against a live server:
```bash
cd backend
python scripts/verify_runtime.py
```
**Verified Flows**:
- `GET /` & `GET /health` & `GET /docs` (200 OK)
- Product Search `GET /api/v1/products/search?q=Teer` (200 OK)
- Exact Barcode Lookup `GET /api/v1/products/barcode/8941100100050` (200 OK)
- Negative Barcode Lookup `GET /api/v1/products/barcode/0000000000000` (404 Not Found)
- Price Comparison `GET /api/v1/prices/compare/<variant_id>` (200 OK - Lowest Listed vs Lowest Verified)
- Nearby Shops `GET /api/v1/shops/nearby` (200 OK - 4 branches with Google Maps URLs)
- Image Upload `POST /api/v1/ai/identify-product` (200 OK - Graceful unconfigured fallback)
- User Authentication `POST /api/v1/auth/register` & `POST /api/v1/auth/login` (200 OK)
- Shopkeeper Permissions `POST /api/v1/shopkeeper/listings` (403 Forbidden on consumer attempt)

---

## 🔒 Configuration & Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Running mode | `development` |
| `SECRET_KEY` | JWT signing secret | Random 32+ character string |
| `DATABASE_URL` | PostgreSQL or SQLite connection string | `sqlite:///./pricefinder_dev.db` |
| `SUPABASE_URL` | Production Supabase URL | `https://your-project.supabase.co` |
| `SUPABASE_JWT_SECRET` | Secret to verify Supabase Auth tokens | Configured in Supabase API settings |
| `GEMINI_API_KEY` | Optional Google Gemini Vision API key | *(Kept exclusively on backend)* |

### Mobile App (`apps/mobile/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | Backend URL accessible by phone | `http://192.168.10.186:8000` or `http://localhost:8000` |

---

## 📸 Screenshots and Demo

Screenshots and a recorded demo have not yet been added to this repository. See [`docs/screenshots/README.md`](docs/screenshots/README.md) for the recommended capture list and filenames. Only add screenshots from a running app with sample or otherwise non-sensitive data; do not include API keys, tokens, private user information, or real customer records.

## 🔐 Security and Production Readiness

This repository is a development/portfolio project and is **not yet represented as production-ready**. Before any public deployment:

- Replace demo/passwordless authentication flows with a fully verified identity-provider integration. Never rely on email-only checks for real accounts.
- Generate a strong unique `SECRET_KEY`; keep all secrets in the deployment environment and rotate any secret that was ever committed.
- Configure the production PostgreSQL connection and test Alembic migrations against a disposable staging database before applying them to production.
- Review authorization and database access policies, including Supabase Row Level Security where applicable.
- Add rate limiting, request-size limits, logging/monitoring, backups, privacy notices and an incident-response plan.
- Verify AI provider behavior and cost controls before enabling live Gemini requests.
- Do not treat sample prices, sample stores or unverified listings as confirmed live retail data.

The `.env.example` files contain placeholders only. Copy them to local `.env` files and fill in local values; never commit `.env` files, API keys, database files or real user data.

## ⚠️ Known Limitations & Disclaimers

1. **Development Seed Data**:
   - Initial sample shops and products are clearly labeled with `[Sample]` in local development. Production deployments must connect to verified business entities.
2. **AI Vision Status**:
   - AI image recognition adapter is implemented with graceful fallback. When `GEMINI_API_KEY` is not supplied, live image recognition is inactive. AI results never become verified catalog records without user confirmation.
3. **Hardware Camera**:
   - Physical camera scanning requires running on a physical Android/iOS phone or a camera-enabled emulator. A manual barcode entry option is available on all screens.

---

## 👤 Author & Repository

- **GitHub Account**: [mdriad-dev](https://github.com/mdriad-dev)
- **Repository**: [https://github.com/mdriad-dev/pricefinder-bd](https://github.com/mdriad-dev/pricefinder-bd)
- **License**: MIT
