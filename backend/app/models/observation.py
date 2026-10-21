from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import generate_uuid, utc_now


class PriceObservation(Base):
    __tablename__ = "price_observations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    listing_id = Column(String(36), ForeignKey("product_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_id = Column(String(36), ForeignKey("product_variants.id", ondelete="CASCADE"), nullable=False, index=True)
    price = Column(Numeric(12, 2), nullable=False)
    stock_status = Column(String(30), nullable=False)
    recorded_by = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    observed_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    listing = relationship("ProductListing", back_populates="observations")
