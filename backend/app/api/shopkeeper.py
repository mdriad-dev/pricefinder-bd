from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.security import require_shopkeeper_or_admin
from app.schemas.profile import TokenPayload
from app.schemas.shop import ShopBranchCreate, ShopBranchResponse, ShopCreate, ShopResponse
from app.schemas.listing import (
    ProductListingCreate,
    ProductListingUpdate,
    ProductListingResponse,
)
from app.models.shop import Shop, ShopBranch
from app.models.listing import ProductListing
from app.models.product import ProductVariant
from app.services.pricing import record_price_update
from app.services.geo import build_google_maps_url

router = APIRouter(prefix="/shopkeeper", tags=["Shopkeeper Portal"])


@router.post("/shops", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
def register_or_claim_shop(
    payload: ShopCreate,
    current_user: TokenPayload = Depends(require_shopkeeper_or_admin),
    db: Session = Depends(get_db),
):
    """
    Shopkeeper registers a shop.
    Newly created shops default to unverified (is_verified=False) until reviewed.
    """
    shop = Shop(
        name=payload.name,
        owner_id=current_user.sub,
        logo_url=payload.logo_url,
        website_url=payload.website_url,
        is_verified=False,  # Administrative verification required
    )
    db.add(shop)
    db.commit()
    db.refresh(shop)
    return shop


@router.post("/branches", response_model=ShopBranchResponse, status_code=status.HTTP_201_CREATED)
def add_shop_branch(
    payload: ShopBranchCreate,
    current_user: TokenPayload = Depends(require_shopkeeper_or_admin),
    db: Session = Depends(get_db),
):
    """
    Add a physical branch with verified latitude and longitude.
    """
    shop = db.query(Shop).filter(Shop.id == payload.shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    if shop.owner_id != current_user.sub and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to add branches for this shop",
        )

    branch = ShopBranch(
        shop_id=shop.id,
        branch_name=payload.branch_name,
        address=payload.address,
        city=payload.city,
        thana_area=payload.thana_area,
        latitude=payload.latitude,
        longitude=payload.longitude,
        phone_number=payload.phone_number,
        is_active=True,
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)

    resp = ShopBranchResponse.model_validate(branch)
    resp.google_maps_url = build_google_maps_url(branch.latitude, branch.longitude)
    return resp


@router.post("/listings", response_model=ProductListingResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_listing(
    payload: ProductListingCreate,
    current_user: TokenPayload = Depends(require_shopkeeper_or_admin),
    db: Session = Depends(get_db),
):
    """
    Create or update a listing for a product variant at the shopkeeper's branch.
    Enforces branch ownership.
    """
    branch = db.query(ShopBranch).options(joinedload(ShopBranch.shop)).filter(ShopBranch.id == payload.shop_branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Shop branch not found")
    if branch.shop.owner_id != current_user.sub and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You do not own this shop branch and cannot edit its listings",
        )

    variant = db.query(ProductVariant).filter(ProductVariant.id == payload.variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Product variant not found")

    # Check if listing already exists
    listing = (
        db.query(ProductListing)
        .filter(
            ProductListing.shop_branch_id == branch.id,
            ProductListing.variant_id == variant.id,
        )
        .first()
    )

    if listing:
        listing = record_price_update(
            db=db,
            listing=listing,
            new_price=payload.price,
            new_stock_status=payload.stock_status,
            recorded_by_user_id=current_user.sub,
        )
    else:
        listing = ProductListing(
            variant_id=variant.id,
            shop_branch_id=branch.id,
            price=payload.price,
            stock_status=payload.stock_status,
            source_type="shopkeeper",
            is_verified=branch.shop.is_verified,
        )
        db.add(listing)
        db.commit()
        db.refresh(listing)

        record_price_update(
            db=db,
            listing=listing,
            new_price=payload.price,
            new_stock_status=payload.stock_status,
            recorded_by_user_id=current_user.sub,
        )

    return listing


@router.get("/my-listings", response_model=List[ProductListingResponse])
def get_my_listings(
    current_user: TokenPayload = Depends(require_shopkeeper_or_admin),
    db: Session = Depends(get_db),
):
    """
    Returns all product listings associated with the logged-in shopkeeper's shops.
    """
    listings = (
        db.query(ProductListing)
        .join(ShopBranch, ShopBranch.id == ProductListing.shop_branch_id)
        .join(Shop, Shop.id == ShopBranch.shop_id)
        .filter(Shop.owner_id == current_user.sub)
        .all()
    )
    return listings
