from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from app.models.product import Product, ProductVariant, ProductBarcode
from app.models.listing import ProductListing
from app.schemas.product import ProductSearchItem


def get_variant_by_barcode(db: Session, barcode: str) -> Optional[ProductVariant]:
    """
    Priority 1 Identification: Lookup exact product variant by barcode.
    """
    clean_barcode = barcode.strip()
    barcode_entry = (
        db.query(ProductBarcode)
        .options(
            joinedload(ProductBarcode.variant).joinedload(ProductVariant.product),
            joinedload(ProductBarcode.variant).joinedload(ProductVariant.barcodes),
        )
        .filter(ProductBarcode.barcode == clean_barcode)
        .first()
    )
    if barcode_entry:
        return barcode_entry.variant
    return None


def search_catalog(
    db: Session,
    query: str,
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[ProductSearchItem]:
    """
    Priority 2 Identification: Multi-field search across product name, brand, variant name and barcode.
    """
    clean_query = query.strip()
    term = f"%{clean_query}%"

    # Find variants matching either product name, brand, variant name, or barcode
    q = (
        db.query(ProductVariant)
        .join(Product, Product.id == ProductVariant.product_id)
        .outerjoin(ProductBarcode, ProductBarcode.variant_id == ProductVariant.id)
        .options(
            joinedload(ProductVariant.product),
            joinedload(ProductVariant.barcodes),
            joinedload(ProductVariant.listings),
        )
        .filter(ProductVariant.is_active.is_(True))
    )

    if category:
        q = q.filter(Product.category.ilike(f"%{category.strip()}%"))

    if clean_query:
        q = q.filter(
            or_(
                Product.name.ilike(term),
                Product.brand.ilike(term),
                ProductVariant.variant_name.ilike(term),
                ProductBarcode.barcode.ilike(term),
            )
        )

    # Distinct variants
    variants = q.distinct().offset(offset).limit(limit).all()

    results: List[ProductSearchItem] = []
    for variant in variants:
        product = variant.product
        barcode_val = variant.barcodes[0].barcode if variant.barcodes else None

        # Price range from active listings
        active_listings = [listing for listing in variant.listings]
        prices = [float(listing.price) for listing in active_listings]
        min_p = min(prices) if prices else None
        max_p = max(prices) if prices else None

        results.append(
            ProductSearchItem(
                product_id=product.id,
                name=product.name,
                brand=product.brand,
                category=product.category,
                image_url=product.image_url,
                variant_id=variant.id,
                variant_name=variant.variant_name,
                barcode=barcode_val,
                lowest_price=min_p,
                highest_price=max_p,
                listings_count=len(active_listings),
            )
        )

    return results


def get_product_details(db: Session, product_id: str) -> Optional[Product]:
    return (
        db.query(Product)
        .options(
            joinedload(Product.variants).joinedload(ProductVariant.barcodes),
            joinedload(Product.variants).joinedload(ProductVariant.listings),
        )
        .filter(Product.id == product_id)
        .first()
    )


def get_variant_details(db: Session, variant_id: str) -> Optional[ProductVariant]:
    return (
        db.query(ProductVariant)
        .options(
            joinedload(ProductVariant.product),
            joinedload(ProductVariant.barcodes),
            joinedload(ProductVariant.listings).joinedload(ProductListing.branch),
        )
        .filter(ProductVariant.id == variant_id)
        .first()
    )
