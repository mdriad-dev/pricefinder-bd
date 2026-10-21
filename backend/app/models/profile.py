from sqlalchemy import Column, String, DateTime
from app.core.database import Base
from app.models.base import generate_uuid, utc_now, TimestampMixin


class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(30), nullable=True)
    role = Column(String(20), nullable=False, default="consumer")  # consumer, shopkeeper, admin
