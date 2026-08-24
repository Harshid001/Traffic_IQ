import numpy as np
from datetime import datetime
from typing import Dict, Any, List
from backend.database.db import get_db_connection

class ReliabilityEngine:
    def calculate_route_reliability(self, segments: List[Dict[str, Any]], base_duration_min: float) -> Dict[str, Any]:
        """
        Calculates historical percentiles (p10, p50, p90), typical travel time range,
        and the Reliability Index based on SQLite segment historical variance.
        """
        now = datetime.now()
        current_dow = now.weekday()
        current_hour = now.hour
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        segment_stats = []
        for seg in segments:
            seg_id = seg["segment_id"]
            rows = []
            try:
                # Look for same hour in past 14 days (+/- 1 hour window)
                cursor.execute("""
                SELECT congestion, current_speed, incident_flag 
                FROM segment_history 
                WHERE segment_id = ? AND hour BETWEEN ? AND ?
                ORDER BY timestamp DESC LIMIT 60
                """, (seg_id, max(0, current_hour - 1), min(23, current_hour + 1)))
                rows = cursor.fetchall()
            except Exception:
                rows = []
            if rows and len(rows) >= 5:
                cong_vals = [r["congestion"] for r in rows]
                speeds = [r["current_speed"] for r in rows]
                incidents = [r["incident_flag"] for r in rows]
                
                p10_spd = float(np.percentile(speeds, 10)) # pessimistic speed
                p50_spd = float(np.percentile(speeds, 50)) # median speed
                p90_spd = float(np.percentile(speeds, 90)) # optimistic speed
                
                std_cong = float(np.std(cong_vals))
                incident_rate = sum(incidents) / len(incidents)
            else:
                # Fallback statistical estimate based on current segment congestion
                cur_spd = seg.get("current_speed", 45.0)
                ff_spd = seg.get("freeflow_speed", 60.0)
                p50_spd = cur_spd
                p10_spd = max(10.0, cur_spd * 0.75)
                p90_spd = min(ff_spd, cur_spd * 1.2)
                std_cong = 12.0
                incident_rate = 0.02
                
            segment_stats.append({
                "segment_id": seg_id,
                "length_km": seg.get("length_km", 3.0),
                "p10_speed": max(5.0, p10_spd),
                "p50_speed": max(5.0, p50_spd),
                "p90_speed": max(5.0, p90_spd),
                "std_cong": std_cong,
                "incident_rate": incident_rate
            })
            
        conn.close()
        
        # Route-level travel times:
        # Note: high speed = lower time. So p90 speed yields p10 time (optimistic), p10 speed yields p90 time (pessimistic)
        p10_time = sum((s["length_km"] / s["p90_speed"]) * 60.0 for s in segment_stats)
        p50_time = sum((s["length_km"] / s["p50_speed"]) * 60.0 for s in segment_stats)
        p90_time = sum((s["length_km"] / s["p10_speed"]) * 60.0 for s in segment_stats)
        
        time_spread = max(1.0, p90_time - p10_time)
        avg_std = sum(s["std_cong"] for s in segment_stats) / max(1, len(segment_stats))
        avg_incident_rate = sum(s["incident_rate"] for s in segment_stats) / max(1, len(segment_stats))
        
        # Reliability Index (0.0 to 1.0)
        # Low spread + low std + low incidents = high reliability
        rel_score = 1.0 - (min(30.0, time_spread) / 45.0) - (min(30.0, avg_std) / 80.0) - (avg_incident_rate * 2.0)
        rel_score = round(max(0.15, min(0.98, rel_score)), 2)
        
        if rel_score >= 0.80:
            rel_label = "High"
        elif rel_score >= 0.55:
            rel_label = "Medium"
        else:
            rel_label = "Low"
            
        return {
            "reliability_score": rel_score,
            "reliability_label": rel_label,
            "typical_min": round(p50_time, 1),
            "range_min": [round(p10_time, 1), round(p90_time, 1)],
            "p10_travel_time": round(p10_time, 1),
            "p50_travel_time": round(p50_time, 1),
            "p90_travel_time": round(p90_time, 1),
            "time_variance_min": round(time_spread / 2.0, 1),
            "incident_risk_pct": round(avg_incident_rate * 100.0, 1)
        }

    def get_segment_dna(self, segment_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves 24-hour historical congestion profile (0-23 hours) for Traffic DNA visualizer.
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
        SELECT hour, AVG(congestion) as avg_cong, MIN(congestion) as min_cong, MAX(congestion) as max_cong
        FROM segment_history
        WHERE segment_id = ?
        GROUP BY hour
        ORDER BY hour ASC
        """, (segment_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        dna = []
        rows_by_hour = {r["hour"]: r for r in rows}
        
        for h in range(24):
            if h in rows_by_hour:
                r = rows_by_hour[h]
                dna.append({
                    "hour": h,
                    "label": f"{h:02d}:00",
                    "avg_congestion": round(r["avg_cong"], 1),
                    "min_congestion": round(r["min_cong"], 1),
                    "max_congestion": round(r["max_cong"], 1)
                })
            else:
                # Default shape if segment has no specific data
                is_peak = (8 <= h <= 10) or (17 <= h <= 20)
                cong = 65.0 if is_peak else 25.0
                dna.append({
                    "hour": h,
                    "label": f"{h:02d}:00",
                    "avg_congestion": cong,
                    "min_congestion": max(5.0, cong - 15.0),
                    "max_congestion": min(95.0, cong + 20.0)
                })
                
        return dna

reliability_engine = ReliabilityEngine()
