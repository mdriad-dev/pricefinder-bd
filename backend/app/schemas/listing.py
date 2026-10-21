from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class ProductListingBase(BaseModel):
    variant_id: str
    shop_branch_id: Optional[str] = None
    price: Decimal = Field(..., ge=0, description="Price in Bangladeshi Taka (BDT)")
    source_type: str = "shopkeeper"
    stock_status: str = "in_stock"  # in_stock, low_stock, out_of_stock, unknown
    is_verified: bool = False
    product_url: Optional[str] = None


class ProductListingCreate(BaseModel):
    variant_id: str
    shop_branch_id: str
    price: Decimal = Field(..., ge=0)
    stock_status: str = "in_stock"


class ProductListingUpdate(BaseModel):
    price: Optional[Decimal] = Field(None, ge=0)
    stock_status: Optional[str] = None


class ProductListingResponse(ProductListingBase):
    id: str
    last_verified_at: Optional[datetime] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PriceComparisonItem(BaseModel):
    listing_id: str
    shop_id: Optional[str] = None
    shop_name: str
    shop_is_verified: bool = False
    branch_id: Optional[str] = None
    branch_name: Optional[str] = None
    address: Optional[str] = None
    thana_area: Optional[str] = None
    price: Decimal
    currency: str = "BDT"
    source_type: str
    stock_status: str
    is_verified: bool
    last_verified_at: Optional[datetime] = None
    updated_at: datetime
    distance_km: Optional[float] = None
    google_maps_url: Optional[str] = None
    product_url: Optional[str] = None


class PriceComparisonResponse(BaseModel):
    product_id: str
    product_name: str
    brand: str
    category: str
    image_url: Optional[str] = None
    variant_id: str
    variant_name: str
    unit: Optional[str] = None
    unit_value: Optional[Decimal] = None
    lowest_listed_price: Optional[Decimal] = None
    lowest_verified_available_price: Optional[Decimal] = None
    currency: str = "BDT"
    total_listings: int = 0
    listings: List[PriceComparisonItem] = []
