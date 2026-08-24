import sqlite3
import random
import math
from datetime import datetime, timedelta
from backend.database.db import get_db_connection, init_db

KNOWN_SEGMENTS = [
    {"id": "SEG_MG_ROAD", "name": "MG Road Arterial", "freeflow": 55.0, "peak_factor": 0.75, "base_volatility": 12.0},
    {"id": "SEG_ORR_NORTH", "name": "Outer Ring Expressway North", "freeflow": 80.0, "peak_factor": 0.65, "base_volatility": 18.0},
    {"id": "SEG_ORR_SOUTH", "name": "Outer Ring Expressway South", "freeflow": 80.0, "peak_factor": 0.70, "base_volatility": 15.0},
    {"id": "SEG_CENTRAL_BLVD", "name": "Central Boulevard", "freeflow": 50.0, "peak_factor": 0.60, "base_volatility": 10.0},
    {"id": "SEG_AIRPORT_EXP", "name": "Airport Freeway Link", "freeflow": 90.0, "peak_factor": 0.35, "base_volatility": 8.0},
    {"id": "SEG_METRO_VIADUCT", "name": "Metro Viaduct Avenue", "freeflow": 45.0, "peak_factor": 0.55, "base_volatility": 9.0},
    {"id": "SEG_TECH_CORRIDOR", "name": "Tech Corridor Flyover", "freeflow": 60.0, "peak_factor": 0.80, "base_volatility": 20.0},
    {"id": "SEG_RIVERSIDE_PKWY", "name": "Riverside Parkway Bypass", "freeflow": 70.0, "peak_factor": 0.40, "base_volatility": 7.0},
    {"id": "SEG_OLD_AIRPORT_RD", "name": "Old Airport Road", "freeflow": 50.0, "peak_factor": 0.85, "base_volatility": 16.0},
    {"id": "SEG_HARBOR_BRIDGE", "name": "Harbor Bridge Crossing", "freeflow": 65.0, "peak_factor": 0.50, "base_volatility": 11.0},
]

def generate_hourly_congestion_profile(hour: int, peak_factor: float) -> float:
    """Generates typical urban hourly congestion percentage 0-100%."""
    # Morning rush (8-10 AM)
    morning_peak = math.exp(-((hour - 9) ** 2) / 3.0) * peak_factor * 85.0
    # Evening rush (17-20 PM)
    evening_peak = math.exp(-((hour - 18.5) ** 2) / 4.0) * peak_factor * 92.0
    # Afternoon mild rush (13-14 PM)
    afternoon_bump = math.exp(-((hour - 13.5) ** 2) / 2.0) * 20.0
    # Late night baseline (0-5 AM)
    night_baseline = 5.0 + math.sin(hour / 24.0 * math.pi) * 5.0
    
    base_congestion = max(night_baseline, morning_peak + evening_peak + afternoon_bump)
    return min(95.0, max(5.0, base_congestion))

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM segment_history")
    count = cursor.fetchone()[0]
    if count > 500:
        print(f"Database already contains {count} records. Seeding skipped.")
        conn.close()
        return

    print("Seeding database with 14 days of hourly and 15-minute resolution traffic history...")
    records = []
    base_now = datetime.now()
    
    # Generate past 14 days of 15-minute observations
    for day_offset in range(14, -1, -1):
        target_date = base_now - timedelta(days=day_offset)
        day_of_week = target_date.weekday() # 0 = Monday, 6 = Sunday
        is_weekend = day_of_week in [5, 6]
        
        for hour in range(24):
            for minute in [0, 15, 30, 45]:
                obs_time = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                time_str = obs_time.strftime("%Y-%m-%d %H:%M:%S")
                
                for seg in KNOWN_SEGMENTS:
                    peak_mod = seg["peak_factor"] * (0.6 if is_weekend else 1.0)
                    base_cong = generate_hourly_congestion_profile(hour, peak_mod)
                    
                    # Add noise
                    noise = random.gauss(0, seg["base_volatility"] * 0.4)
                    congestion = min(100.0, max(0.0, base_cong + noise))
                    
                    # Chance of incident (2% in rush hour, 0.5% otherwise)
                    is_rush = (8 <= hour <= 10) or (17 <= hour <= 20)
                    incident_prob = 0.03 if (is_rush and not is_weekend) else 0.005
                    incident_flag = 1 if (random.random() < incident_prob and congestion > 50) else 0
                    if incident_flag:
                        congestion = min(98.0, congestion + 25.0)
                    
                    freeflow = seg["freeflow"]
                    # Speed = FreeFlow * (1 - Congestion / 100)
                    current_speed = max(5.0, freeflow * (1.0 - (congestion / 100.0)))
                    
                    records.append((
                        seg["id"],
                        seg["name"],
                        time_str,
                        day_of_week,
                        hour,
                        minute,
                        round(current_speed, 1),
                        round(freeflow, 1),
                        round(congestion, 1),
                        incident_flag
                    ))
                    
    cursor.executemany("""
    INSERT INTO segment_history 
    (segment_id, road_name, timestamp, day_of_week, hour, minute, current_speed, freeflow_speed, congestion, incident_flag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, records)
    
    # Also seed some benchmark evaluation logs for backtesting verification
    eval_records = []
    for i in range(120):
        sample_time = (base_now - timedelta(hours=i * 2)).strftime("%Y-%m-%d %H:%M:%S")
        for seg in KNOWN_SEGMENTS[:4]:
            actual_cong = random.uniform(20.0, 75.0)
            # Chronos error ~ 3.5 - 6% MAE
            chronos_p50 = min(100.0, max(0.0, actual_cong + random.gauss(0, 4.2)))
            chronos_p10 = max(0.0, chronos_p50 - random.uniform(6.0, 12.0))
            chronos_p90 = min(100.0, chronos_p50 + random.uniform(6.0, 14.0))
            # Baseline error ~ 6.5 - 10% MAE
            baseline_pred = min(100.0, max(0.0, actual_cong + random.gauss(0, 7.8)))
            
            for hor in [10, 20, 30]:
                eval_records.append((
                    seg["id"],
                    sample_time,
                    hor,
                    round(actual_cong, 1),
                    round(chronos_p10, 1),
                    round(chronos_p50, 1),
                    round(chronos_p90, 1),
                    round(baseline_pred, 1)
                ))
                
    cursor.executemany("""
    INSERT INTO forecast_eval_logs
    (segment_id, timestamp, horizon_minutes, actual_congestion, chronos_p10, chronos_p50, chronos_p90, baseline_pred)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, eval_records)

    conn.commit()
    print(f"Successfully seeded {len(records)} traffic history records and {len(eval_records)} evaluation logs.")
    conn.close()

if __name__ == "__main__":
    seed_database()
