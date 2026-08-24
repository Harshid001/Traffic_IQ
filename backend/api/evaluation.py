from fastapi import APIRouter
from backend.forecasting.evaluation import forecast_evaluator

router = APIRouter()

@router.get("/benchmark")
async def get_forecast_benchmark():
    """
    Returns empirical benchmark evaluation metrics (MAE, RMSE, MAPE) 
    comparing Chronos-2 against the baseline model, along with overall system impact.
    """
    metrics = forecast_evaluator.compute_benchmark_metrics()
    return metrics
