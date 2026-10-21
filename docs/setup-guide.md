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
   Fill in your Supabase database URL, Supabase JWT secret, and optional Gemini/Vision API key.
5. Apply database migrations:
   ```bash
   alembic upgrade head
   ```
6. (Optional) Seed initial verified Bangladesh catalog & sample shops:
   ```bash
   python scripts/seed_sample_data.py
   ```
7. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
8. Run automated tests:
   ```bash
   pytest
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
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Set `EXPO_PUBLIC_API_URL` to your backend URL (e.g. `http://localhost:8000` or your machine LAN IP `http://192.168.x.x:8000` for physical device testing).
4. Start the Expo development server:
   ```bash
   npx expo start
   ```
5. Scan the QR code using Expo Go on Android or iOS, or press `a` for Android Emulator / `w` for Web.
