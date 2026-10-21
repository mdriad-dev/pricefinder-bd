# PriceFinder BD - Setup Guide

## 1. Prerequisites
- **Node.js**: v20+ (Verified on v24.19.0)
- **npm**: v10+ (Verified on 11.17.0)
- **Python**: v3.11 - v3.13 (Verified on 3.13.15)
- **Expo CLI**: bundled with `npx expo`
- **Git**

---

## 2. Backend Setup

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # Linux / macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   - For local development, defaults to SQLite (`sqlite:///./pricefinder_dev.db`).
   - For production, provide your Supabase PostgreSQL connection string (`postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`) and `SUPABASE_JWT_SECRET`.
5. Apply database migrations:
   ```bash
   alembic upgrade head
   ```
6. Seed authentic sample Bangladesh catalog & sample shop branches:
   ```bash
   python scripts/seed_sample_data.py
   ```
7. Run automated test suite:
   ```bash
   python -m pytest -v
   ```
8. Run the development server:
   ```bash
   # Host on 0.0.0.0 so physical phones on the same Wi-Fi can connect
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
9. Verify live server integration:
   ```bash
   python scripts/verify_runtime.py
   ```

---

## 3. Mobile App Setup (Expo & React Native)

1. Open a terminal in `apps/mobile/`:
   ```bash
   cd apps/mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run TypeScript typecheck:
   ```bash
   npx tsc --noEmit
   ```
4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   - **When testing on Web / Android Emulator**: `EXPO_PUBLIC_API_URL=http://localhost:8000`
   - **When testing on a Physical Phone via Expo Go**: Find your computer's local Wi-Fi IP address (via `ipconfig` on Windows or `ifconfig` on Linux/macOS) and set:
     ```
     EXPO_PUBLIC_API_URL=http://192.168.10.186:8000
     ```
     *(Both your phone and PC must be connected to the same Wi-Fi network).*
5. Start the Expo development server:
   ```bash
   npx expo start
   ```
6. Scan the QR code using Expo Go on Android or iOS, or press `w` to open directly in your web browser.
