from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.vision import identify_product_image
from app.schemas.ai import ImageIdentificationResponse

router = APIRouter(prefix="/ai", tags=["AI Vision Identification"])

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]


@router.post("/identify-product", response_model=ImageIdentificationResponse)
async def identify_product(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Image-based Product Identification:
    Upload a product photo to identify candidate products and brands.
    Never automatically verifies catalog entries. Low confidence requires user confirmation.
    """
    if image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format: {image.content_type}. Only JPEG, PNG, and WebP are allowed.",
        )

    image_bytes = await image.read()
    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file size exceeds the 5MB maximum limit.",
        )

    return await identify_product_image(
        db=db,
        image_bytes=image_bytes,
        mime_type=image.content_type,
    )
