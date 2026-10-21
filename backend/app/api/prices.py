from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.pricing import compare_prices_for_variant
from app.schemas.listing import PriceComparisonResponse

router = APIRouter(prefix="/prices", tags=["Price Comparison"])


@router.get("/compare/{variant_id}", response_model=PriceComparisonResponse)
def compare_prices(
    variant_id: str,
    lat: Optional[float] = Query(None, description="User latitude for distance calculation"),
    lng: Optional[float] = Query(None, description="User longitude for distance calculation"),
    in_stock_only: bool = Query(False, description="Filter only currently in-stock listings"),
    db: Session = Depends(get_db),
):
    """
    Compare prices for an exact confirmed product variant.
    Returns listings sorted by price, distinguishing lowest listed vs lowest verified available price.
    """
    res = compare_prices_for_variant(
        db=db,
        variant_id=variant_id,
        user_lat=lat,
        user_lng=lng,
        in_stock_only=in_stock_only,
    )
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product variant not found or has no active listings",
        )
    return res
