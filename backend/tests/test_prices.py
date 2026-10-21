def test_compare_prices_for_variant(client):
    response = client.get("/api/v1/prices/compare/var-teer-5l?lat=23.7500&lng=90.3700")
    assert response.status_code == 200
    data = response.json()
    assert data["variant_id"] == "var-teer-5l"
    assert data["product_name"] == "Teer Fortified Soyabean Oil"
    assert data["currency"] == "BDT"
    assert data["total_listings"] == 2

    # Lowest listed price is 830.00 (from unverified shop)
    assert float(data["lowest_listed_price"]) == 830.00
    # Lowest verified available price is 845.00 (from verified Shwapno)
    assert float(data["lowest_verified_available_price"]) == 845.00

    # Ensure listings are sorted ascending by price
    listings = data["listings"]
    assert len(listings) == 2
    assert float(listings[0]["price"]) == 830.00
    assert float(listings[1]["price"]) == 845.00

    # Distance and maps link must be present
    assert listings[0]["distance_km"] is not None
    assert "https://www.google.com/maps/dir/?api=1" in listings[0]["google_maps_url"]


def test_compare_prices_nonexistent_variant(client):
    response = client.get("/api/v1/prices/compare/non-existent-var")
    assert response.status_code == 404
