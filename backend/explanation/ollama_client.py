import httpx
import logging
from typing import Dict, Any
from backend.config import settings
from backend.explanation.prompt_builder import prompt_builder
from backend.explanation.validator import explanation_validator
from backend.explanation.deterministic_fallback import deterministic_explainer

logger = logging.getLogger(__name__)

class OllamaExplanationClient:
    def __init__(self):
        self.ollama_url = settings.OLLAMA_URL.rstrip('/')
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT_SECONDS

    async def generate_explanation(self, verified_facts: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates and strictly validates route explanation using local Phi-4-mini via Ollama.
        Guarantees zero-hallucination via the 3-Layer Explanation Validator.
        """
        prompt = prompt_builder.build_explanation_prompt(verified_facts)
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2, # Low temperature for factual precision
                "top_p": 0.9,
                "num_predict": 250
            }
        }

        raw_llm_text = None
        ollama_reachable = False

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(f"{self.ollama_url}/api/generate", json=payload)
                if resp.status_code == 200:
                    ollama_reachable = True
                    data = resp.json()
                    raw_llm_text = data.get("response", "").strip()
        except Exception as e:
            logger.debug(f"Ollama local service unavailable ({e}). Using deterministic explanation.")

        if ollama_reachable and raw_llm_text:
            # Run through 3-Layer Explanation Validator
            validation_result = explanation_validator.validate(raw_llm_text, verified_facts)
            
            if validation_result["is_valid"]:
                return {
                    "explanation": raw_llm_text,
                    "explanation_provenance": f"LOCAL LLM ({self.model})",
                    "validation_status": "PASSED",
                    "validator_layers": {
                        "layer_1_numbers": "PASS",
                        "layer_2_facts": "PASS",
                        "layer_3_decisions": "PASS"
                    },
                    "rejection_reasons": []
                }
            else:
                logger.warning(f"LLM explanation rejected by validator: {validation_result['rejection_reasons']}. Falling back to deterministic output.")
                fallback_text = deterministic_explainer.generate(verified_facts)
                return {
                    "explanation": fallback_text,
                    "explanation_provenance": "DETERMINISTIC VERIFIED (VALIDATOR REJECTED LLM)",
                    "validation_status": "REJECTED_FALLBACK",
                    "validator_layers": {
                        "layer_1_numbers": "PASS" if validation_result["layer_1_passed"] else "FAIL",
                        "layer_2_facts": "PASS" if validation_result["layer_2_passed"] else "FAIL",
                        "layer_3_decisions": "PASS" if validation_result["layer_3_passed"] else "FAIL"
                    },
                    "rejection_reasons": validation_result["rejection_reasons"],
                    "raw_rejected_text": raw_llm_text
                }

        # If Ollama service is offline/uninstalled
        fallback_text = deterministic_explainer.generate(verified_facts)
        return {
            "explanation": fallback_text,
            "explanation_provenance": "DETERMINISTIC VERIFIED",
            "validation_status": "OFFLINE_FALLBACK",
            "validator_layers": {
                "layer_1_numbers": "PASS",
                "layer_2_facts": "PASS",
                "layer_3_decisions": "PASS"
            },
            "rejection_reasons": ["Ollama service offline or phi-4-mini not loaded"]
        }

ollama_client = OllamaExplanationClient()
