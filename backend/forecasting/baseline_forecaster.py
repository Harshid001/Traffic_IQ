import numpy as np
from typing import Dict, Any, List

class BaselineForecaster:
    """
    Baseline Forecaster using Exponential Moving Average (EMA) and linear trend extrapolation.
    Used for quantitative backtesting against Chronos-2.
    """
    def __init__(self, alpha: float = 0.6):
        self.alpha = alpha

    def forecast_segment(self, segment_id: str, current_congestion: float, 
                         history_20m: List[Dict[str, Any]], 
                         freeflow_speed: float) -> Dict[str, Any]:
        
        context_values = [h["congestion"] for h in history_20m] if history_20m else [current_congestion]
        
        # Simple Linear Extrapolation
        if len(context_values) >= 2:
            x = np.arange(len(context_values))
            y = np.array(context_values)
            slope, intercept = np.polyfit(x, y, 1)
        else:
            slope = 0.0
            
        horizons = [10, 20, 30]
        forecast_points = []
        
        for step_idx, minutes in enumerate(horizons, start=1):
            # Step in terms of 5-min intervals
            intervals_ahead = minutes / 5.0
            pred_cong = current_congestion + (slope * intervals_ahead)
            # Clip bounds
            pred_cong = max(0.0, min(100.0, float(pred_cong)))
            
            # Baseline speed
            pred_speed = max(5.0, round(freeflow_speed * (1.0 - (pred_cong / 100.0)), 1))
            
            forecast_points.append({
                "horizon_minutes": minutes,
                "label": f"+{minutes} min",
                "predicted_congestion": round(pred_cong, 1),
                "predicted_speed": pred_speed
            })
            
        return {
            "model": "Linear/EMA Baseline",
            "segment_id": segment_id,
            "current_congestion": round(current_congestion, 1),
            "forecast_points": forecast_points,
            "predicted_20m": forecast_points[1]["predicted_congestion"]
        }

baseline_forecaster = BaselineForecaster()
