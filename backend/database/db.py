import sqlite3
import os
from pathlib import Path
from backend.config import settings

def get_db_connection():
    db_path = Path(settings.DATABASE_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS segment_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        segment_id TEXT NOT NULL,
        road_name TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        day_of_week INTEGER NOT NULL,
        hour INTEGER NOT NULL,
        minute INTEGER NOT NULL,
        current_speed REAL NOT NULL,
        freeflow_speed REAL NOT NULL,
        congestion REAL NOT NULL,
        incident_flag INTEGER DEFAULT 0
    )
    """)
    
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_segment_time ON segment_history (segment_id, day_of_week, hour)
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS forecast_eval_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        segment_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        horizon_minutes INTEGER NOT NULL,
        actual_congestion REAL NOT NULL,
        chronos_p10 REAL NOT NULL,
        chronos_p50 REAL NOT NULL,
        chronos_p90 REAL NOT NULL,
        baseline_pred REAL NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {settings.DATABASE_PATH}")
