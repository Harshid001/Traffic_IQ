from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import math
from datetime import datetime, timedelta

from backend.alerts.alert_engine import alert_decision_engine

router = APIRouter()

class StartNavigationRequest(BaseModel):
    active_route: Dict[str, Any]
    all_routes: List[Dict[str, Any]]
    best_route_id: str
    fastest_route_id: str
    current_speed_kmh: Optional[float] = 42.0

class NavigationStepRequest(BaseModel):
    progress_pct: float # 0.0 to 1.0
    current_speed_kmh: Optional[float] = 45.0
    active_route: Dict[str, Any]
    all_routes: List[Dict[str, Any]]
    best_route_id: str
    current_lat: Optional[float] = None
    current_lon: Optional[float] = None

class RerouteRequest(BaseModel):
    new_route_id: str
    all_routes: List[Dict[str, Any]]
    current_progress_pct: float = 0.0

# Predefined Maneuvers generator based on route segments and coordinates
def generate_maneuvers_for_route(route: Dict[str, Any]) -> List[Dict[str, Any]]:
    segments = route.get("segments", [])
    coords = route.get("coordinates", [])
    total_dist = route.get("distance_km", 18.0)
    
    maneuvers = []
    if not segments:
        return [
            {"step": 1, "type": "straight", "icon": "arrow-up", "instruction": "Head northeast on main corridor", "distance_km": round(total_dist * 0.4, 1), "road_name": "Main Corridor"},
            {"step": 2, "type": "turn-right", "icon": "corner-up-right", "instruction": "Turn right onto Express Highway", "distance_km": round(total_dist * 0.4, 1), "road_name": "Express Highway"},
            {"step": 3, "type": "arrive", "icon": "map-pin", "instruction": "Arrive at destination", "distance_km": round(total_dist * 0.2, 1), "road_name": "Destination"}
        ]
        
    num_segs = len(segments)
    for idx, seg in enumerate(segments):
        road_name = seg.get("name", f"Segment {idx + 1}")
        seg_len = seg.get("length_km", total_dist / max(1, num_segs))
        
        if idx == 0:
            maneuvers.append({
                "step": idx + 1,
                "type": "straight",
                "icon": "arrow-up",
                "instruction": f"Head toward {road_name}",
                "distance_km": round(seg_len, 1),
                "road_name": road_name,
                "congestion": seg.get("congestion", 30.0)
            })
        elif idx == num_segs - 1:
            maneuvers.append({
                "step": idx + 1,
                "type": "slight-right",
                "icon": "arrow-up-right",
                "instruction": f"Take exit ramp onto {road_name}",
                "distance_km": round(seg_len * 0.7, 1),
                "road_name": road_name,
                "congestion": seg.get("congestion", 30.0)
            })
            maneuvers.append({
                "step": idx + 2,
                "type": "arrive",
                "icon": "map-pin",
                "instruction": "Arrive at destination on the right",
                "distance_km": round(seg_len * 0.3, 1),
                "road_name": "Destination",
                "congestion": 0.0
            })
        else:
            turn_type = "turn-right" if idx % 2 == 1 else "straight"
            turn_icon = "corner-up-right" if idx % 2 == 1 else "arrow-up"
            maneuvers.append({
                "step": idx + 1,
                "type": turn_type,
                "icon": turn_icon,
                "instruction": f"Continue onto {road_name}",
                "distance_km": round(seg_len, 1),
                "road_name": road_name,
                "congestion": seg.get("congestion", 30.0)
            })
            
    return maneuvers

@router.post("/session/start")
async def start_navigation_session(req: StartNavigationRequest):
    """
    Initializes a driving navigation session with turn-by-turn maneuvers,
    telemetry baselines, and initial ETA.
    """
    maneuvers = generate_maneuvers_for_route(req.active_route)
    total_dist = req.active_route.get("distance_km", 18.0)
    eta_min = req.active_route.get("predicted_eta_p50", 28.0)
    
    arrival_time = (datetime.now() + timedelta(minutes=eta_min)).strftime("%I:%M %p")
    
    return {
        "status": "NAVIGATING",
        "route_id": req.active_route.get("id"),
        "route_name": req.active_route.get("name"),
        "total_distance_km": total_dist,
        "remaining_distance_km": total_dist,
        "eta_minutes": eta_min,
        "arrival_time": arrival_time,
        "maneuvers": maneuvers,
        "current_maneuver": maneuvers[0] if maneuvers else None,
        "speed_limit_kmh": 60.0,
        "current_speed_kmh": req.current_speed_kmh
    }

@router.post("/session/update")
async def update_navigation_session(req: NavigationStepRequest):
    """
    Processes real-time driving telemetry, evaluates proactive bottleneck alerts,
    and updates distance to next turn and ETA.
    """
    progress = max(0.0, min(1.0, req.progress_pct))
    total_dist = req.active_route.get("distance_km", 18.0)
    base_eta = req.active_route.get("predicted_eta_p50", 28.0)
    
    remaining_dist = round(max(0.0, total_dist * (1.0 - progress)), 1)
    remaining_eta = round(max(0.0, base_eta * (1.0 - progress)), 1)
    arrival_time = (datetime.now() + timedelta(minutes=remaining_eta)).strftime("%I:%M %p")
    
    # Calculate current maneuver step
    maneuvers = generate_maneuvers_for_route(req.active_route)
    num_maneuvers = len(maneuvers)
    step_idx = min(num_maneuvers - 1, int(progress * num_maneuvers))
    current_maneuver = maneuvers[step_idx]
    
    # Calculate distance to this maneuver action
    step_slice = 1.0 / max(1, num_maneuvers)
    step_subprogress = (progress - (step_idx * step_slice)) / step_slice
    dist_to_next_turn_m = int(max(50, (1.0 - step_subprogress) * (current_maneuver["distance_km"] * 1000)))
    
    # Interpolate current GPS position along coordinate line
    coords = req.active_route.get("coordinates", [])
    if coords and len(coords) >= 2:
        coord_idx = min(len(coords) - 2, int(progress * (len(coords) - 1)))
        sub_t = (progress * (len(coords) - 1)) - coord_idx
        p1 = coords[coord_idx]
        p2 = coords[coord_idx + 1]
        cur_lat = round(p1[0] + (p2[0] - p1[0]) * sub_t, 5)
        cur_lon = round(p1[1] + (p2[1] - p1[1]) * sub_t, 5)
        
        # Calculate bearing / heading
        d_lat = p2[0] - p1[0]
        d_lon = p2[1] - p1[1]
        heading_deg = int((math.degrees(math.atan2(d_lon, d_lat)) + 360) % 360)
    else:
        cur_lat = req.current_lat or 23.0280
        cur_lon = req.current_lon or 72.5065
        heading_deg = 45
        
    # Evaluate Proactive Bottleneck & Better Route Alerts
    alert = alert_decision_engine.evaluate_live_driving_state(
        current_speed_kmh=req.current_speed_kmh or 45.0,
        progress_pct=progress,
        active_route=req.active_route,
        all_routes=req.all_routes,
        best_route_id=req.best_route_id
    )
    
    # Upcoming segment status
    segments = req.active_route.get("segments", [])
    seg_idx = min(len(segments) - 1, int(progress * len(segments))) if segments else 0
    upcoming_seg = segments[seg_idx] if segments else {"name": "Current Segment", "congestion": 35.0}

    return {
        "progress_pct": round(progress, 3),
        "remaining_distance_km": remaining_dist,
        "remaining_eta_min": remaining_eta,
        "arrival_time": arrival_time,
        "current_lat": cur_lat,
        "current_lon": cur_lon,
        "heading_deg": heading_deg,
        "current_speed_kmh": req.current_speed_kmh or 45.0,
        "speed_limit_kmh": 60.0,
        "current_maneuver": {
            **current_maneuver,
            "dist_to_action_m": dist_to_next_turn_m,
            "display_instruction": f"In {dist_to_next_turn_m}m {current_maneuver['instruction']}" if dist_to_next_turn_m > 100 else current_maneuver['instruction']
        },
        "upcoming_segment": upcoming_seg,
        "has_alert": (alert is not None),
        "alert": alert
    }

@router.post("/session/reroute")
async def reroute_navigation_session(req: RerouteRequest):
    """
    Switches active route to alternative route.
    """
    new_route = next((r for r in req.all_routes if r["id"] == req.new_route_id), None)
    if not new_route:
        raise HTTPException(status_code=404, detail="Requested route not found")
        
    maneuvers = generate_maneuvers_for_route(new_route)
    total_dist = new_route.get("distance_km", 18.0)
    eta_min = new_route.get("predicted_eta_p50", 25.0)
    arrival_time = (datetime.now() + timedelta(minutes=eta_min)).strftime("%I:%M %p")
    
    return {
        "status": "REROUTED",
        "active_route": new_route,
        "maneuvers": maneuvers,
        "current_maneuver": maneuvers[0] if maneuvers else None,
        "remaining_distance_km": total_dist,
        "remaining_eta_min": eta_min,
        "arrival_time": arrival_time
    }
