import pytest
import httpx
from backend.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] in ["healthy", "degraded"]
        assert "services" in data
        assert "database" in data["services"]
        assert "forecasting_engine" in data["services"]

@pytest.mark.asyncio
async def test_route_calculation():
    payload = {
        "origin_lat": 12.9756,
        "origin_lon": 77.6066,
        "dest_lat": 12.9863,
        "dest_lon": 77.7340,
        "corridor_preset": "bangalore_tech_corridor",
        "preference_profile": "BALANCED"
    }
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/api/routes/calculate", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "routes" in data
        assert len(data["routes"]) > 0
        assert "best_route_id" in data
        assert "fastest_route_id" in data
        assert "explanation" in data
        assert "routing_provenance" in data

@pytest.mark.asyncio
async def test_what_if_departure():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # First calculate routes
        calc_resp = await client.post("/api/routes/calculate", json={
            "origin_lat": 12.9756,
            "origin_lon": 77.6066,
            "dest_lat": 12.9863,
            "dest_lon": 77.7340,
            "corridor_preset": "bangalore_tech_corridor"
        })
        assert calc_resp.status_code == 200
        routes = calc_resp.json()["routes"]

@pytest.mark.asyncio
async def test_copilot_chat():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "query": "Is there any heavy traffic on the route?",
            "corridor_name": "Ahmedabad-Gandhinagar",
            "route_context": {
                "best_route": {
                    "name": "SG Highway Express",
                    "distance_km": 18.2,
                    "predicted_eta_p50": 24,
                    "toll_cost": 0,
                    "avg_congestion": 28
                }
            },
            "messages": [
                {"role": "user", "content": "Hello Copilot"}
            ]
        }
        resp = await client.post("/api/routes/chat", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "response" in data
        assert "model" in data
        assert "provenance" in data
        assert data["status"] == "success"
        assert len(data["response"]) > 0
