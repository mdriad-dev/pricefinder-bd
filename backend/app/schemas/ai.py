from typing import Optional, List
from pydantic import BaseModel
from decimal import Decimal


class VisionCandidateProduct(BaseModel):
    product_name: str
    brand: Optional[str] = None
    suggested_variant: Optional[str] = None
    matched_variant_id: Optional[str] = None
    confidence_score: float = 0.0


class ImageIdentificationResponse(BaseModel):
    success: bool
    requires_user_confirmation: bool = True
    candidates: List[VisionCandidateProduct] = []
    message: str
