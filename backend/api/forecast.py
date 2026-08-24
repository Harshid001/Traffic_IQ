from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from backend.forecasting.chronos_service import chronos_service
from backend.forecasting.baseline_forecaster import baseline_forecaster

router = APIRouter()

class ForecastCompareRequest(BaseModel):
    segment_id: str
    current_congestion: float
    history_20m: List[Dict[str, Any]]
    freeflow_speed: float

@router.post("/compare")
async def compare_forecasters(req: ForecastCompareRequest):
    """
    Returns side-by-side probabilistic Chronos-2 quantiles (P10, P50, P90)
    vs Baseline Forecaster predictions for a segment.
    """
    chronos_res = chronos_service.forecast_segment(
        segment_id=req.segment_id,
        current_congestion=req.current_congestion,
        history_20m=req.history_20m,
        freeflow_speed=req.freeflow_speed
    )
    
    baseline_res = baseline_forecaster.forecast_segment(
        segment_id=req.segment_id,
        current_congestion=req.current_congestion,
        history_20m=req.history_20m,
        freeflow_speed=req.freeflow_speed
    )
    
    return {
        "chronos2": chronos_res,
        "baseline": baseline_res
    }
