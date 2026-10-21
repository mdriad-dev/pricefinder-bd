import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

try:
    from app.main import app
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI(title="PriceFinder BD API")
    
    @app.get("/")
    def root():
        return {"app": "PriceFinder BD API", "status": "online"}
