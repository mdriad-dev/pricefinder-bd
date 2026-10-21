from decimal import Decimal
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.listing import ProductListing
from app.models.product import ProductVariant
from app.models.shop import ShopBranch, Shop
from app.models.observation import PriceObservation
from app.schemas.listing import PriceComparisonResponse, PriceComparisonItem
from app.services.geo import calculate_haversine_distance, build_google_maps_url


def compare_prices_for_variant(
    db: Session,
    variant_id: str,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    in_stock_only: bool = False,
) -> Optional[PriceComparisonResponse]:
    """
    Price Comparison Engine:
    - Returns comparable listings for a specific product variant
    - Distinguishes lowest listed price vs lowest verified and available (in-stock) price
    - Calculates distance & maps link if user coordinates provided
    - Sorts valid comparable listings by price
    """
    variant = (
        db.query(ProductVariant)
        .options(
            joinedload(ProductVariant.product),
            joinedload(ProductVariant.listings)
            .joinedload(ProductListing.branch)
            .joinedload(ShopBranch.shop),
        )
        .filter(ProductVariant.id == variant_id, ProductVariant.is_active.is_(True))
        .first()
    )

    if not variant:
        return None

    product = variant.product
    raw_listings = variant.listings

    items: List[PriceComparisonItem] = []
    for l in raw_listings:
        if in_stock_only and l.stock_status not in ["in_stock", "low_stock"]:
            continue

        branch = l.branch
        shop = branch.shop if branch else None
        shop_name = shop.name if shop else "Online Retailer"
        shop_is_verified = shop.is_verified if shop else False

        distance_km: Optional[float] = None
        maps_url: Optional[str] = None

        if branch:
            if user_lat is not None and user_lng is not None:
                distance_km = calculate_haversine_distance(
                    user_lat, user_lng, branch.latitude, branch.longitude
                )
            maps_url = build_google_maps_url(branch.latitude, branch.longitude)

        items.append(
            PriceComparisonItem(
                listing_id=l.id,
                shop_id=shop.id if shop else None,
                shop_name=shop_name,
                shop_is_verified=shop_is_verified,
                branch_id=branch.id if branch else None,
                branch_name=branch.branch_name if branch else None,
                address=branch.address if branch else None,
                thana_area=branch.thana_area if branch else None,
                price=l.price,
                currency="BDT",
                source_type=l.source_type,
                stock_status=l.stock_status,
                is_verified=l.is_verified,
                last_verified_at=l.last_verified_at,
                updated_at=l.updated_at,
                distance_km=distance_km,
                google_maps_url=maps_url,
                product_url=l.product_url,
            )
        )

    # Sort listings by price ascending
    items.sort(key=lambda x: x.price)

    all_prices = [item.price for item in items]
    verified_in_stock_prices = [
        item.price
        for item in items
        if item.is_verified and item.stock_status in ["in_stock", "low_stock"]
    ]

    lowest_listed = min(all_prices) if all_prices else None
    lowest_verified_available = (
        min(verified_in_stock_prices) if verified_in_stock_prices else None
    )

    return PriceComparisonResponse(
        product_id=product.id,
        product_name=product.name,
        brand=product.brand,
        category=product.category,
        image_url=product.image_url,
        variant_id=variant.id,
        variant_name=variant.variant_name,
        unit=variant.unit,
        unit_value=variant.unit_value,
        lowest_listed_price=lowest_listed,
        lowest_verified_available_price=lowest_verified_available,
        currency="BDT",
        total_listings=len(items),
        listings=items,
    )


def record_price_update(
    db: Session,
    listing: ProductListing,
    new_price: Decimal,
    new_stock_status: str,
    recorded_by_user_id: Optional[str] = None,
) -> ProductListing:
    """
    Updates a listing's price and stock, and creates an immutable price_observations audit record.
    """
    listing.price = new_price
    listing.stock_status = new_stock_status

    observation = PriceObservation(
        listing_id=listing.id,
        variant_id=listing.variant_id,
        price=new_price,
        stock_status=new_stock_status,
        recorded_by=recorded_by_user_id,
    )
    db.add(observation)
    db.commit()
    db.refresh(listing)
    return listing
