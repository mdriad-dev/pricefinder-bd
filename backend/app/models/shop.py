from sqlalchemy import Column, String, Text, Numeric, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import generate_uuid, utc_now


class Shop(Base):
    __tablename__ = "shops"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    owner_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    logo_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    branches = relationship("ShopBranch", back_populates="shop", cascade="all, delete-orphan")


class ShopBranch(Base):
    __tablename__ = "shop_branches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shop_id = Column(String(36), ForeignKey("shops.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), default="Dhaka", nullable=False)
    thana_area = Column(String(100), nullable=True, index=True)  # e.g., "Dhanmondi", "Gulshan", "Mirpur"
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone_number = Column(String(30), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    shop = relationship("Shop", back_populates="branches")
    listings = relationship("ProductListing", back_populates="branch", cascade="all, delete-orphan")
