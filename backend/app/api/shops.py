from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.shop import find_nearby_shops, get_shop_branch_details
from app.schemas.shop import NearbyShopResponse, ShopBranchResponse

router = APIRouter(prefix="/shops", tags=["Shops & Map"])


@router.get("/nearby", response_model=List[NearbyShopResponse])
def get_nearby_shops(
    lat: float = Query(23.7465, description="Latitude (defaults to Dhaka center)"),
    lng: float = Query(90.3843, description="Longitude (defaults to Dhaka center)"),
    radius_km: float = Query(10.0, ge=0.5, le=100.0, description="Radius in kilometers"),
    thana_area: Optional[str] = Query(None, description="Optional fallback thana area e.g. Dhanmondi, Gulshan"),
    db: Session = Depends(get_db),
):
    """
    Find nearby verified and community shop branches with distance and navigation links.
    """
    return find_nearby_shops(
        db=db,
        user_lat=lat,
        user_lng=lng,
        radius_km=radius_km,
        thana_area=thana_area,
    )


@router.get("/branches/{branch_id}", response_model=ShopBranchResponse)
def get_branch_details(branch_id: str, db: Session = Depends(get_db)):
    branch = get_shop_branch_details(db, branch_id)
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop branch not found",
        )
    return branch
