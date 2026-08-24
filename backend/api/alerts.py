from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.alerts.alert_engine import alert_decision_engine

router = APIRouter()

class DrivingStateRequest(BaseModel):
    current_speed_kmh: float = 38.0
    progress_pct: float = 0.35 # 0.0 to 1.0 along the route
    active_route: Dict[str, Any]
    all_routes: List[Dict[str, Any]]
    best_route_id: str

@router.post("/evaluate")
async def evaluate_driving_alerts(req: DrivingStateRequest):
    """
    Evaluates real-time driving telemetry against upcoming road bottlenecks, 
    short-term Chronos-2 forecasts, and alternative routes to generate 
    Predictive Road Alerts before the driver reaches congestion.
    """
    alert = alert_decision_engine.evaluate_live_driving_state(
        current_speed_kmh=req.current_speed_kmh,
        progress_pct=req.progress_pct,
        active_route=req.active_route,
        all_routes=req.all_routes,
        best_route_id=req.best_route_id
    )
    
    return {
        "has_alert": (alert is not None),
        "alert": alert
    }
