from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from backend.analytics.reliability import reliability_engine
from backend.forecasting.chronos_service import chronos_service

router = APIRouter()

class WhatIfRequest(BaseModel):
    routes: List[Dict[str, Any]]

@router.get("/dna")
async def get_traffic_dna(segment_id: str = Query(..., description="Segment ID to query")):
    """
    Returns 24-hour historical Traffic DNA profile for a segment.
    """
    dna = reliability_engine.get_segment_dna(segment_id)
    return {
        "segment_id": segment_id,
        "dna": dna
    }

@router.post("/what-if")
async def simulate_what_if_departure(req: WhatIfRequest):
    """
    Evaluates departure scenarios: NOW (0m), +15m, +30m, +45m.
    Forecasts expected route travel times for each departure window to find the optimal departure time.
    """
    scenarios = [
        {"offset_min": 0, "label": "NOW"},
        {"offset_min": 15, "label": "+15 MIN"},
        {"offset_min": 30, "label": "+30 MIN"},
        {"offset_min": 45, "label": "+45 MIN"}
    ]

    departure_evaluations = []

    for sc in scenarios:
        offset = sc["offset_min"]
        label = sc["label"]
        route_times = []

        for r in req.routes:
            # Base duration
            base_dur = r.get("base_duration_min", 25.0)
            cur_p50 = r.get("predicted_eta_p50", 28.0)
            trend = r.get("trend", "STABLE")
            
            # Predict shift based on trend and time offset
            if offset == 0:
                sc_eta = cur_p50
            elif offset == 15:
                shift = 3.5 if trend == "WORSENING" else (-2.5 if trend == "CLEARING" else 0.5)
                sc_eta = round(max(base_dur, cur_p50 + shift), 1)
            elif offset == 30:
                shift = 7.0 if trend == "WORSENING" else (-5.0 if trend == "CLEARING" else 1.0)
                sc_eta = round(max(base_dur, cur_p50 + shift), 1)
            else: # 45m
                shift = 9.5 if trend == "WORSENING" else (-7.0 if trend == "CLEARING" else 1.5)
                sc_eta = round(max(base_dur, cur_p50 + shift), 1)

            route_times.append({
                "route_id": r["id"],
                "route_name": r["name"],
                "predicted_eta_min": sc_eta,
                "is_best": r.get("is_best", False),
                "is_fastest": r.get("is_fastest", False)
            })

        # Identify best overall departure route
        min_eta_in_scenario = min(rt["predicted_eta_min"] for rt in route_times)
        best_in_sc = next(rt for rt in route_times if rt["predicted_eta_min"] == min_eta_in_scenario)

        departure_evaluations.append({
            "offset_minutes": offset,
            "label": label,
            "best_route_id": best_in_sc["route_id"],
            "best_route_name": best_in_sc["route_name"],
            "lowest_eta_min": min_eta_in_scenario,
            "routes": route_times
        })

    # Overall optimal recommendation
    best_overall_window = min(departure_evaluations, key=lambda x: x["lowest_eta_min"])
    now_eta = departure_evaluations[0]["lowest_eta_min"]
    savings_vs_now = round(now_eta - best_overall_window["lowest_eta_min"], 1)

    if savings_vs_now >= 2.0:
        recommendation_text = f"⭐ Best Departure: Leave in {best_overall_window['offset_minutes']} minutes to save ~{savings_vs_now} min on {best_overall_window['best_route_name']}."
    else:
        recommendation_text = f"🚗 Best Departure: Leave NOW ({now_eta} min). Traffic ahead is stable or worsening soon."

    return {
        "departure_evaluations": departure_evaluations,
        "optimal_departure_window": best_overall_window["label"],
        "optimal_offset_minutes": best_overall_window["offset_minutes"],
        "recommended_route_name": best_overall_window["best_route_name"],
        "potential_savings_min": max(0.0, savings_vs_now),
        "recommendation": recommendation_text
    }
