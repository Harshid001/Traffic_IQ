import pytest
from backend.explanation.validator import explanation_validator

def test_explanation_validator_pass():
    facts = {
        "best_route": {"name": "MG Road Expressway", "predicted_eta_p50": 24.5, "avg_congestion": 35.0, "trend": "CLEARING"},
        "fastest_route": {"name": "MG Road Expressway", "predicted_eta_p50": 24.5, "avg_congestion": 35.0, "trend": "CLEARING"},
        "are_different": False
    }
    text = "MG Road Expressway is both the fastest and best route with an ETA of 24.5 min and 35% congestion with clearing conditions."
    res = explanation_validator.validate(text, facts)
    assert res["is_valid"] is True
    assert res["layer_1_passed"] is True
    assert res["layer_2_passed"] is True
    assert res["layer_3_passed"] is True

def test_explanation_validator_number_hallucination():
    facts = {
        "best_route": {"name": "MG Road Expressway", "predicted_eta_p50": 24.5, "avg_congestion": 35.0, "trend": "CLEARING"},
        "fastest_route": {"name": "MG Road Expressway", "predicted_eta_p50": 24.5, "avg_congestion": 35.0, "trend": "CLEARING"},
        "are_different": False
    }
    # Text injects completely hallucinated numbers: 89.2% and 143.0 min
    text = "The route will take 143.0 min with an unexpected 89.2% slowdown."
    res = explanation_validator.validate(text, facts)
    assert res["is_valid"] is False
    assert res["layer_1_passed"] is False

def test_explanation_validator_decision_inversion():
    facts = {
        "best_route": {"name": "MG Road Corridor", "predicted_eta_p50": 28.0, "avg_congestion": 25.0, "trend": "CLEARING"},
        "fastest_route": {"name": "Outer Ring Highway", "predicted_eta_p50": 24.0, "avg_congestion": 65.0, "trend": "WORSENING"},
        "are_different": True
    }
    # Claiming the fastest route is the best recommended route when they differ
    text = "Outer Ring Highway is the best choice and recommended over MG Road Corridor."
    res = explanation_validator.validate(text, facts)
    assert res["is_valid"] is False
    assert res["layer_3_passed"] is False
