import sqlite3
import os
from pathlib import Path
from backend.config import settings

def get_db_connection():
    db_path = Path(settings.DATABASE_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path), timeout=10.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    # Enable Write-Ahead Logging (WAL) and synchronous normal for concurrent reader/writer safety
    try:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA busy_timeout=5000;")
    except Exception:
        pass
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
    CREATE INDEX IF NOT EXISTS idx_segment_timestamp ON segment_history (timestamp)
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
    
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_eval_timestamp ON forecast_eval_logs (timestamp)
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alert_cooldowns (
        alert_key TEXT PRIMARY KEY,
        last_sent_at DATETIME NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {settings.DATABASE_PATH}")
