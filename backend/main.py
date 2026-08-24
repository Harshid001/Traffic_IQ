import sys
import os
import logging
import sqlite3
from pathlib import Path

# Ensure root and backend directory are in sys.path for Vercel serverless runtime
_current_dir = Path(__file__).resolve().parent
_root_dir = _current_dir.parent
for _p in [str(_root_dir), str(_current_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx

try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT if 'settings' in locals() else "60/minute"])
    HAS_SLOWAPI = True
except Exception:
    HAS_SLOWAPI = False
    limiter = None

from backend.config import settings
from backend.database.db import get_db_connection, init_db
from backend.api.routes import router as routes_router
from backend.api.traffic import router as traffic_router
from backend.api.forecast import router as forecast_router
from backend.api.evaluation import router as evaluation_router
from backend.api.alerts import router as alerts_router
from backend.api.navigation import router as navigation_router
from backend.forecasting.chronos_service import chronos_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if settings.REQUIRE_API_KEY:
        if not api_key or api_key != settings.API_KEY:
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing X-API-Key header")
    return api_key

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Predictive Traffic Intelligence Navigation System...")
    init_db()
    try:
        from backend.database.seed_data import seed_database
        seed_database()
        logger.info("Database verified and seeded successfully.")
    except Exception as e:
        logger.warning(f"Database auto-seeding notice: {e}")
    yield
    logger.info("Shutting down backend services.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Predictive, Explainable Traffic-Intelligence Navigation Engine featuring Chronos-2 Forecasting and Zero-Hallucination Local AI.",
    lifespan=lifespan
)

if HAS_SLOWAPI and limiter:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware with restricted trusted origins (PRD-002)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Optional API Key Authentication Middleware for /api routes
@app.middleware("http")
async def auth_and_rate_limit_middleware(request: Request, call_next):
    # Bypass auth for health check, docs, openapi, and OPTIONS preflight
    if request.method == "OPTIONS" or request.url.path in ["/api/health", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
        
    if settings.REQUIRE_API_KEY:
        key = request.headers.get("X-API-Key")
        if not key or key != settings.API_KEY:
            return JSONResponse(status_code=401, content={"detail": "Unauthorized: Invalid or missing X-API-Key header"})
            
    return await call_next(request)

# Include API Routers
app.include_router(routes_router, prefix="/api/routes", tags=["Routes & Scoring"])
app.include_router(navigation_router, prefix="/api/navigation", tags=["Mobile Driving Cockpit Navigation"])
app.include_router(traffic_router, prefix="/api/traffic", tags=["Traffic Analytics & DNA"])
app.include_router(forecast_router, prefix="/api/forecast", tags=["Chronos-2 Forecasting"])
app.include_router(evaluation_router, prefix="/api/evaluation", tags=["Model Benchmark"])
app.include_router(alerts_router, prefix="/api/alerts", tags=["Predictive Road Alerts"])

@app.get("/api/health")
async def health_check():
    # 1. Check Database connectivity
    db_ok = False
    db_details = "Disconnected"
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM segment_history")
        count = cur.fetchone()[0]
        conn.close()
        db_ok = True
        db_details = f"SQLite Online ({count} records)"
    except Exception as e:
        db_details = f"Error: {str(e)}"

    # 2. Check Ollama status
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=1.0) as client:
            resp = await client.get(f"{settings.OLLAMA_URL}/api/tags")
            ollama_ok = (resp.status_code == 200)
    except Exception:
        ollama_ok = False

    # 3. Check Local OSRM status
    osrm_local_ok = False
    try:
        async with httpx.AsyncClient(timeout=1.0) as client:
            resp = await client.get(settings.LOCAL_OSRM_URL)
            osrm_local_ok = (resp.status_code in [200, 400])
    except Exception:
        osrm_local_ok = False

    # 4. Check Chronos-2 Status
    chronos_status = "Official Chronos-2 (amazon/chronos-2)" if chronos_service.pipeline else "Heuristic Momentum Fallback (Active)"

    return {
        "status": "healthy" if db_ok else "degraded",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "services": {
            "database": db_details,
            "traffic_layer": f"{settings.TRAFFIC_MODE.upper()} MODE",
            "forecasting_engine": chronos_status,
            "local_osrm": "Connected" if osrm_local_ok else "Fallback Ready (Public OSRM)",
            "ollama_phi4": "Connected" if ollama_ok else "Fallback Ready (Deterministic Zero-Hallucination)",
            "provenance_tracking": "Active",
            "security": "API Key Enforced" if settings.REQUIRE_API_KEY else "Development Mode"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8005, reload=True)
