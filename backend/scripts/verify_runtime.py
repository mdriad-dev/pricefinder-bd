import httpx
import json
import io

BASE_URL = "http://127.0.0.1:8000"

def run_verification():
    print(f"=== PriceFinder BD Runtime Integration Verification ===")
    print(f"Connecting to live server at: {BASE_URL}\n")

    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    # 1. Health & Docs
    r_root = client.get("/")
    print(f"[1] Root Endpoint (/): status {r_root.status_code}")
    print(f"    Payload: {r_root.json()}")
    assert r_root.status_code == 200

    r_health = client.get("/health")
    print(f"[2] Health Endpoint (/health): status {r_health.status_code}")
    print(f"    Payload: {r_health.json()}")
    assert r_health.status_code == 200

    r_docs = client.get("/docs")
    print(f"[3] API Docs Endpoint (/docs): status {r_docs.status_code} (HTML OpenAPI Swagger)")
    assert r_docs.status_code == 200

    # 2. Product Search
    r_search = client.get("/api/v1/products/search?q=Teer")
    print(f"\n[4] Product Search Endpoint (/api/v1/products/search?q=Teer): status {r_search.status_code}")
    search_results = r_search.json()
    print(f"    Found {len(search_results)} items matching 'Teer'")
    for idx, item in enumerate(search_results):
        print(f"    Item {idx+1}: {item['name']} | Variant: {item['variant_name']} | Price range: {item['lowest_price']} - {item['highest_price']} BDT")
    assert r_search.status_code == 200
    assert len(search_results) >= 2
    teer_5l_variant_id = next(item["variant_id"] for item in search_results if "5 Litre" in item["variant_name"])

    # 3. Barcode Lookup (Teer 5L EAN: 8941100100050)
    r_barcode = client.get("/api/v1/products/barcode/8941100100050")
    print(f"\n[5] Barcode Lookup Endpoint (/api/v1/products/barcode/8941100100050): status {r_barcode.status_code}")
    bc_data = r_barcode.json()
    print(f"    Matched Variant: {bc_data['variant_name']} (Variant ID: {bc_data['id']})")
    assert r_barcode.status_code == 200
    assert bc_data["id"] == teer_5l_variant_id

    # 4. Negative Barcode Lookup
    r_bc_missing = client.get("/api/v1/products/barcode/0000000000000")
    print(f"\n[6] Unknown Barcode Lookup (/api/v1/products/barcode/0000000000000): status {r_bc_missing.status_code}")
    print(f"    Expected 404 message: {r_bc_missing.json()['detail']}")
    assert r_bc_missing.status_code == 404

    # 5. Price Comparison Flow
    r_compare = client.get(f"/api/v1/prices/compare/{teer_5l_variant_id}?lat=23.7500&lng=90.3700")
    print(f"\n[7] Price Comparison (/api/v1/prices/compare/{teer_5l_variant_id}): status {r_compare.status_code}")
    comp = r_compare.json()
    print(f"    Product: {comp['product_name']} ({comp['variant_name']})")
    print(f"    Lowest Listed Price: {comp['lowest_listed_price']} {comp['currency']}")
    print(f"    Lowest Verified Available Price: {comp['lowest_verified_available_price']} {comp['currency']}")
    print(f"    Total Comparable Listings: {comp['total_listings']}")
    for l in comp["listings"]:
        print(f"      - {l['shop_name']} ({l.get('branch_name', '')}): {l['price']} BDT | Stock: {l['stock_status']} | Verified: {l['is_verified']} | Dist: {l.get('distance_km')} km")
        print(f"        Navigation URL: {l.get('google_maps_url')}")
    assert r_compare.status_code == 200
    assert comp["lowest_listed_price"] is not None

    # 6. Nearby Shops Discovery
    r_nearby = client.get("/api/v1/shops/nearby?lat=23.7538&lng=90.3752&radius_km=15")
    print(f"\n[8] Nearby Shops (/api/v1/shops/nearby): status {r_nearby.status_code}")
    nearby_shops = r_nearby.json()
    print(f"    Found {len(nearby_shops)} shops within 15 km of Dhanmondi:")
    for s in nearby_shops:
        print(f"      * {s['shop_name']} - {s['branch_name']} | Distance: {s['distance_km']} km | Address: {s['address']}")
        print(f"        Maps link: {s['google_maps_url']}")
    assert r_nearby.status_code == 200
    assert len(nearby_shops) >= 1

    # 7. AI Vision Handling (Without GEMINI_API_KEY)
    dummy_jpeg = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 100)
    r_ai = client.post(
        "/api/v1/ai/identify-product",
        files={"image": ("test_package.jpg", dummy_jpeg, "image/jpeg")}
    )
    print(f"\n[9] AI Vision Endpoint (/api/v1/ai/identify-product): status {r_ai.status_code}")
    ai_resp = r_ai.json()
    print(f"    Success: {ai_resp['success']}")
    print(f"    Requires User Confirmation: {ai_resp['requires_user_confirmation']}")
    print(f"    Message: {ai_resp['message']}")
    assert r_ai.status_code == 200

    # 8. Authentication (Register & Login)
    test_email = "test_verifier@example.com"
    r_reg = client.post(
        "/api/v1/auth/register",
        json={"email": test_email, "full_name": "Test Verifier", "role": "consumer"}
    )
    if r_reg.status_code == 400: # Already exists from previous run
        r_login = client.post("/api/v1/auth/login", json={"email": test_email})
        auth_data = r_login.json()
    else:
        auth_data = r_reg.json()
    print(f"\n[10] Auth Endpoints: Obtained JWT token for {test_email}")
    token = auth_data["access_token"]

    r_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    print(f"    GET /auth/me status {r_me.status_code}: Logged in as {r_me.json()['full_name']} (Role: {r_me.json()['role']})")
    assert r_me.status_code == 200

    # 9. Shopkeeper Permission Enforcement
    # Consumer attempting to edit listing -> should be 403 Forbidden
    r_forbidden = client.post(
        "/api/v1/shopkeeper/listings",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "variant_id": teer_5l_variant_id,
            "shop_branch_id": nearby_shops[0]["id"],
            "price": 800.0,
            "stock_status": "in_stock"
        }
    )
    print(f"\n[11] Shopkeeper Authorization Check: status {r_forbidden.status_code}")
    print(f"    Consumer access response: {r_forbidden.json()['detail']}")
    assert r_forbidden.status_code == 403

    print("\n=== All Runtime Endpoints Verified Successfully! ===")

if __name__ == "__main__":
    run_verification()

