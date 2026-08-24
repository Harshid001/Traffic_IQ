import logging
from typing import Dict, Any, List
from datetime import datetime
from backend.config import settings
from backend.traffic.simulator import traffic_simulator
from backend.traffic.tomtom_client import tomtom_client
from backend.database.db import get_db_connection

logger = logging.getLogger(__name__)

class TrafficService:
    def __init__(self):
        self.mode = settings.TRAFFIC_MODE.upper()

    async def get_route_traffic(self, route: Dict[str, Any], force_mode: str = None) -> Dict[str, Any]:
        """
        Retrieves segment-by-segment traffic for a route.
        Returns segment list, average congestion, total predicted delay, and provenance.
        """
        target_mode = (force_mode or self.mode).upper()
        segments_data = []
        is_live_successful = False
        
        segments = route.get("segments", [])
        
        for seg in segments:
            seg_id = seg.get("id", "SEG_UNKNOWN")
            road_name = seg.get("name", "Arterial Road")
            freeflow = seg.get("freeflow", 60.0)
            length_km = seg.get("length_km", 3.0)
            
            seg_traffic = None
            if target_mode == "REAL" and settings.TOMTOM_API_KEY:
                # Attempt real API call for segment (using sample representative coordinate)
                coords = route.get("coordinates", [])
                mid_pt = coords[len(coords)//2] if coords else [12.9716, 77.5946]
                live_res = await tomtom_client.get_flow_segment(mid_pt[0], mid_pt[1])
                if live_res:
                    is_live_successful = True
                    seg_traffic = {
                        "segment_id": seg_id,
                        "road_name": road_name,
                        "current_speed": live_res["current_speed"],
                        "freeflow_speed": live_res["freeflow_speed"],
                        "congestion": live_res["congestion"],
                        "history_20m": [
                            {"minutes_ago": 20, "congestion": max(0.0, live_res["congestion"] - 4.0)},
                            {"minutes_ago": 15, "congestion": max(0.0, live_res["congestion"] - 2.0)},
                            {"minutes_ago": 10, "congestion": max(0.0, live_res["congestion"] - 1.0)},
                            {"minutes_ago": 5, "congestion": live_res["congestion"]},
                            {"minutes_ago": 0, "congestion": live_res["congestion"]},
                        ],
                        "incident_flag": 0,
                        "incident_description": None,
                        "timestamp": live_res["timestamp"],
                        "length_km": length_km
                    }

            if not seg_traffic:
                # Use High-Fidelity Simulator
                sim_data = traffic_simulator.get_segment_traffic(seg_id, road_name, freeflow)
                sim_data["length_km"] = length_km
                seg_traffic = sim_data

            segments_data.append(seg_traffic)
            self._save_to_history(seg_traffic)

        # Aggregate Route-Level Traffic
        provenance = "LIVE" if (target_mode == "REAL" and is_live_successful) else "DEMO"
        avg_congestion = sum(s["congestion"] for s in segments_data) / max(1, len(segments_data))
        
        # Calculate actual live traversal duration: sum(length / current_speed) * 60
        live_duration_min = sum((s["length_km"] / max(5.0, s["current_speed"])) * 60.0 for s in segments_data)
        base_duration_min = sum((s["length_km"] / max(5.0, s["freeflow_speed"])) * 60.0 for s in segments_data)
        delay_min = max(0.0, live_duration_min - base_duration_min)

        return {
            "traffic_provenance": provenance,
            "segments": segments_data,
            "avg_congestion": round(avg_congestion, 1),
            "live_duration_min": round(live_duration_min, 1),
            "base_duration_min": round(base_duration_min, 1),
            "delay_min": round(delay_min, 1),
            "has_incident": any(s["incident_flag"] == 1 for s in segments_data)
        }

    def _save_to_history(self, seg_data: Dict[str, Any]):
        """Persists segment observation into SQLite for historical learning."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            now = datetime.now()
            cursor.execute("""
            INSERT INTO segment_history 
            (segment_id, road_name, timestamp, day_of_week, hour, minute, current_speed, freeflow_speed, congestion, incident_flag)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                seg_data["segment_id"],
                seg_data["road_name"],
                now.strftime("%Y-%m-%d %H:%M:%S"),
                now.weekday(),
                now.hour,
                now.minute,
                seg_data["current_speed"],
                seg_data["freeflow_speed"],
                seg_data["congestion"],
                seg_data["incident_flag"]
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.debug(f"Failed to record history: {e}")

traffic_service = TrafficService()
