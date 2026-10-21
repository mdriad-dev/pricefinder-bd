import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models.profile import Profile
from app.models.product import Product, ProductVariant, ProductBarcode
from app.models.shop import Shop, ShopBranch
from app.models.listing import ProductListing
from app.core.security import create_access_token

# In-memory SQLite for high-speed, isolated test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Seed core test records
    # 1. Profiles
    shopkeeper = Profile(
        id="sk-uuid-1",
        email="shopkeeper@test.com",
        full_name="Test Shopkeeper",
        role="shopkeeper",
    )
    other_shopkeeper = Profile(
        id="sk-uuid-2",
        email="other_sk@test.com",
        full_name="Other Shopkeeper",
        role="shopkeeper",
    )
    consumer = Profile(
        id="user-uuid-1",
        email="consumer@test.com",
        full_name="Test Consumer",
        role="consumer",
    )
    session.add_all([shopkeeper, other_shopkeeper, consumer])
    session.flush()

    # 2. Product & Variants
    prod = Product(
        id="prod-teer-1",
        name="Teer Fortified Soyabean Oil",
        brand="Teer",
        category="Edible Oil",
        description="Enriched with Vitamin A & D",
    )
    session.add(prod)
    session.flush()

    var_1l = ProductVariant(
        id="var-teer-1l",
        product_id=prod.id,
        variant_name="1 Litre Pet Bottle",
        unit="L",
        unit_value=Decimal("1.0"),
    )
    var_5l = ProductVariant(
        id="var-teer-5l",
        product_id=prod.id,
        variant_name="5 Litre Can",
        unit="L",
        unit_value=Decimal("5.0"),
    )
    session.add_all([var_1l, var_5l])
    session.flush()

    # Barcodes
    bc_1l = ProductBarcode(
        id="bc-1l",
        variant_id=var_1l.id,
        barcode="8941100100012",
        barcode_type="EAN-13",
    )
    bc_5l = ProductBarcode(
        id="bc-5l",
        variant_id=var_5l.id,
        barcode="8941100100050",
        barcode_type="EAN-13",
    )
    session.add_all([bc_1l, bc_5l])

    # 3. Shops & Branches
    shop1 = Shop(
        id="shop-shwapno",
        name="Shwapno Super Shop",
        owner_id=shopkeeper.id,
        is_verified=True,
    )
    shop2 = Shop(
        id="shop-other",
        name="Other Local Shop",
        owner_id=other_shopkeeper.id,
        is_verified=False,
    )
    session.add_all([shop1, shop2])
    session.flush()

    branch1 = ShopBranch(
        id="branch-dhanmondi-27",
        shop_id=shop1.id,
        branch_name="Dhanmondi 27",
        address="Road 27, Dhanmondi, Dhaka",
        city="Dhaka",
        thana_area="Dhanmondi",
        latitude=23.7538,
        longitude=90.3752,
    )
    branch2 = ShopBranch(
        id="branch-gulshan-2",
        shop_id=shop2.id,
        branch_name="Gulshan 2",
        address="Gulshan 2 Circle, Dhaka",
        city="Dhaka",
        thana_area="Gulshan",
        latitude=23.7937,
        longitude=90.4137,
    )
    session.add_all([branch1, branch2])
    session.flush()

    # 4. Listings
    # Listing 1: Shwapno Dhanmondi (Verified, 845 BDT, in_stock)
    l1 = ProductListing(
        id="list-1",
        variant_id=var_5l.id,
        shop_branch_id=branch1.id,
        price=Decimal("845.00"),
        source_type="shopkeeper",
        stock_status="in_stock",
        is_verified=True,
    )
    # Listing 2: Other Local Shop (Unverified, 830 BDT, in_stock - lowest listed)
    l2 = ProductListing(
        id="list-2",
        variant_id=var_5l.id,
        shop_branch_id=branch2.id,
        price=Decimal("830.00"),
        source_type="verified_crowd",
        stock_status="in_stock",
        is_verified=False,
    )
    session.add_all([l1, l2])
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def shopkeeper_auth_headers():
    token = create_access_token({"sub": "sk-uuid-1", "email": "shopkeeper@test.com", "role": "shopkeeper"})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def consumer_auth_headers():
    token = create_access_token({"sub": "user-uuid-1", "email": "consumer@test.com", "role": "consumer"})
    return {"Authorization": f"Bearer {token}"}
