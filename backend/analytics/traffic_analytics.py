from typing import List, Dict, Any

class TrafficAnalytics:
    @staticmethod
    def get_congestion_category(congestion_pct: float) -> str:
        if congestion_pct < 20.0:
            return "Low"
        elif congestion_pct < 40.0:
            return "Moderate"
        elif congestion_pct < 60.0:
            return "Heavy"
        elif congestion_pct < 80.0:
            return "Severe"
        else:
            return "Critical"

    @staticmethod
    def detect_trend(history_20m: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes recent 20-minute observations:
        WORSENING: Congestion increased >= 5%
        CLEARING: Congestion decreased >= 5%
        STABLE: Between -5% and +5%
        """
        if not history_20m or len(history_20m) < 2:
            return {
                "trend": "STABLE",
                "delta_pct": 0.0,
                "description": "Traffic is stable with minimal variation."
            }

        start_cong = history_20m[0]["congestion"]
        end_cong = history_20m[-1]["congestion"]
        delta_pct = round(end_cong - start_cong, 1)

        if delta_pct >= 5.0:
            trend = "WORSENING"
            desc = f"Traffic worsening: congestion increased by {abs(delta_pct)}% in the last 20 minutes."
        elif delta_pct <= -5.0:
            trend = "CLEARING"
            desc = f"Traffic clearing: congestion decreased by {abs(delta_pct)}% in the last 20 minutes."
        else:
            trend = "STABLE"
            desc = "Traffic flow is currently steady and predictable."

        return {
            "trend": trend,
            "delta_pct": delta_pct,
            "description": desc
        }

    @staticmethod
    def calculate_route_health(avg_congestion: float, trend: str, incident_flag: bool, reliability_score: float) -> int:
        """
        Calculates Route Health score 0-100 based on congestion, trend penalty, incidents, and reliability.
        """
        base = 100.0 - (avg_congestion * 0.5) # Congestion penalty
        
        if trend == "WORSENING":
            base -= 10.0
        elif trend == "CLEARING":
            base += 5.0
            
        if incident_flag:
            base -= 20.0
            
        # Blend with reliability score (0.0 - 1.0)
        base = base * 0.7 + (reliability_score * 100.0) * 0.3
        
        return int(max(10, min(100, round(base))))

traffic_analytics = TrafficAnalytics()
