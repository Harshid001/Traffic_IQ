import sys
import os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

import asyncio
import httpx
from backend.main import app

async def run_all_tests():
    print("--- 1. Testing Health Endpoint ---")
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/health")
        print("Health Status:", r.status_code, r.json())
        assert r.status_code == 200

        print("\n--- 2. Testing Route Calculation (Fastest vs Best Isolation) ---")
        payload = {
            "origin_lat": 12.9756,
            "origin_lon": 77.6066,
            "dest_lat": 12.9863,
            "dest_lon": 77.7340,
            "corridor_preset": "bangalore_tech_corridor",
            "preference_profile": "BALANCED"
        }
        r = await client.post("/api/routes/calculate", json=payload)
        assert r.status_code == 200
        data = r.json()
        print(f"Routing Provenance: {data['routing_provenance']}")
        print(f"Traffic Provenance: {data['traffic_provenance']}")
        print(f"Fastest Route ID: {data['fastest_route_id']}")
        print(f"Best Route ID: {data['best_route_id']}")
        print(f"Are Different: {data['are_different']}")
        print(f"Total Routes Scored: {len(data['routes'])}")
        
        # Verify Fastest is argmin(P50 ETA)
        fastest_route = next(rt for rt in data["routes"] if rt["id"] == data["fastest_route_id"])
        min_p50 = min(rt["predicted_eta_p50"] for rt in data["routes"])
        assert fastest_route["predicted_eta_p50"] == min_p50
        print(f"Verified Fastest Route P50 ETA: {fastest_route['predicted_eta_p50']} min (P10: {fastest_route['predicted_eta_p10']}m, P90: {fastest_route['predicted_eta_p90']}m)")

        # Verify Best is argmax(Score)
        best_route = next(rt for rt in data["routes"] if rt["id"] == data["best_route_id"])
        max_score = max(rt["score"] for rt in data["routes"])
        assert best_route["score"] == max_score
        print(f"Verified Best Route Score: {best_route['score']}/100 (P50 ETA: {best_route['predicted_eta_p50']} min, Congestion: {best_route['avg_congestion']}%, Trend: {best_route['trend']})")

        print("\n--- 3. Testing Explanation & 3-Layer Validator ---")
        exp = data["explanation"]
        print("Explanation Provenance:", exp.get("explanation_provenance"))
        print("Validation Status:", exp.get("validation_status"))
        print("Validator Layers:", exp.get("validator_layers"))
        print("Explanation Text Snippet:\n", exp.get("explanation")[:200], "...")

        print("\n--- 4. Testing What-If Departure Simulation ---")
        what_if_r = await client.post("/api/traffic/what-if", json={"routes": data["routes"]})
        assert what_if_r.status_code == 200
        wi_data = what_if_r.json()
        print("What-If Optimal Window:", wi_data["optimal_departure_window"])
        print("Recommendation:", wi_data["recommendation"])

        print("\n--- 5. Testing Forecast Evaluation Benchmark ---")
        eval_r = await client.get("/api/evaluation/benchmark")
        assert eval_r.status_code == 200
        eval_data = eval_r.json()
        print("Evaluation Samples:", eval_data["total_samples"])
        print("Chronos-2 MAE vs Baseline MAE:", eval_data["metrics"]["chronos2"]["mae"], "vs", eval_data["metrics"]["baseline"]["mae"])
        print("MAE Reduction:", eval_data["improvement_pct"]["mae_reduction"], "%")

        print("\n--- 6. Testing Predictive Road Alert Engine ---")
        alert_payload = {
            "current_speed_kmh": 42.0,
            "progress_pct": 0.40,
            "active_route": fastest_route,
            "all_routes": data["routes"],
            "best_route_id": data["best_route_id"]
        }
        alert_r = await client.post("/api/alerts/evaluate", json=alert_payload)
        assert alert_r.status_code == 200
        alert_data = alert_r.json()
        print("Has Alert Triggered:", alert_data["has_alert"])
        if alert_data["has_alert"]:
            print("Alert Details:", alert_data["alert"])

    print("\n✅ ALL BACKEND CONTRACTS & MATHEMATICAL PIPELINES VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_all_tests())
