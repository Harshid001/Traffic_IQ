import random
import math
from datetime import datetime
from typing import Dict, Any, List

class TrafficSimulator:
    def __init__(self):
        # Specific scenario injection overrides if desired
        self.active_scenarios = {}

    def get_segment_traffic(self, segment_id: str, road_name: str, freeflow_speed: float, scenario_modifier: float = 1.0) -> Dict[str, Any]:
        """
        Simulates realistic deterministic-plus-stochastic traffic physics for a segment.
        """
        now = datetime.now()
        hour = now.hour + (now.minute / 60.0)
        
        # Diurnal pattern
        morning_peak = math.exp(-((hour - 9.0) ** 2) / 3.2) * 0.75
        evening_peak = math.exp(-((hour - 18.5) ** 2) / 4.0) * 0.85
        afternoon_lull = math.exp(-((hour - 14.0) ** 2) / 2.5) * 0.25
        base_load = max(0.1, morning_peak + evening_peak + afternoon_lull)
        
        # Unique segment seed for consistent but varied behavior
        seg_hash = sum(ord(c) for c in segment_id) % 100
        seg_variance = (seg_hash - 50) / 250.0 # -0.2 to +0.2
        
        target_congestion = min(95.0, max(5.0, (base_load + seg_variance) * 100.0 * scenario_modifier))
        
        # Recent traffic trajectory (last 20m in 5m steps) for trend detection
        history_20m = []
        trend_direction = 1.0 if (7 <= hour <= 9 or 16 <= hour <= 18.5) else (-1.0 if (9.5 <= hour <= 11.5 or 19.5 <= hour <= 21.5) else 0.0)
        
        for step in range(4, -1, -1):
            minute_offset = step * 5
            # Earlier observation
            step_cong = target_congestion - (trend_direction * (step * 3.5)) + random.uniform(-2.0, 2.0)
            step_cong = min(100.0, max(0.0, step_cong))
            history_20m.append({
                "minutes_ago": minute_offset,
                "congestion": round(step_cong, 1)
            })
            
        current_congestion = history_20m[-1]["congestion"]
        
        # Incidents
        incident_flag = 1 if (current_congestion > 75.0 and random.random() < 0.15) else 0
        incident_desc = "Minor fender-bender on shoulder" if incident_flag else None
        
        # Deterministic Speed Math
        # Speed = FreeFlow * (1 - Congestion / 100)
        current_speed = max(6.0, round(freeflow_speed * (1.0 - (current_congestion / 100.0)), 1))
        
        return {
            "segment_id": segment_id,
            "road_name": road_name,
            "current_speed": current_speed,
            "freeflow_speed": freeflow_speed,
            "congestion": current_congestion,
            "history_20m": history_20m,
            "incident_flag": incident_flag,
            "incident_description": incident_desc,
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S")
        }

traffic_simulator = TrafficSimulator()
