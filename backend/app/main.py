from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api import products, prices, shops, shopkeeper, auth, ai

# Initialize tables
Base.metadata.create_all(bind=engine)

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


@app.get("/")
def root():
    return {
        "app": "PriceFinder BD API",
        "status": "online",
        "currency": "BDT",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
