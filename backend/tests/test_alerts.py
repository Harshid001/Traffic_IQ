import pytest
from backend.alerts.cooldown_manager import cooldown_manager
from backend.alerts.alert_engine import alert_decision_engine

def test_alert_cooldown_persistence():
    key = "test_alert_corridor_01"
    cooldown_manager.reset()
    assert cooldown_manager.should_suppress_alert(key) is False
    
    cooldown_manager.record_alert(key)
    assert cooldown_manager.should_suppress_alert(key) is True
    
    cooldown_manager.reset()
    assert cooldown_manager.should_suppress_alert(key) is False

def test_alert_evaluation():
    active_route = {
        "id": "route_1",
        "name": "Primary Route",
        "avg_congestion": 75.0,
        "trend": "WORSENING",
        "predicted_eta_p50": 35.0,
        "score": 55,
        "segments": [{"road_name": "Heavy Segment", "segment_id": "seg_01", "congestion": 85.0, "current_speed": 12.0, "length_km": 3.0}]
    }
    all_routes = [
        active_route,
        {
            "id": "route_2",
            "name": "Clear Bypass",
            "avg_congestion": 25.0,
            "trend": "CLEARING",
            "predicted_eta_p50": 26.0,
            "score": 88,
            "segments": [{"road_name": "Clear Segment", "segment_id": "seg_02", "congestion": 20.0, "current_speed": 55.0, "length_km": 4.0}]
        }
    ]
    res = alert_decision_engine.evaluate_live_driving_state(
        current_speed_kmh=15.0,
        progress_pct=0.45,
        active_route=active_route,
        all_routes=all_routes,
        best_route_id="route_2"
    )
    assert res is not None
    assert "title" in res or "level" in res
