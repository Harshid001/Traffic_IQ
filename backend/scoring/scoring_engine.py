from typing import List, Dict, Any

PREFERENCE_WEIGHTS = {
    "BALANCED": {
        "eta": 0.30,
        "traffic": 0.20,
        "forecast": 0.20,
        "reliability": 0.15,
        "distance": 0.10,
        "risk": 0.05,
        "toll": 0.00
    },
    "MOST_RELIABLE": {
        "reliability": 0.45,
        "forecast": 0.25,
        "traffic": 0.15,
        "eta": 0.15,
        "distance": 0.00,
        "risk": 0.00,
        "toll": 0.00
    },
    "LOWEST_TRAFFIC": {
        "traffic": 0.45,
        "forecast": 0.25,
        "eta": 0.15,
        "reliability": 0.15,
        "distance": 0.00,
        "risk": 0.00,
        "toll": 0.00
    },
    "AVOID_TOLLS": {
        "toll": 0.35,
        "eta": 0.25,
        "traffic": 0.20,
        "reliability": 0.15,
        "distance": 0.05,
        "forecast": 0.00,
        "risk": 0.00
    },
    "FASTEST": {
        "eta": 0.70,
        "traffic": 0.15,
        "forecast": 0.15,
        "reliability": 0.00,
        "distance": 0.00,
        "risk": 0.00,
        "toll": 0.00
    }
}

class ScoringEngine:
    def score_routes(self, evaluated_routes: List[Dict[str, Any]], preference_profile: str = "BALANCED") -> Dict[str, Any]:
        """
        Calculates multi-objective scores for candidate routes and deterministically isolates:
        1. ⚡ FASTEST ROUTE: Strictly argmin(predicted P50 ETA).
        2. ⭐ BEST ROUTE: Strictly argmax(preference multi-objective score).
        """
        if not evaluated_routes:
            return {"fastest_route_id": None, "best_route_id": None, "routes": []}

        profile_key = preference_profile.upper() if preference_profile.upper() in PREFERENCE_WEIGHTS else "BALANCED"
        weights = PREFERENCE_WEIGHTS[profile_key]
        
        # Min/max bounds across candidate pool for normalization
        min_eta = min(r["predicted_eta_p50"] for r in evaluated_routes)
        max_eta = max(r["predicted_eta_p50"] for r in evaluated_routes)
        min_dist = min(r["distance_km"] for r in evaluated_routes)
        max_dist = max(r["distance_km"] for r in evaluated_routes)

        scored_routes = []
        for r in evaluated_routes:
            eta_val = r["predicted_eta_p50"]
            cong_val = r["avg_congestion"]
            fc_val = r.get("forecast_20m_p50", cong_val)
            rel_score = r.get("reliability", {}).get("reliability_score", 0.75)
            dist_val = r["distance_km"]
            has_incident = r.get("has_incident", False)
            incident_risk = r.get("reliability", {}).get("incident_risk_pct", 5.0)
            toll_val = r.get("toll_cost", 0.0)

            # Sub-scores (0 - 100, higher is better)
            eta_spread = max(1.0, max_eta - min_eta)
            score_eta = max(0.0, 100.0 - ((eta_val - min_eta) / eta_spread) * 45.0)
            score_traffic = max(0.0, 100.0 - cong_val)
            score_forecast = max(0.0, 100.0 - fc_val)
            score_rel = rel_score * 100.0
            
            dist_spread = max(1.0, max_dist - min_dist)
            score_dist = max(0.0, 100.0 - ((dist_val - min_dist) / dist_spread) * 35.0)
            
            score_risk = max(0.0, 100.0 - (incident_risk * 3.0) - (30.0 if has_incident else 0.0))
            score_toll = 100.0 if toll_val == 0 else max(20.0, 100.0 - (toll_val * 1.5))

            # Weighted sum
            total_score = (
                score_eta * weights.get("eta", 0.0) +
                score_traffic * weights.get("traffic", 0.0) +
                score_forecast * weights.get("forecast", 0.0) +
                score_rel * weights.get("reliability", 0.0) +
                score_dist * weights.get("distance", 0.0) +
                score_risk * weights.get("risk", 0.0) +
                score_toll * weights.get("toll", 0.0)
            )
            
            # Incorporate uncertainty penalty (P90 - P10 forecast spread)
            p10_eta = r.get("predicted_eta_p10", eta_val * 0.9)
            p90_eta = r.get("predicted_eta_p90", eta_val * 1.2)
            uncertainty_spread = p90_eta - p10_eta
            total_score = max(10.0, total_score - (uncertainty_spread * 0.4))
            
            scored_route = {
                **r,
                "score": int(round(total_score)),
                "sub_scores": {
                    "eta_score": int(round(score_eta)),
                    "traffic_score": int(round(score_traffic)),
                    "forecast_score": int(round(score_forecast)),
                    "reliability_score": int(round(score_rel)),
                    "distance_score": int(round(score_dist)),
                    "risk_score": int(round(score_risk)),
                    "toll_score": int(round(score_toll))
                }
            }
            scored_routes.append(scored_route)

        # FASTEST ROUTE: Strictly argmin(predicted_eta_p50)
        fastest_route = min(scored_routes, key=lambda x: x["predicted_eta_p50"])
        
        # BEST ROUTE: Strictly argmax(score)
        best_route = max(scored_routes, key=lambda x: x["score"])

        # Mark tags
        for r in scored_routes:
            r["is_fastest"] = (r["id"] == fastest_route["id"])
            r["is_best"] = (r["id"] == best_route["id"])

        return {
            "preference_profile": profile_key,
            "fastest_route_id": fastest_route["id"],
            "best_route_id": best_route["id"],
            "are_different": (fastest_route["id"] != best_route["id"]),
            "routes": scored_routes
        }

scoring_engine = ScoringEngine()
