import os
import sys

# Add backend directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
if os.path.exists(backend_dir) and backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app
except Exception as e:
    from fastapi import FastAPI
    from fastapi.responses import FileResponse
    app = FastAPI(title="PriceFinder BD")

    @app.get("/")
    @app.get("/index.html")
    def fallback_root():
        for candidate in [
            os.path.join(current_dir, "dist", "index.html"),
            os.path.join(current_dir, "apps", "mobile", "dist", "index.html"),
        ]:
            if os.path.exists(candidate):
                return FileResponse(candidate)
        return {"app": "PriceFinder BD API", "status": "online"}
