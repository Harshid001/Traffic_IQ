import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    APP_NAME: str = "Predictive Explainable Traffic Intelligence"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
    
    # Security & CORS
    ALLOWED_ORIGINS: List[str] = (
        [o.strip() for o in os.getenv("ALLOWED_ORIGINS").split(",") if o.strip()]
        if os.getenv("ALLOWED_ORIGINS")
        else [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://localhost:8000",
            "http://localhost:8005",
            "http://127.0.0.1:8005",
            "*",
        ]
    )
    API_KEY: str = os.getenv("TRAFFICIQ_API_KEY", "trafficiq-dev-key")
    REQUIRE_API_KEY: bool = os.getenv("REQUIRE_API_KEY", "false").lower() in ("true", "1", "yes")
    
    # Rate Limiting
    RATE_LIMIT_DEFAULT: str = os.getenv("RATE_LIMIT_DEFAULT", "60/minute")
    RATE_LIMIT_EXPLAIN: str = os.getenv("RATE_LIMIT_EXPLAIN", "10/minute")
    
    # Routing Tier Configuration
    LOCAL_OSRM_URL: str = os.getenv("LOCAL_OSRM_URL", "http://localhost:5000")
    PUBLIC_OSRM_URL: str = os.getenv("PUBLIC_OSRM_URL", "https://router.project-osrm.org")
    
    # Traffic Layer Configuration
    TRAFFIC_MODE: str = os.getenv("TRAFFIC_MODE", "DEMO") # "REAL" or "DEMO"
    TOMTOM_API_KEY: str = os.getenv("TOMTOM_API_KEY", "")
    HERE_API_KEY: str = os.getenv("HERE_API_KEY", "")
    
    # Ollama Local LLM Configuration
    OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "phi-4-mini")
    OLLAMA_TIMEOUT_SECONDS: float = 8.0
    
    # Database
    DATABASE_PATH: str = str(BASE_DIR / "database" / "traffic_history.db")
    
    # Chronos-2 Forecasting Model
    CHRONOS_MODEL_NAME: str = os.getenv("CHRONOS_MODEL_NAME", "amazon/chronos-2")
    CHRONOS_DEVICE: str = os.getenv("CHRONOS_DEVICE", "cpu") # "cpu" or "cuda"

settings = Settings()
