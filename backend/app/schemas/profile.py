from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class ProfileBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    role: str = "consumer"  # consumer, shopkeeper, admin


class ProfileCreate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenPayload(BaseModel):
    sub: str
    email: Optional[str] = None
    role: Optional[str] = "consumer"
    exp: Optional[int] = None
