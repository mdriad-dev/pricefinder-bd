from sqlalchemy import Column, String, Numeric, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import generate_uuid, utc_now


class ProductListing(Base):
    __tablename__ = "product_listings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    variant_id = Column(String(36), ForeignKey("product_variants.id", ondelete="CASCADE"), nullable=False, index=True)
    shop_branch_id = Column(String(36), ForeignKey("shop_branches.id", ondelete="CASCADE"), nullable=True, index=True)
    price = Column(Numeric(12, 2), nullable=False)  # Current BDT price
    source_type = Column(String(30), default="shopkeeper", nullable=False)  # shopkeeper, authorized_partner, verified_crowd
    stock_status = Column(String(30), default="in_stock", nullable=False)  # in_stock, low_stock, out_of_stock, unknown
    is_verified = Column(Boolean, default=False, nullable=False)
    product_url = Column(String(500), nullable=True)
    last_verified_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    variant = relationship("ProductVariant", back_populates="listings")
    branch = relationship("ShopBranch", back_populates="listings")
    observations = relationship("PriceObservation", back_populates="listing", cascade="all, delete-orphan")
