# PriceFinder BD (প্রাইসফাইন্ডার বিডি)

**Production-grade product price comparison and nearby shop discovery application for Bangladesh.**

---

## Key Features

- **Barcode Scanning**: Instant lookup of packaged consumer goods (FMCG, electronics, baby care, groceries) using camera scanner.
- **Smart Search**: Multi-field search across product name, brand, model, and category.
- **Exact Variant Matching**: Distinguishes packages, weights, models, and sizes (e.g. 500g vs 1kg, 128GB vs 256GB). Never misleads by comparing unequal quantities.
- **Price Comparison Engine**:
  - Compares physical shops and permitted online sources in Bangladesh.
  - Distinguishes the *Lowest Listed Price* from the *Lowest Verified & Currently Available Price*.
  - Full BDT (৳) currency support and historical price observation tracking.
- **Nearby Shops & Map Navigation**:
  - Interactive map with verified store branches in Dhaka, Chittagong, and major cities.
  - Haversine distance calculations and area/thana fallback.
  - One-tap turn-by-turn navigation in Google Maps.
- **Shopkeeper Portal**:
  - Shop registration and branch coordinate management.
  - Inventory updates (`in_stock`, `low_stock`, `out_of_stock`).
  - Price updates with audit trail.
- **AI-Assisted Vision Identification**: Optional image-based product recognition with required user confirmation for low confidence matches.

---

## Project Structure

```
pricefinder-bd/
├── apps/
│   └── mobile/           # React Native / Expo TypeScript App
│       ├── app/          # Expo Router file-based screens
│       ├── components/   # Modular UI components (Cards, Search, MapView)
│       ├── services/     # API Client & Location services
│       ├── types/        # TypeScript interfaces
│       └── package.json
├── backend/              # Python FastAPI Application
│   ├── app/
│   │   ├── api/          # REST route handlers (products, prices, shops, auth, ai)
│   │   ├── core/         # Config, database connection, security
│   │   ├── models/       # SQLAlchemy 2.0 ORM models
│   │   ├── repositories/ # Database query operations
│   │   ├── schemas/      # Pydantic v2 schemas
│   │   └── services/     # Business logic (pricing, distance, catalog, vision)
│   ├── tests/            # Pytest test suite
│   ├── alembic/          # Database migrations
│   ├── requirements.txt
│   └── .env.example
├── docs/                 # System architecture, DB design & guides
└── scripts/              # Seed scripts and developer utilities
```

---

## Quick Start

### 1. Backend
```bash
cd backend
python -m venv venv
# On Windows PowerShell: .\venv\Scripts\Activate.ps1
# On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
pytest
uvicorn app.main:app --reload
```

### 2. Mobile App
```bash
cd apps/mobile
npm install
cp .env.example .env
npx expo start
```
