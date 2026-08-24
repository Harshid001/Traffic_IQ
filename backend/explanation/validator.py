import re
from typing import Dict, Any, List, Set

class ExplanationValidator:
    """
    3-Layer Explanation Verification System:
    Layer 1: Number Validation (ensures LLM does not hallucinate new numerical values)
    Layer 2: Fact/Entity Validation (ensures correct road names, trends, and risk tags)
    Layer 3: Decision Consistency (ensures LLM does not reverse or alter the Best vs Fastest route decision)
    """
    def validate(self, generated_text: str, verified_facts: Dict[str, Any]) -> Dict[str, Any]:
        rejection_reasons = []
        
        if not generated_text or len(generated_text.strip()) < 15:
            return {
                "is_valid": False,
                "rejection_reasons": ["Empty or trivially short response"],
                "layer_1_passed": False,
                "layer_2_passed": False,
                "layer_3_passed": False
            }

        # -------------------------------------------------------------
        # LAYER 3: Decision Consistency Check
        # -------------------------------------------------------------
        best_id = str(verified_facts.get("best_route", {}).get("name", "")).lower()
        fastest_id = str(verified_facts.get("fastest_route", {}).get("name", "")).lower()
        are_different = verified_facts.get("are_different", False)
        
        text_lower = generated_text.lower()
        
        if are_different and fastest_id and best_id:
            # If Best != Fastest, text should not claim Fastest is the recommended Best route
            if f"{fastest_id} is recommended" in text_lower or f"{fastest_id} is the best" in text_lower:
                if f"{best_id} is recommended" not in text_lower and f"{best_id} is the best" not in text_lower:
                    rejection_reasons.append(
                        f"Layer 3 Violation (Decision Consistency): Incorrectly declared {fastest_id} as recommended instead of {best_id}."
                    )

        # -------------------------------------------------------------
        # LAYER 2: Fact / Entity & Trend Consistency Check
        # -------------------------------------------------------------
        best_trend = str(verified_facts.get("best_route", {}).get("trend", "")).upper()
        fastest_trend = str(verified_facts.get("fastest_route", {}).get("trend", "")).upper()
        
        if best_trend == "CLEARING" and "worsening" in text_lower and best_id and best_id in text_lower:
            if "clearing" not in text_lower:
                rejection_reasons.append("Layer 2 Violation: Claimed Best route is worsening when verified trend is CLEARING.")

        # -------------------------------------------------------------
        # LAYER 1: Number Extraction and Fact Matching
        # -------------------------------------------------------------
        allowed_numbers: Set[float] = self._extract_allowed_numbers(verified_facts)
        # Strip out explicit list numbering like "1. ", "2. ", "(1)", "[1]" to avoid list formatting noise
        cleaned_text = re.sub(r'^\s*[\(\[]?\d+[\)\]\.]\s+', ' ', generated_text, flags=re.MULTILINE)
        found_numbers: List[float] = self._extract_numbers_from_text(cleaned_text)
        
        unmatched_numbers = []
        for num in found_numbers:
            # Check if num is close to any allowed verified number within +/- 1.0 (for rounding)
            matched = any(abs(num - allowed) <= 1.0 for allowed in allowed_numbers)
            if not matched:
                unmatched_numbers.append(num)
                
        # If model hallucinated more than 1 unsupported number
        if len(unmatched_numbers) > 1:
            rejection_reasons.append(
                f"Layer 1 Violation (Number Hallucination): Found unsupported numbers {unmatched_numbers} not in verified JSON."
            )

        is_valid = (len(rejection_reasons) == 0)
        return {
            "is_valid": is_valid,
            "rejection_reasons": rejection_reasons,
            "layer_1_passed": len(unmatched_numbers) <= 1,
            "layer_2_passed": not any("Layer 2" in r for r in rejection_reasons),
            "layer_3_passed": not any("Layer 3" in r for r in rejection_reasons)
        }

    def _extract_allowed_numbers(self, facts: Dict[str, Any]) -> Set[float]:
        allowed = set()
        
        def recurse_extract(obj):
            if isinstance(obj, (int, float)):
                allowed.add(float(obj))
            elif isinstance(obj, dict):
                for k, v in obj.items():
                    recurse_extract(v)
            elif isinstance(obj, list):
                allowed.add(float(len(obj))) # allow candidate count
                for item in obj:
                    recurse_extract(item)
                    
        recurse_extract(facts)
        
        # Add standard horizons (10, 20, 30 min)
        allowed.update([10.0, 20.0, 30.0])
        
        # Also include differences (deltas) between best and fastest
        best = facts.get("best_route", {})
        fastest = facts.get("fastest_route", {})
        if best and fastest:
            b_eta = best.get("predicted_eta_p50", 0)
            f_eta = fastest.get("predicted_eta_p50", 0)
            allowed.add(abs(float(b_eta - f_eta)))
            
            b_cong = best.get("avg_congestion", 0)
            f_cong = fastest.get("avg_congestion", 0)
            allowed.add(abs(float(b_cong - f_cong)))
            
        return allowed

    def _extract_numbers_from_text(self, text: str) -> List[float]:
        # Extract floats and integers (e.g., "24", "24.5", "18%")
        pattern = r'\b\d+(?:\.\d+)?\b'
        matches = re.findall(pattern, text)
        return [float(m) for m in matches]

explanation_validator = ExplanationValidator()
