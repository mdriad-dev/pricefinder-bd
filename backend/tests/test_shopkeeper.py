from decimal import Decimal
from app.models.observation import PriceObservation


def test_shopkeeper_register_shop(client, shopkeeper_auth_headers):
    payload = {
        "name": "New Shwapno Express",
        "logo_url": "https://example.com/logo.png",
        "website_url": "https://example.com",
    }
    response = client.post("/api/v1/shopkeeper/shops", json=payload, headers=shopkeeper_auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Shwapno Express"
    # Administrative verification required
    assert data["is_verified"] is False


def test_consumer_cannot_register_shop(client, consumer_auth_headers):
    payload = {"name": "Unauthorized Shop"}
    response = client.post("/api/v1/shopkeeper/shops", json=payload, headers=consumer_auth_headers)
    assert response.status_code == 403


def test_shopkeeper_create_or_update_listing(client, shopkeeper_auth_headers, db_session):
    # Update price of Teer 5L at Shwapno Dhanmondi 27
    payload = {
        "variant_id": "var-teer-5l",
        "shop_branch_id": "branch-dhanmondi-27",
        "price": 860.00,
        "stock_status": "low_stock",
    }
    response = client.post("/api/v1/shopkeeper/listings", json=payload, headers=shopkeeper_auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert float(data["price"]) == 860.00
    assert data["stock_status"] == "low_stock"

    # Check that an observation audit log was created
    obs = db_session.query(PriceObservation).filter(PriceObservation.listing_id == data["id"]).all()
    assert len(obs) >= 1
    assert float(obs[-1].price) == 860.00


def test_shopkeeper_cannot_modify_other_shop(client, shopkeeper_auth_headers):
    # Try updating listing on branch-gulshan-2 which belongs to other shopkeeper (sk-uuid-2)
    payload = {
        "variant_id": "var-teer-5l",
        "shop_branch_id": "branch-gulshan-2",
        "price": 750.00,
        "stock_status": "in_stock",
    }
    response = client.post("/api/v1/shopkeeper/listings", json=payload, headers=shopkeeper_auth_headers)
    assert response.status_code == 403
    assert "not own this shop branch" in response.json()["detail"]
