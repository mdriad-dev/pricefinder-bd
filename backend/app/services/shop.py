from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.shop import Shop, ShopBranch
from app.schemas.shop import NearbyShopResponse
from app.services.geo import calculate_haversine_distance, build_google_maps_url


def find_nearby_shops(
    db: Session,
    user_lat: float,
    user_lng: float,
    radius_km: float = 10.0,
    thana_area: Optional[str] = None,
) -> List[NearbyShopResponse]:
    """
    Finds active shop branches near a given latitude/longitude or filtered by thana area.
    Sorted by closest distance.
    """
    query = (
        db.query(ShopBranch)
        .options(joinedload(ShopBranch.shop))
        .filter(ShopBranch.is_active.is_(True))
    )

    if thana_area:
        query = query.filter(ShopBranch.thana_area.ilike(f"%{thana_area.strip()}%"))

    branches = query.all()
    results: List[NearbyShopResponse] = []

    for branch in branches:
        dist = calculate_haversine_distance(user_lat, user_lng, branch.latitude, branch.longitude)
        if dist <= radius_km or thana_area:
            shop = branch.shop
            results.append(
                NearbyShopResponse(
                    id=branch.id,
                    shop_id=branch.shop_id,
                    shop_name=shop.name if shop else "Independent Shop",
                    shop_is_verified=shop.is_verified if shop else False,
                    branch_name=branch.branch_name,
                    address=branch.address,
                    city=branch.city,
                    thana_area=branch.thana_area,
                    latitude=branch.latitude,
                    longitude=branch.longitude,
                    phone_number=branch.phone_number,
                    is_active=branch.is_active,
                    created_at=branch.created_at,
                    distance_km=dist,
                    google_maps_url=build_google_maps_url(branch.latitude, branch.longitude),
                )
            )

    results.sort(key=lambda x: x.distance_km)
    return results


def get_shop_branch_details(db: Session, branch_id: str) -> Optional[ShopBranch]:
    return (
        db.query(ShopBranch)
        .options(
            joinedload(ShopBranch.shop),
            joinedload(ShopBranch.listings),
        )
        .filter(ShopBranch.id == branch_id)
        .first()
    )
