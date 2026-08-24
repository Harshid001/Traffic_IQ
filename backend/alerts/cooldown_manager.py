from datetime import datetime, timedelta
from typing import Dict

class AlertCooldownManager:
    def __init__(self, cooldown_seconds: int = 300): # 5 minutes cooldown
        self.cooldown_seconds = cooldown_seconds
        self.last_alert_times: Dict[str, datetime] = {}

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
        self.last_alert_times[alert_key] = datetime.now()

    def reset(self):
        self.last_alert_times.clear()

cooldown_manager = AlertCooldownManager()
