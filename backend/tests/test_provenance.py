import pytest
from backend.forecasting.chronos_service import chronos_service
from backend.forecasting.evaluation import forecast_evaluator

def test_chronos_provenance_honesty():
    """Verify that when official Chronos-2 pipeline is not loaded, provenance reports Heuristic Fallback."""
    res = chronos_service.forecast_segment(
        segment_id="seg_test_01",
        current_congestion=45.0,
        history_20m=[{"congestion": 40.0}, {"congestion": 42.0}, {"congestion": 45.0}],
        freeflow_speed=50.0
    )
    assert "model" in res
    if chronos_service.pipeline is None:
        assert res["model"] == "Heuristic Momentum Fallback"
    else:
        assert "amazon/chronos-2" in res["model"]
    assert len(res["forecast_points"]) == 3
    assert res["trend_forecast"] in ["WORSENING", "CLEARING", "STABLE"]

def test_evaluation_benchmark_metrics():
    """Verify that empirical benchmark metrics compute properly from DB logs."""
    metrics = forecast_evaluator.compute_benchmark_metrics()
    assert "status" in metrics
    assert "metrics" in metrics
    assert "chronos2" in metrics["metrics"]
    assert "baseline" in metrics["metrics"]
    assert "improvement_pct" in metrics
