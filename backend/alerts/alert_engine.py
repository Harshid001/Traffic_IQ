import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.alerts.cooldown_manager import cooldown_manager
from backend.alerts.traffic_alerts import traffic_alerts

logger = logging.getLogger(__name__)

class AlertDecisionEngine:
    def evaluate_live_driving_state(
        self,
        current_speed_kmh: float,
        progress_pct: float,
        active_route: Dict[str, Any],
        all_routes: List[Dict[str, Any]],
        best_route_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluates driving conditions and triggers Predictive Road Alerts:
        - Driving detection (speed >= 12 km/h)
        - Proximity to upcoming bottleneck
        - Short-term forecast worsening detection
        - Alternative route savings calculation
        - Cooldown throttling
        """
        # 1. Driving Detection Gate
        is_driving = current_speed_kmh >= 12.0 or progress_pct > 0.05
        if not is_driving:
            return None

        segments = active_route.get("segments", [])
        if not segments:
            return None

        # Determine current upcoming segment based on progress along route
        total_segs = len(segments)
        seg_idx = min(total_segs - 1, int(progress_pct * total_segs))
        upcoming_segment = segments[seg_idx]

        seg_name = upcoming_segment.get("road_name", "Upcoming Segment")
        seg_id = upcoming_segment.get("segment_id", "SEG_X")
        current_cong = upcoming_segment.get("congestion", 30.0)
        dist_ahead_km = round(max(0.5, upcoming_segment.get("length_km", 2.0) * (1.0 - (progress_pct * total_segs - seg_idx))), 1)

        # 2. Check for Better Route Opportunity (Priority Level 3 Alert)
        if active_route["id"] != best_route_id:
            better_route = next((r for r in all_routes if r["id"] == best_route_id), None)
            if better_route:
                active_eta = active_route.get("predicted_eta_p50", 30.0)
                better_eta = better_route.get("predicted_eta_p50", 25.0)
                savings = round(active_eta - better_eta, 1)
                
                # If better route offers >= 2.5 min savings or significantly lower congestion
                if (savings >= 2.5 or (active_route.get("avg_congestion", 60) - better_route.get("avg_congestion", 30) >= 20)) and savings > 0:
                    alert_key = f"better_route_{best_route_id}"
                    if not cooldown_manager.should_suppress_alert(alert_key):
                        cooldown_manager.record_alert(alert_key)
                        alert = traffic_alerts.create_better_route_alert(
                            current_route_name=active_route.get("name", "Current Route"),
                            current_eta=active_eta,
                            better_route_id=best_route_id,
                            better_route_name=better_route.get("name", "Best Alternative"),
                            better_eta=better_eta,
                            savings_min=savings,
                            reason="avoids upcoming congestion spike"
                        )
                        alert["timestamp"] = datetime.now().strftime("%H:%M:%S")
                        return alert

        # 3. Check for Predictive Traffic Worsening Ahead (Priority Level 2 Alert)
        # Using 20m forecast on upcoming segment
        fc20_cong = upcoming_segment.get("forecast_20m_p50", current_cong + 12.0)
        trend = upcoming_segment.get("trend", "STABLE")
        
        if (fc20_cong >= 65.0 and fc20_cong - current_cong >= 10.0) or trend == "WORSENING":
            alert_key = f"worsening_{seg_id}"
            if not cooldown_manager.should_suppress_alert(alert_key):
                cooldown_manager.record_alert(alert_key)
                expected_delay = round((fc20_cong / 100.0) * 8.0, 1)
                alert = traffic_alerts.create_traffic_worsening_alert(
                    segment_name=seg_name,
                    distance_km=dist_ahead_km,
                    current_cong=current_cong,
                    fc20_cong=round(fc20_cong, 1),
                    expected_delay_min=expected_delay
                )
                alert["timestamp"] = datetime.now().strftime("%H:%M:%S")
                return alert

        # 4. Check for Immediate Traffic Ahead (Priority Level 1 Alert)
        if current_cong >= 65.0 or upcoming_segment.get("incident_flag", 0) == 1:
            alert_key = f"traffic_ahead_{seg_id}"
            if not cooldown_manager.should_suppress_alert(alert_key):
                cooldown_manager.record_alert(alert_key)
                delay = round((current_cong / 100.0) * 6.0, 1)
                alert = traffic_alerts.create_traffic_ahead_alert(
                    segment_name=seg_name,
                    distance_km=dist_ahead_km,
                    current_cong=current_cong,
                    delay_min=delay
                )
                alert["timestamp"] = datetime.now().strftime("%H:%M:%S")
                return alert

        return None

alert_decision_engine = AlertDecisionEngine()
