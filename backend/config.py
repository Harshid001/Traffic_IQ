import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    APP_NAME: str = "Predictive Explainable Traffic Intelligence"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True
    
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
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
