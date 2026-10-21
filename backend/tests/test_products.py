def test_lookup_by_barcode_success(client):
    # EAN for Teer 5L
    response = client.get("/api/v1/products/barcode/8941100100050")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "var-teer-5l"
    assert data["variant_name"] == "5 Litre Can"
    assert len(data["barcodes"]) >= 1
    assert data["barcodes"][0]["barcode"] == "8941100100050"


def test_lookup_by_barcode_not_found(client):
    response = client.get("/api/v1/products/barcode/0000000000000")
    assert response.status_code == 404
    assert "was not found" in response.json()["detail"]


def test_search_catalog_by_name(client):
    response = client.get("/api/v1/products/search?q=Teer")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 2
    # Check that variant names and prices are returned
    names = [item["variant_name"] for item in items]
    assert "1 Litre Pet Bottle" in names
    assert "5 Litre Can" in names


def test_search_catalog_by_barcode(client):
    response = client.get("/api/v1/products/search?q=8941100100012")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["variant_name"] == "1 Litre Pet Bottle"


def test_get_product_detail(client):
    response = client.get("/api/v1/products/prod-teer-1")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Teer Fortified Soyabean Oil"
    assert len(data["variants"]) == 2
