from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class ProductBarcodeBase(BaseModel):
    barcode: str
    barcode_type: str = "EAN-13"


class ProductBarcodeResponse(ProductBarcodeBase):
    id: str
    variant_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductVariantBase(BaseModel):
    variant_name: str
    unit: Optional[str] = None
    unit_value: Optional[Decimal] = None
    sku: Optional[str] = None
    is_active: bool = True


class ProductVariantCreate(ProductVariantBase):
    product_id: str


class ProductVariantResponse(ProductVariantBase):
    id: str
    product_id: str
    created_at: datetime
    barcodes: List[ProductBarcodeResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    name: str
    brand: str
    category: str
    description: Optional[str] = None
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime
    variants: List[ProductVariantResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ProductSearchItem(BaseModel):
    product_id: str
    name: str
    brand: str
    category: str
    image_url: Optional[str] = None
    variant_id: str
    variant_name: str
    barcode: Optional[str] = None
    lowest_price: Optional[Decimal] = None
    highest_price: Optional[Decimal] = None
    listings_count: int = 0
