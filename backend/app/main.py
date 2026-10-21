import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import Base, engine
from app.api import products, prices, shops, shopkeeper, auth, ai

# Initialize tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database initialization warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Product price comparison and nearby shop discovery application for Bangladesh.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for mobile client & web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
prefix = settings.API_V1_PREFIX
app.include_router(products.router, prefix=prefix)
app.include_router(prices.router, prefix=prefix)
app.include_router(shops.router, prefix=prefix)
app.include_router(shopkeeper.router, prefix=prefix)
app.include_router(auth.router, prefix=prefix)
app.include_router(ai.router, prefix=prefix)


def get_web_dist_dir() -> str | None:
    candidates = [
        os.path.join(os.getcwd(), "dist"),
        os.path.join(os.getcwd(), "apps", "mobile", "dist"),
        os.path.join(os.getcwd(), "backend", "dist"),
        os.path.join(os.path.dirname(__file__), "..", "..", "dist"),
        os.path.join(os.path.dirname(__file__), "..", "..", "apps", "mobile", "dist"),
    ]
    for c in candidates:
        if os.path.exists(os.path.join(c, "index.html")):
            return os.path.abspath(c)
    return None


web_dist = get_web_dist_dir()
if web_dist:
    expo_dir = os.path.join(web_dist, "_expo")
    if os.path.exists(expo_dir):
        app.mount("/_expo", StaticFiles(directory=expo_dir), name="expo-static")
    assets_dir = os.path.join(web_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="expo-assets")


@app.get("/")
@app.get("/index.html")
def root():
    dist = get_web_dist_dir()
    if dist:
        index_file = os.path.join(dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
    return {
        "app": "PriceFinder BD API",
        "status": "online",
        "currency": "BDT",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
