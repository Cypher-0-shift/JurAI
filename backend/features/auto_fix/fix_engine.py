# features/auto_fix/fix_engine.py

import json
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

    try:
        fix_data = json.loads(raw_output)
    except json.JSONDecodeError as e:
        raise ValueError("Auto-Fix LLM did not return valid JSON") from e

    return fix_data
