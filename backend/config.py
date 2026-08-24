import os
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    APP_NAME: str = "Predictive Explainable Traffic Intelligence"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    
    # Security & CORS
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:8000",
        "http://localhost:8005",
        "http://127.0.0.1:8005",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "*",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    import json
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return parsed
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
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
    
    # LLM Configuration (Ollama Local & Google Gemini Cloud)
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto") # "auto", "ollama", "gemini"
    OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "phi4-mini")
    OLLAMA_TIMEOUT_SECONDS: float = 25.0
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    
    # Database
    DATABASE_PATH: str = os.getenv(
        "DATABASE_PATH",
        "/tmp/traffic_history.db" if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME") else str(BASE_DIR / "database" / "traffic_history.db")
    )
    
    # Chronos-2 Forecasting Model
    CHRONOS_MODEL_NAME: str = os.getenv("CHRONOS_MODEL_NAME", "amazon/chronos-2")
    CHRONOS_DEVICE: str = os.getenv("CHRONOS_DEVICE", "cpu") # "cpu" or "cuda"

settings = Settings()
