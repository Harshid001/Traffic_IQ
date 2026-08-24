from datetime import datetime, timedelta
from typing import Dict
import logging
from backend.database.db import get_db_connection

logger = logging.getLogger(__name__)

class AlertCooldownManager:
    def __init__(self, cooldown_seconds: int = 300): # 5 minutes default cooldown
        self.cooldown_seconds = cooldown_seconds
        self.last_alert_times: Dict[str, datetime] = {}
        self._load_from_db()

    def _load_from_db(self):
        """Loads persistent alert cooldowns from SQLite on initialization."""
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT alert_key, last_sent_at FROM alert_cooldowns")
            rows = cur.fetchall()
            for r in rows:
                try:
                    self.last_alert_times[r["alert_key"]] = datetime.fromisoformat(r["last_sent_at"])
                except Exception:
                    pass
            conn.close()
        except Exception as e:
            logger.debug(f"Notice loading cooldowns from DB: {e}")

    def should_suppress_alert(self, alert_key: str) -> bool:
        """
        Returns True if an alert with the given key was sent recently within cooldown window.
        """
        now = datetime.now()
        if alert_key in self.last_alert_times:
            last_time = self.last_alert_times[alert_key]
            if (now - last_time).total_seconds() < self.cooldown_seconds:
                return True
        return False

    def record_alert(self, alert_key: str):
        now = datetime.now()
        self.last_alert_times[alert_key] = now
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
            INSERT INTO alert_cooldowns (alert_key, last_sent_at)
            VALUES (?, ?)
            ON CONFLICT(alert_key) DO UPDATE SET last_sent_at = excluded.last_sent_at
            """, (alert_key, now.isoformat()))
            conn.commit()
            conn.close()
        except Exception as e:
            logger.debug(f"Failed to persist alert cooldown: {e}")

    def reset(self):
        self.last_alert_times.clear()
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("DELETE FROM alert_cooldowns")
            conn.commit()
            conn.close()
        except Exception as e:
            logger.debug(f"Failed to clear alert cooldowns: {e}")

cooldown_manager = AlertCooldownManager()
