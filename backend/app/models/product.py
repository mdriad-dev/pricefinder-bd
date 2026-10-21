from sqlalchemy import Column, String, Text, Numeric, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import generate_uuid, utc_now, TimestampMixin


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(150), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)

    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_name = Column(String(150), nullable=False)  # e.g., "500g Jar", "1 Litre Bottle", "128GB Black"
    unit = Column(String(50), nullable=True)  # e.g., "g", "kg", "ml", "L", "pcs"
    unit_value = Column(Numeric(10, 2), nullable=True)
    sku = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    product = relationship("Product", back_populates="variants")
    barcodes = relationship("ProductBarcode", back_populates="variant", cascade="all, delete-orphan")
    listings = relationship("ProductListing", back_populates="variant", cascade="all, delete-orphan")


class ProductBarcode(Base):
    __tablename__ = "product_barcodes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    variant_id = Column(String(36), ForeignKey("product_variants.id", ondelete="CASCADE"), nullable=False, index=True)
    barcode = Column(String(64), unique=True, nullable=False, index=True)
    barcode_type = Column(String(30), default="EAN-13", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    variant = relationship("ProductVariant", back_populates="barcodes")
