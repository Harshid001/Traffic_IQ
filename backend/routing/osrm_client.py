import httpx
import logging
from typing import Dict, Any, List, Optional
from backend.config import settings
from backend.routing.geo_presets import GEO_PRESETS

logger = logging.getLogger(__name__)

class OSRMClient:
    def __init__(self):
        self.local_url = settings.LOCAL_OSRM_URL.rstrip('/')
        self.public_url = settings.PUBLIC_OSRM_URL.rstrip('/')
        self.timeout = 3.5

    async def get_routes(self, origin_lat: float, origin_lon: float, 
                         dest_lat: float, dest_lon: float, 
                         corridor_preset: Optional[str] = None) -> Dict[str, Any]:
        """
        Queries routes following the strict 3-tier hierarchy:
        Priority 1: Local OSRM Docker
        Priority 2: Public OSRM API
        Priority 3: Explicit Demo Fallback Router
        """
        # If user selected a preset directly or coordinate matches closely
        if corridor_preset and corridor_preset in GEO_PRESETS:
            preset = GEO_PRESETS[corridor_preset]
            # Try Local OSRM first to see if local Docker is serving this region
            local_success, local_routes = await self._try_osrm_request(
                self.local_url, origin_lat, origin_lon, dest_lat, dest_lon
            )
            if local_success and local_routes:
                return {
                    "routes": local_routes,
                    "routing_provenance": "LOCAL",
                    "origin": preset["origin"],
                    "destination": preset["destination"],
                    "corridor_name": preset["name"]
                }
            
            # Try Public OSRM
            public_success, public_routes = await self._try_osrm_request(
                self.public_url, origin_lat, origin_lon, dest_lat, dest_lon
            )
            if public_success and public_routes:
                return {
                    "routes": public_routes,
                    "routing_provenance": "PUBLIC",
                    "origin": preset["origin"],
                    "destination": preset["destination"],
                    "corridor_name": preset["name"]
                }
            
            # Explicit High-Fidelity Demo Router
            return {
                "routes": preset["routes"],
                "routing_provenance": "DEMO",
                "origin": preset["origin"],
                "destination": preset["destination"],
                "corridor_name": preset["name"]
            }

        # Otherwise arbitrary coordinates:
        # Tier 1: Local OSRM
        local_success, local_routes = await self._try_osrm_request(
            self.local_url, origin_lat, origin_lon, dest_lat, dest_lon
        )
        if local_success and local_routes:
            return {
                "routes": local_routes,
                "routing_provenance": "LOCAL",
                "origin": {"name": "Selected Origin", "lat": origin_lat, "lon": origin_lon},
                "destination": {"name": "Selected Destination", "lat": dest_lat, "lon": dest_lon},
                "corridor_name": "Custom Local OSRM Corridor"
            }

        # Tier 2: Public OSRM
        public_success, public_routes = await self._try_osrm_request(
            self.public_url, origin_lat, origin_lon, dest_lat, dest_lon
        )
        if public_success and public_routes:
            return {
                "routes": public_routes,
                "routing_provenance": "PUBLIC",
                "origin": {"name": "Selected Origin", "lat": origin_lat, "lon": origin_lon},
                "destination": {"name": "Selected Destination", "lat": dest_lat, "lon": dest_lon},
                "corridor_name": "Custom Public OSRM Corridor"
            }

        # Tier 3: Explicit Demo Fallback matching nearest preset or default
        default_preset = GEO_PRESETS["bangalore_tech_corridor"]
        return {
            "routes": default_preset["routes"],
            "routing_provenance": "DEMO",
            "origin": {"name": "Demo Origin", "lat": origin_lat, "lon": origin_lon},
            "destination": {"name": "Demo Destination", "lat": dest_lat, "lon": dest_lon},
            "corridor_name": default_preset["name"]
        }

    async def _try_osrm_request(self, base_url: str, o_lat: float, o_lon: float, d_lat: float, d_lon: float):
        url = f"{base_url}/route/v1/driving/{o_lon},{o_lat};{d_lon},{d_lat}?overview=full&geometries=geojson&alternatives=true&steps=true"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("code") == "Ok" and "routes" in data:
                        parsed_routes = []
                        for idx, r in enumerate(data["routes"]):
                            coords = [[pt[1], pt[0]] for pt in r["geometry"]["coordinates"]]
                            dist_km = round(r["distance"] / 1000.0, 1)
                            dur_min = round(r["duration"] / 60.0, 1)
                            route_id = f"route_osrm_{idx + 1}"
                            
                            # Construct segment representations from steps or geometry
                            segments = self._build_segments_from_osrm(r, route_id, dist_km)
                            
                            parsed_routes.append({
                                "id": route_id,
                                "name": f"OSRM Alternative {idx + 1}" if idx > 0 else "OSRM Primary Route",
                                "summary": r.get("legs", [{}])[0].get("summary", f"Via Arterial Link {idx+1}") or f"Route {idx+1}",
                                "distance_km": dist_km,
                                "base_duration_min": dur_min,
                                "toll_cost": 0.0 if idx == 0 else 30.0,
                                "segments": segments,
                                "coordinates": coords
                            })
                        return True, parsed_routes
        except Exception as e:
            logger.debug(f"OSRM request to {base_url} failed: {e}")
        return False, None

    def _build_segments_from_osrm(self, osrm_route: Dict, route_id: str, dist_km: float) -> List[Dict]:
        """Maps OSRM legs/steps to standard segment IDs for traffic matching."""
        segments = []
        legs = osrm_route.get("legs", [])
        if legs and "steps" in legs[0]:
            steps = legs[0]["steps"]
            for i, step in enumerate(steps[:5]): # Up to 5 key segments
                step_name = step.get("name") or f"Corridor Link {i+1}"
                step_len_km = max(0.8, round(step.get("distance", 1000.0) / 1000.0, 1))
                seg_id = f"SEG_{route_id}_{i+1}"
                segments.append({
                    "id": seg_id,
                    "name": step_name,
                    "length_km": step_len_km,
                    "freeflow": 60.0
                })
        
        if not segments:
            # Fallback segment breakdown
            segments = [
                {"id": f"SEG_{route_id}_1", "name": "Initial Arterial Corridor", "length_km": round(dist_km * 0.4, 1), "freeflow": 55.0},
                {"id": f"SEG_{route_id}_2", "name": "Main Expressway / Bypass", "length_km": round(dist_km * 0.4, 1), "freeflow": 75.0},
                {"id": f"SEG_{route_id}_3", "name": "Destination Terminal Access", "length_km": round(dist_km * 0.2, 1), "freeflow": 50.0}
            ]
        return segments

osrm_client = OSRMClient()
