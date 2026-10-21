import base64
from typing import Optional, List
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.schemas.ai import ImageIdentificationResponse, VisionCandidateProduct
from app.models.product import Product, ProductVariant


async def identify_product_image(
    db: Session,
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
) -> ImageIdentificationResponse:
    """
    Image-based Product Identification:
    - If GEMINI_API_KEY is configured on backend, calls Google Gemini Vision.
    - If unconfigured, safely falls back with a clear user-facing message.
    - Never automatically creates verified records from AI guesses.
    - Flags requires_user_confirmation = True.
    """
    if not settings.GEMINI_API_KEY:
        # Graceful fallback without failing the app
        return ImageIdentificationResponse(
            success=False,
            requires_user_confirmation=True,
            candidates=[],
            message="AI Vision provider is not configured. Please use Barcode Scanning or Search by Name."
        )

    b64_data = base64.b64encode(image_bytes).decode("utf-8")
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"

    prompt = (
        "Identify the packaged consumer product shown in this image for the Bangladesh retail market. "
        "Return the product brand, product title/name, and specific variant or size/weight if visible. "
        "Format your answer strictly as: BRAND | PRODUCT_NAME | VARIANT"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": b64_data,
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 100,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(api_url, json=payload)
            if resp.status_code != 200:
                return ImageIdentificationResponse(
                    success=False,
                    requires_user_confirmation=True,
                    candidates=[],
                    message=f"Vision provider returned status {resp.status_code}. Try barcode scanning or manual search.",
                )

            data = resp.json()
            candidates_raw = data.get("candidates", [])
            if not candidates_raw:
                return ImageIdentificationResponse(
                    success=False,
                    requires_user_confirmation=True,
                    candidates=[],
                    message="Could not identify any product in this image. Please ensure good lighting and clear packaging.",
                )

            text_output = (
                candidates_raw[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
                .strip()
            )

            parts = [p.strip() for p in text_output.split("|")]
            brand = parts[0] if len(parts) > 0 else ""
            p_name = parts[1] if len(parts) > 1 else text_output
            v_name = parts[2] if len(parts) > 2 else ""

            # Check database for closest matching variant
            matched_variant = None
            if brand or p_name:
                q = db.query(ProductVariant).join(Product, Product.id == ProductVariant.product_id)
                if brand:
                    q = q.filter(Product.brand.ilike(f"%{brand}%"))
                matched_variant = q.first()

            return ImageIdentificationResponse(
                success=True,
                requires_user_confirmation=True,
                candidates=[
                    VisionCandidateProduct(
                        product_name=p_name or "Recognized Product",
                        brand=brand or None,
                        suggested_variant=v_name or None,
                        matched_variant_id=matched_variant.id if matched_variant else None,
                        confidence_score=0.82 if matched_variant else 0.65,
                    )
                ],
                message="Product recognized. Please confirm the exact variant before viewing prices.",
            )
    except Exception as e:
        return ImageIdentificationResponse(
            success=False,
            requires_user_confirmation=True,
            candidates=[],
            message=f"Vision identification error: {str(e)}",
        )
