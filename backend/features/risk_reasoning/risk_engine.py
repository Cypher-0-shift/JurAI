# features/risk_reasoning/risk_engine.py

import json
from backend.agents.core import LiteLlm
from .risk_prompt import RISK_PROMPT

from backend.agents.config import mistral_model
 
# Use centralized standard model (Gemini 1.5 Flash)
risk_model = mistral_model

def generate_risk_assessment(
    verdict_json: dict,
    feature_context: dict
) -> dict:
    """
    Generates an explainable legal risk assessment using an LLM.
    """

    messages = [
        {
            "role": "system",
            "content": RISK_PROMPT
        },
        {
            "role": "user",
            "content": json.dumps({
                "verdict": verdict_json,
                "feature_context": feature_context
            }, indent=2)
        }
    ]

    response = risk_model.complete(messages)

    raw_output = response.choices[0].message.content

    try:
        raw_output = raw_output.strip()
        if "```" in raw_output:
            import re
            match = re.search(r"```(?:json)?(.*?)```", raw_output, re.DOTALL)
            if match:
                raw_output = match.group(1).strip()
        
        risk_data = json.loads(raw_output)
    except json.JSONDecodeError as e:
        print(f"[ERROR] Risk JSON Parse Failed. Raw Output:\n{raw_output}\n")
        raise ValueError("Risk LLM did not return valid JSON") from e

    return risk_data
