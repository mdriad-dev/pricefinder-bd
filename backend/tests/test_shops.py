def test_get_nearby_shops(client):
    # Search near Dhanmondi
    response = client.get("/api/v1/shops/nearby?lat=23.7538&lng=90.3752&radius_km=10")
    assert response.status_code == 200
    shops = response.json()
    assert len(shops) == 2
    # First shop should be Dhanmondi 27 because distance is 0 km
    assert shops[0]["branch_name"] == "Dhanmondi 27"
    assert shops[0]["distance_km"] == 0.0
    assert shops[0]["google_maps_url"] is not None


def test_get_nearby_shops_thana_filter(client):
    response = client.get("/api/v1/shops/nearby?thana_area=Gulshan")
    assert response.status_code == 200
    shops = response.json()
    assert len(shops) == 1
    assert shops[0]["branch_name"] == "Gulshan 2"


def test_get_branch_details(client):
    response = client.get("/api/v1/shops/branches/branch-dhanmondi-27")
    assert response.status_code == 200
    data = response.json()
    assert data["branch_name"] == "Dhanmondi 27"
    assert data["city"] == "Dhaka"
