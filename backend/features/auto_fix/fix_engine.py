# features/auto_fix/fix_engine.py

import json
import re
from agents.core import LiteLlm
from .fix_prompt import FIX_PROMPT
from agents.config import standard_model
 
fix_model = standard_model

def generate_auto_fixes(
    verdict_json: dict,
    risk_assessment: dict,
    feature_context: dict
) -> dict:
    """
    Generates actionable compliance fixes using an LLM.
    """

    payload = {
        "verdict": verdict_json,
        "risk_assessment": risk_assessment,
        "feature_context": feature_context
    }

    messages = [
        {
            "role": "system",
            "content": FIX_PROMPT
        },
        {
            "role": "user",
            "content": json.dumps(payload, indent=2)
        }
    ]

    response = fix_model.complete(messages)
    raw_output = response.choices[0].message.content

    # --- DEFENSIVE PARSING START ---
    try:
        # 1. Try parsing directly
        fix_data = json.loads(raw_output)
    except json.JSONDecodeError:
        try:
            # 2. Try cleaning markdown code blocks
            clean_text = raw_output.replace("```json", "").replace("```", "").strip()
            fix_data = json.loads(clean_text)
        except json.JSONDecodeError as e:
            print(f"[ERROR] Failed to parse Auto-Fix JSON. Raw output:\n{raw_output}")
            # Return a fallback error object instead of crashing
            return {
                "auto_fix": {
                    "summary": "Error generating fixes.",
                    "fixes": [{
                        "title": "Generation Failed",
                        "severity": "Low",
                        "description": "The AI response could not be parsed.",
                        "issue_reference": "N/A",
                        "remediation_strategy": "Please retry the analysis.",
                        "implementation_steps": ["Retry operation"],
                        "category": "System"
                    }]
                }
            }
    # --- DEFENSIVE PARSING END ---

    return fix_data