from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.catalog import (
    get_variant_by_barcode,
    search_catalog,
    get_product_details,
    get_variant_details,
)
from app.schemas.product import (
    ProductResponse,
    ProductVariantResponse,
    ProductSearchItem,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/barcode/{barcode}", response_model=ProductVariantResponse)
def lookup_by_barcode(barcode: str, db: Session = Depends(get_db)):
    """
    Priority 1: Lookup exact product variant by barcode.
    Returns 404 if barcode is unknown in Bangladesh catalog.
    """
    variant = get_variant_by_barcode(db, barcode)
    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Barcode '{barcode}' was not found in the verified catalog. You can search by name or submit a price report.",
        )
    return variant


@router.get("/search", response_model=List[ProductSearchItem])
def search_products(
    q: str = Query("", description="Search term for product name, brand, model, or barcode"),
    category: Optional[str] = Query(None, description="Optional category filter"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    Priority 2: Full catalog search across product name, brand, variant, or barcode.
    """
    return search_catalog(db, query=q, category=category, limit=limit, offset=offset)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = get_product_details(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


@router.get("/variants/{variant_id}", response_model=ProductVariantResponse)
def get_variant(variant_id: str, db: Session = Depends(get_db)):
    variant = get_variant_details(db, variant_id)
    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product variant not found",
        )
    return variant
