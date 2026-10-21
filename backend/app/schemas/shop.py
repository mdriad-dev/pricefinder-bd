from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ShopBranchBase(BaseModel):
    branch_name: str
    address: str
    city: str = "Dhaka"
    thana_area: Optional[str] = None
    latitude: float
    longitude: float
    phone_number: Optional[str] = None
    is_active: bool = True


class ShopBranchCreate(ShopBranchBase):
    shop_id: str


class ShopBranchResponse(ShopBranchBase):
    id: str
    shop_id: str
    created_at: datetime
    google_maps_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ShopBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    is_verified: bool = False


class ShopCreate(ShopBase):
    pass


class ShopResponse(ShopBase):
    id: str
    owner_id: Optional[str] = None
    created_at: datetime
    branches: List[ShopBranchResponse] = []

    model_config = ConfigDict(from_attributes=True)


class NearbyShopResponse(ShopBranchResponse):
    shop_name: str
    shop_is_verified: bool
    distance_km: float
    google_maps_url: str
