from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime
from app.core.database import Base
from app.models.base import generate_uuid, utc_now


class PriceReport(Base):
    __tablename__ = "price_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    variant_id = Column(String(36), ForeignKey("product_variants.id", ondelete="CASCADE"), nullable=False, index=True)
    shop_branch_id = Column(String(36), ForeignKey("shop_branches.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    reported_price = Column(Numeric(12, 2), nullable=False)
    receipt_image_url = Column(String(500), nullable=True)
    status = Column(String(20), default="pending", nullable=False)  # pending, approved, rejected
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
