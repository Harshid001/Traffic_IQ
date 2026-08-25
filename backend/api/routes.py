from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from backend.routing.osrm_client import osrm_client
from backend.traffic.traffic_service import traffic_service
from backend.analytics.traffic_analytics import traffic_analytics
from backend.analytics.reliability import reliability_engine
from backend.forecasting.chronos_service import chronos_service
from backend.forecasting.baseline_forecaster import baseline_forecaster
from backend.scoring.scoring_engine import scoring_engine
from backend.explanation.ollama_client import ollama_client

router = APIRouter()

class RouteRequest(BaseModel):
    origin_lat: float = 12.9756
    origin_lon: float = 77.6066
    dest_lat: float = 12.9863
    dest_lon: float = 77.7340
    corridor_preset: Optional[str] = "bangalore_tech_corridor"
    preference_profile: Optional[str] = "BALANCED" # BALANCED, MOST_RELIABLE, LOWEST_TRAFFIC, AVOID_TOLLS, FASTEST
    force_traffic_mode: Optional[str] = None # "REAL" or "DEMO"

class ExplainRequest(BaseModel):
    verified_facts: Dict[str, Any]

@router.post("/calculate")
async def calculate_routes(req: RouteRequest):
    # Step 1: OSRM Candidate Route Generation (with 3-tier provenance)
    routing_result = await osrm_client.get_routes(
        origin_lat=req.origin_lat,
        origin_lon=req.origin_lon,
        dest_lat=req.dest_lat,
        dest_lon=req.dest_lon,
        corridor_preset=req.corridor_preset
    )
    
    raw_routes = routing_result["routes"]
    routing_provenance = routing_result["routing_provenance"]
    
    evaluated_routes = []
    traffic_provenance_set = set()

    for r in raw_routes:
        # Step 2: Live/Demo Traffic Collection
        traffic_data = await traffic_service.get_route_traffic(r, force_mode=req.force_traffic_mode)
        traffic_provenance_set.add(traffic_data["traffic_provenance"])
        
        segments = traffic_data["segments"]
        avg_congestion = traffic_data["avg_congestion"]
        
        # Step 3: Trend Detection
        # Use first heavy segment history or average
        rep_history = segments[0].get("history_20m", [])
        trend_info = traffic_analytics.detect_trend(rep_history)
        
        # Step 4: Historical Reliability & Percentiles
        rel_info = reliability_engine.calculate_route_reliability(segments, r["base_duration_min"])
        
        # Step 5: Chronos-2 & Baseline Probabilistic Traffic Forecasting
        # Forecast each segment +10m, +20m, +30m
        route_p10_durations = []
        route_p50_durations = []
        route_p90_durations = []
        segment_forecasts = []
        
        for seg in segments:
            seg_fc = chronos_service.forecast_segment(
                segment_id=seg["segment_id"],
                current_congestion=seg["congestion"],
                history_20m=seg.get("history_20m", []),
                freeflow_speed=seg["freeflow_speed"]
            )
            segment_forecasts.append(seg_fc)
            
            # Horizon 2 (+20 min) is central for current trip projection
            fc_pt_20m = seg_fc["forecast_points"][1]
            seg_len = seg.get("length_km", 3.0)
            
            dur_p10 = (seg_len / max(5.0, fc_pt_20m["speed_p90"])) * 60.0 # higher speed = lower time
            dur_p50 = (seg_len / max(5.0, fc_pt_20m["speed_p50"])) * 60.0
            dur_p90 = (seg_len / max(5.0, fc_pt_20m["speed_p10"])) * 60.0
            
            route_p10_durations.append(dur_p10)
            route_p50_durations.append(dur_p50)
            route_p90_durations.append(dur_p90)
            
        pred_eta_p10 = round(sum(route_p10_durations), 1)
        pred_eta_p50 = round(sum(route_p50_durations), 1)
        pred_eta_p90 = round(sum(route_p90_durations), 1)
        
        # Route Health Score
        route_health = traffic_analytics.calculate_route_health(
            avg_congestion=avg_congestion,
            trend=trend_info["trend"],
            incident_flag=traffic_data["has_incident"],
            reliability_score=rel_info["reliability_score"]
        )
        
        # Aggregate 20m forecast congestion across segments
        fc20_cong = round(sum(s["forecast_points"][1]["congestion_p50"] for s in segment_forecasts) / max(1, len(segment_forecasts)), 1)
        
        evaluated_routes.append({
            "id": r["id"],
            "name": r["name"],
            "summary": r["summary"],
            "distance_km": r["distance_km"],
            "base_duration_min": r["base_duration_min"],
            "live_duration_min": traffic_data["live_duration_min"],
            "predicted_eta_p10": pred_eta_p10,
            "predicted_eta_p50": pred_eta_p50,
            "predicted_eta_p90": pred_eta_p90,
            "forecast_uncertainty_spread": round(pred_eta_p90 - pred_eta_p10, 1),
            "toll_cost": r.get("toll_cost", 0.0),
            "avg_congestion": avg_congestion,
            "congestion_category": traffic_analytics.get_congestion_category(avg_congestion),
            "trend": trend_info["trend"],
            "trend_delta_pct": trend_info["delta_pct"],
            "trend_description": trend_info["description"],
            "forecast_20m_p50": fc20_cong,
            "route_health": route_health,
            "reliability": rel_info,
            "has_incident": traffic_data["has_incident"],
            "segments": segments,
            "segment_forecasts": segment_forecasts,
            "coordinates": r["coordinates"]
        })

    # Step 6: Route Scoring Engine (Isolates ⚡ FASTEST vs ⭐ BEST)
    scoring_result = scoring_engine.score_routes(
        evaluated_routes=evaluated_routes,
        preference_profile=req.preference_profile or "BALANCED"
    )

    overall_traffic_provenance = "LIVE" if "LIVE" in traffic_provenance_set else "DEMO"

    # Assemble verified facts for explanation layer
    fastest_route = next(r for r in scoring_result["routes"] if r["is_fastest"])
    best_route = next(r for r in scoring_result["routes"] if r["is_best"])

    verified_facts = {
        "corridor_name": routing_result.get("corridor_name", "Navigation Corridor"),
        "preference_profile": scoring_result["preference_profile"],
        "are_different": scoring_result["are_different"],
        "fastest_route": {
            "id": fastest_route["id"],
            "name": fastest_route["name"],
            "predicted_eta_p50": fastest_route["predicted_eta_p50"],
            "predicted_eta_p10": fastest_route["predicted_eta_p10"],
            "predicted_eta_p90": fastest_route["predicted_eta_p90"],
            "avg_congestion": fastest_route["avg_congestion"],
            "trend": fastest_route["trend"],
            "forecast_20m_p50": fastest_route["forecast_20m_p50"],
            "reliability_label": fastest_route["reliability"]["reliability_label"],
            "reliability_score": fastest_route["reliability"]["reliability_score"],
            "score": fastest_route["score"]
        },
        "best_route": {
            "id": best_route["id"],
            "name": best_route["name"],
            "predicted_eta_p50": best_route["predicted_eta_p50"],
            "predicted_eta_p10": best_route["predicted_eta_p10"],
            "predicted_eta_p90": best_route["predicted_eta_p90"],
            "avg_congestion": best_route["avg_congestion"],
            "trend": best_route["trend"],
            "forecast_20m_p50": best_route["forecast_20m_p50"],
            "reliability_label": best_route["reliability"]["reliability_label"],
            "reliability_score": best_route["reliability"]["reliability_score"],
            "score": best_route["score"]
        }
    }

    # Step 7: Initial AI Explanation Generation
    explanation_res = await ollama_client.generate_explanation(verified_facts)

    return {
        "origin": routing_result["origin"],
        "destination": routing_result["destination"],
        "corridor_name": routing_result.get("corridor_name"),
        "routing_provenance": routing_provenance,
        "traffic_provenance": overall_traffic_provenance,
        "forecasting_model": "Chronos-2 (amazon/chronos-2)",
        "preference_profile": scoring_result["preference_profile"],
        "fastest_route_id": scoring_result["fastest_route_id"],
        "best_route_id": scoring_result["best_route_id"],
        "are_different": scoring_result["are_different"],
        "routes": scoring_result["routes"],
        "verified_facts": verified_facts,
        "explanation": explanation_res
    }

class ChatHistoryItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    corridor_name: Optional[str] = None
    route_context: Optional[Dict[str, Any]] = None
    messages: Optional[List[ChatHistoryItem]] = None

@router.post("/explain")
async def explain_route(req: ExplainRequest):
    """
    Direct endpoint for on-demand explanation re-generation with full validation.
    """
    res = await ollama_client.generate_explanation(req.verified_facts)
    return res

@router.post("/chat")
async def chat_with_copilot(req: ChatRequest):
    """
    Direct interactive AI Copilot route chat powered by local phi4-mini.
    """
    msg_dicts = [m.model_dump() for m in req.messages] if req.messages else None
    res = await ollama_client.chat_copilot(
        query=req.query,
        route_context=req.route_context,
        corridor_name=req.corridor_name,
        messages=msg_dicts
    )
    return res

