import sys
import os
from decimal import Decimal

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, Base, engine
from app.models.profile import Profile
from app.models.product import Product, ProductVariant, ProductBarcode
from app.models.shop import Shop, ShopBranch
from app.models.listing import ProductListing
from app.models.observation import PriceObservation


def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Product).first():
            print("Database already contains product catalog records. Skipping seed.")
            return

        print("Seeding sample Bangladesh retail products and verified shops...")

        # 1. Profiles (Sample Shopkeeper & Consumer)
        shopkeeper_profile = Profile(
            email="shopkeeper.sample@pricefinderbd.local",
            full_name="Abdur Rahman (Sample Shopkeeper)",
            phone_number="+8801711000001",
            role="shopkeeper",
        )
        consumer_profile = Profile(
            email="user.sample@pricefinderbd.local",
            full_name="Tanvir Ahmed (Sample Consumer)",
            phone_number="+8801811000002",
            role="consumer",
        )
        db.add_all([shopkeeper_profile, consumer_profile])
        db.flush()

        # 2. Sample Shops & Branches (Dhaka locations)
        shop_shwapno = Shop(
            name="[Sample] Shwapno Super Shop",
            logo_url="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200",
            is_verified=True,
            owner_id=shopkeeper_profile.id,
        )
        shop_agora = Shop(
            name="[Sample] Agora Superstore",
            logo_url="https://images.unsplash.com/photo-1542838132-92c53300491e?w=200",
            is_verified=True,
        )
        shop_daily = Shop(
            name="[Sample] Daily Shopping",
            logo_url="https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200",
            is_verified=True,
        )
        shop_local = Shop(
            name="[Sample] Bhai Bhai General Store",
            logo_url=None,
            is_verified=False,
            owner_id=shopkeeper_profile.id,
        )
        db.add_all([shop_shwapno, shop_agora, shop_daily, shop_local])
        db.flush()

        branch_shwapno_dhanmondi = ShopBranch(
            shop_id=shop_shwapno.id,
            branch_name="Dhanmondi 27 Branch",
            address="House 12, Road 27 (Old), Dhanmondi, Dhaka-1209",
            city="Dhaka",
            thana_area="Dhanmondi",
            latitude=23.7538,
            longitude=90.3752,
            phone_number="+8801700123456",
            is_active=True,
        )
        branch_agora_gulshan = ShopBranch(
            shop_id=shop_agora.id,
            branch_name="Gulshan 2 Outlet",
            address="Plot 15, Road 46, Gulshan 2, Dhaka-1212",
            city="Dhaka",
            thana_area="Gulshan",
            latitude=23.7937,
            longitude=90.4137,
            phone_number="+8801700654321",
            is_active=True,
        )
        branch_daily_mirpur = ShopBranch(
            shop_id=shop_daily.id,
            branch_name="Mirpur 10 Branch",
            address="Block C, Main Road, Mirpur 10, Dhaka-1216",
            city="Dhaka",
            thana_area="Mirpur",
            latitude=23.8069,
            longitude=90.3687,
            phone_number="+8801800112233",
            is_active=True,
        )
        branch_bhai_bhai = ShopBranch(
            shop_id=shop_local.id,
            branch_name="Dhanmondi 32 Corner",
            address="Lake Circus, Kalabagan / Dhanmondi 32, Dhaka",
            city="Dhaka",
            thana_area="Dhanmondi",
            latitude=23.7505,
            longitude=90.3780,
            phone_number="+8801911998877",
            is_active=True,
        )
        db.add_all([branch_shwapno_dhanmondi, branch_agora_gulshan, branch_daily_mirpur, branch_bhai_bhai])
        db.flush()

        # 3. Canonical Products & Exact Variants
        # Product 1: Teer Fortified Soyabean Oil
        prod_teer = Product(
            name="Teer Fortified Soyabean Oil",
            brand="Teer",
            category="Edible Oil & Cooking Essentials",
            description="Premium quality fortified edible oil enriched with Vitamin A & D by City Group Bangladesh.",
            image_url="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",
        )
        db.add(prod_teer)
        db.flush()

        v_teer_1l = ProductVariant(
            product_id=prod_teer.id,
            variant_name="1 Litre Pet Bottle",
            unit="L",
            unit_value=Decimal("1.0"),
            sku="TEER-OIL-1L",
            is_active=True,
        )
        v_teer_5l = ProductVariant(
            product_id=prod_teer.id,
            variant_name="5 Litre Poly/Pet Can",
            unit="L",
            unit_value=Decimal("5.0"),
            sku="TEER-OIL-5L",
            is_active=True,
        )
        db.add_all([v_teer_1l, v_teer_5l])
        db.flush()

        b_teer_1l = ProductBarcode(variant_id=v_teer_1l.id, barcode="8941100100012", barcode_type="EAN-13")
        b_teer_5l = ProductBarcode(variant_id=v_teer_5l.id, barcode="8941100100050", barcode_type="EAN-13")
        db.add_all([b_teer_1l, b_teer_5l])

        # Product 2: Aarong Dairy Pure Ghee
        prod_aarong = Product(
            name="Aarong Dairy Pure Ghee",
            brand="Aarong Dairy",
            category="Dairy & Breakfast",
            description="Traditional aromatic pure milk fat ghee produced by BRAC Dairy.",
            image_url="https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500",
        )
        db.add(prod_aarong)
        db.flush()

        v_ghee_400g = ProductVariant(
            product_id=prod_aarong.id,
            variant_name="400g Glass Jar",
            unit="g",
            unit_value=Decimal("400"),
            sku="AARONG-GHEE-400G",
        )
        v_ghee_900g = ProductVariant(
            product_id=prod_aarong.id,
            variant_name="900g Tin",
            unit="g",
            unit_value=Decimal("900"),
            sku="AARONG-GHEE-900G",
        )
        db.add_all([v_ghee_400g, v_ghee_900g])
        db.flush()

        b_ghee_400g = ProductBarcode(variant_id=v_ghee_400g.id, barcode="8941122004005", barcode_type="EAN-13")
        b_ghee_900g = ProductBarcode(variant_id=v_ghee_900g.id, barcode="8941122009000", barcode_type="EAN-13")
        db.add_all([b_ghee_400g, b_ghee_900g])

        # Product 3: Samsung Galaxy A15
        prod_samsung = Product(
            name="Samsung Galaxy A15 4G",
            brand="Samsung",
            category="Smartphones & Electronics",
            description="6.5-inch Super AMOLED 90Hz display, 50MP triple camera, 5000mAh battery. Official BTRC approved.",
            image_url="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
        )
        db.add(prod_samsung)
        db.flush()

        v_sam_128 = ProductVariant(
            product_id=prod_samsung.id,
            variant_name="6GB RAM / 128GB (Official)",
            unit="pcs",
            unit_value=Decimal("1"),
            sku="SAM-A15-6-128",
        )
        v_sam_256 = ProductVariant(
            product_id=prod_samsung.id,
            variant_name="8GB RAM / 256GB (Official)",
            unit="pcs",
            unit_value=Decimal("1"),
            sku="SAM-A15-8-256",
        )
        db.add_all([v_sam_128, v_sam_256])
        db.flush()

        b_sam_128 = ProductBarcode(variant_id=v_sam_128.id, barcode="8806091234567", barcode_type="EAN-13")
        b_sam_256 = ProductBarcode(variant_id=v_sam_256.id, barcode="8806091234574", barcode_type="EAN-13")
        db.add_all([b_sam_128, b_sam_256])

        # 4. Product Listings & Historical Observations
        # Teer 5L listings
        l1 = ProductListing(
            variant_id=v_teer_5l.id,
            shop_branch_id=branch_shwapno_dhanmondi.id,
            price=Decimal("845.00"),
            stock_status="in_stock",
            source_type="shopkeeper",
            is_verified=True,
        )
        l2 = ProductListing(
            variant_id=v_teer_5l.id,
            shop_branch_id=branch_agora_gulshan.id,
            price=Decimal("850.00"),
            stock_status="in_stock",
            source_type="shopkeeper",
            is_verified=True,
        )
        l3 = ProductListing(
            variant_id=v_teer_5l.id,
            shop_branch_id=branch_daily_mirpur.id,
            price=Decimal("840.00"),  # Lowest price!
            stock_status="low_stock",
            source_type="shopkeeper",
            is_verified=True,
        )
        l4 = ProductListing(
            variant_id=v_teer_5l.id,
            shop_branch_id=branch_bhai_bhai.id,
            price=Decimal("835.00"),  # Lower but unverified crowd listing
            stock_status="in_stock",
            source_type="verified_crowd",
            is_verified=False,
        )
        db.add_all([l1, l2, l3, l4])
        db.flush()

        # Observations
        for l in [l1, l2, l3, l4]:
            obs = PriceObservation(
                listing_id=l.id,
                variant_id=l.variant_id,
                price=l.price,
                stock_status=l.stock_status,
                recorded_by=shopkeeper_profile.id,
            )
            db.add(obs)

        # Ghee 400g listings
        l_ghee1 = ProductListing(
            variant_id=v_ghee_400g.id,
            shop_branch_id=branch_shwapno_dhanmondi.id,
            price=Decimal("590.00"),
            stock_status="in_stock",
            source_type="shopkeeper",
            is_verified=True,
        )
        l_ghee2 = ProductListing(
            variant_id=v_ghee_400g.id,
            shop_branch_id=branch_agora_gulshan.id,
            price=Decimal("585.00"),
            stock_status="in_stock",
            source_type="shopkeeper",
            is_verified=True,
        )
        db.add_all([l_ghee1, l_ghee2])
        db.flush()

        for lg in [l_ghee1, l_ghee2]:
            db.add(
                PriceObservation(
                    listing_id=lg.id,
                    variant_id=lg.variant_id,
                    price=lg.price,
                    stock_status=lg.stock_status,
                )
            )

        db.commit()
        print("Sample Bangladesh catalog seeded successfully with verified test items.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
