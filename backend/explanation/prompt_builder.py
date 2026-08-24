import json
from typing import Dict, Any

class ExplanationPromptBuilder:
    @staticmethod
    def build_explanation_prompt(verified_context: Dict[str, Any]) -> str:
        """
        Builds a strict, constrained prompt providing only verified numerical facts.
        """
        facts_json_str = json.dumps(verified_context, indent=2)
        
        prompt = f"""You are the Explainability Engine of an advanced traffic navigation system.
Your job is to explain to the driver why the system recommended the ⭐ Best Route and how it compares to the ⚡ Fastest Route.

STRICT RULES:
1. Use ONLY the verified numbers and facts provided in the JSON below.
2. DO NOT invent, calculate, or hallucinate any numbers, times, percentages, or distances not present in the JSON.
3. Clearly state the trade-off (e.g. difference in ETA, congestion trend, reliability, and forecast).
4. Keep the explanation concise, professional, and easy to read while driving (2 to 4 bullet points max).
5. State which route is ⭐ Best and which is ⚡ Fastest according to the JSON.

VERIFIED FACTS JSON:
{facts_json_str}

EXPLANATION:"""
        return prompt

prompt_builder = ExplanationPromptBuilder()
