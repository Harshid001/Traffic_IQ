import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from backend.config import settings

logger = logging.getLogger(__name__)

class TomTomTrafficClient:
    def __init__(self):
        self.api_key = settings.TOMTOM_API_KEY
        self.base_url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json"
        
    async def get_flow_segment(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """
        Fetches live flow segment data from TomTom Traffic API.
        Requires valid TOMTOM_API_KEY.
        """
        if not self.api_key:
            return None
            
        params = {
            "key": self.api_key,
            "point": f"{lat},{lon}",
            "unit": "KMPH"
        }
        
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(self.base_url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    flow_data = data.get("flowSegmentData", {})
                    current_speed = flow_data.get("currentSpeed", 40.0)
                    freeflow_speed = flow_data.get("freeFlowSpeed", 60.0)
                    
                    congestion = max(0.0, min(100.0, ((freeflow_speed - current_speed) / freeflow_speed) * 100.0))
                    
                    return {
                        "current_speed": round(current_speed, 1),
                        "freeflow_speed": round(freeflow_speed, 1),
                        "congestion": round(congestion, 1),
                        "confidence": flow_data.get("confidence", 0.9),
                        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
        except Exception as e:
            logger.warning(f"TomTom API live request failed: {e}")
            
        return None

tomtom_client = TomTomTrafficClient()
