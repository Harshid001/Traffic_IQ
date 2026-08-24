import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

from backend.config import settings
from backend.database.seed_data import seed_database
from backend.api.routes import router as routes_router
from backend.api.traffic import router as traffic_router
from backend.api.forecast import router as forecast_router
from backend.api.evaluation import router as evaluation_router
from backend.api.alerts import router as alerts_router
from backend.api.navigation import router as navigation_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Predictive Traffic Intelligence Navigation System...")
    seed_database()
    logger.info("Database initialized and historical patterns seeded.")
    yield
    logger.info("Shutting down backend services.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Predictive, Explainable Traffic-Intelligence Navigation Engine featuring Chronos-2 Forecasting and Zero-Hallucination Local AI.",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(routes_router, prefix="/api/routes", tags=["Routes & Scoring"])
app.include_router(navigation_router, prefix="/api/navigation", tags=["Mobile Driving Cockpit Navigation"])
app.include_router(traffic_router, prefix="/api/traffic", tags=["Traffic Analytics & DNA"])
app.include_router(forecast_router, prefix="/api/forecast", tags=["Chronos-2 Forecasting"])
app.include_router(evaluation_router, prefix="/api/evaluation", tags=["Model Benchmark"])
app.include_router(alerts_router, prefix="/api/alerts", tags=["Predictive Road Alerts"])

@app.get("/api/health")
async def health_check():
    # Check Ollama status
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=1.0) as client:
            resp = await client.get(f"{settings.OLLAMA_URL}/api/tags")
            ollama_ok = (resp.status_code == 200)
    except Exception:
        ollama_ok = False

    # Check Local OSRM status
    osrm_local_ok = False
    try:
        async with httpx.AsyncClient(timeout=1.0) as client:
            resp = await client.get(settings.LOCAL_OSRM_URL)
            osrm_local_ok = (resp.status_code in [200, 400])
    except Exception:
        osrm_local_ok = False

    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "services": {
            "database": "SQLite (Online)",
            "traffic_layer": f"{settings.TRAFFIC_MODE.upper()} MODE",
            "forecasting_engine": "Chronos-2 (amazon/chronos-2)",
            "local_osrm_docker": "Connected" if osrm_local_ok else "Fallback Ready (Public/Demo)",
            "ollama_phi4": "Connected" if ollama_ok else "Fallback Ready (Deterministic Zero-Hallucination)",
            "provenance_tracking": "Active"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
