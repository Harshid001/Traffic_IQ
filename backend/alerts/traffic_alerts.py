from typing import Dict, Any, Optional

class TrafficAlerts:
    @staticmethod
    def create_traffic_ahead_alert(segment_name: str, distance_km: float, current_cong: float, delay_min: float) -> Dict[str, Any]:
        return {
            "level": "TRAFFIC_AHEAD",
            "type": "warning",
            "title": f"🚦 Traffic Ahead: {segment_name}",
            "distance_km": distance_km,
            "message": f"Heavy traffic ({current_cong}% congestion) detected {distance_km} km ahead. Current delay: +{delay_min} min.",
            "action_label": "View Live Conditions",
            "timestamp": None
        }

    @staticmethod
    def create_traffic_worsening_alert(segment_name: str, distance_km: float, current_cong: float, 
                                       fc20_cong: float, expected_delay_min: float) -> Dict[str, Any]:
        return {
            "level": "TRAFFIC_WORSENING",
            "type": "alert",
            "title": f"⚠ Traffic Worsening Ahead: {segment_name}",
            "distance_km": distance_km,
            "message": f"Traffic is forecast to increase from {current_cong}% to {fc20_cong}% before you reach it. Expected additional delay: +{expected_delay_min} min.",
            "action_label": "Inspect Future Vision",
            "timestamp": None
        }

    @staticmethod
    def create_better_route_alert(current_route_name: str, current_eta: float, 
                                 better_route_id: str, better_route_name: str, 
                                 better_eta: float, savings_min: float, reason: str) -> Dict[str, Any]:
        return {
            "level": "BETTER_ROUTE_AVAILABLE",
            "type": "recommendation",
            "title": f"⭐ Better Route Available: {better_route_name}",
            "savings_min": savings_min,
            "message": f"Current route ({current_route_name}): {current_eta} min. Recommended alternative ({better_route_name}): {better_eta} min. Save {savings_min} min ({reason}).",
            "action_label": "Switch to Best Route",
            "suggested_route_id": better_route_id,
            "timestamp": None
        }

traffic_alerts = TrafficAlerts()
