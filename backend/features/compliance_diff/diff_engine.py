# features/compliance_diff/diff_engine.py

import json
from backend.agents.core import LiteLlm
from .diff_prompt import DIFF_PROMPT

from backend.agents.config import mistral_model
 
diff_model = mistral_model

def generate_compliance_diff(
    previous_verdict: dict,
    current_verdict: dict,
    previous_laws_snapshot: list | None = None,
    current_laws_snapshot: list | None = None
) -> dict:
    """
    Uses an LLM to explain WHY compliance outcomes changed
    between two verdicts.
    """

    payload = {
        "previous_verdict": previous_verdict,
        "current_verdict": current_verdict,
        "previous_laws_snapshot": previous_laws_snapshot,
        "current_laws_snapshot": current_laws_snapshot
    }

    messages = [
        {
            "role": "system",
            "content": DIFF_PROMPT
        },
        {
            "role": "user",
            "content": json.dumps(payload, indent=2)
        }
    ]

    response = diff_model.complete(messages)
    raw_output = response.choices[0].message.content

    try:
        diff_data = json.loads(raw_output)
    except json.JSONDecodeError as e:
        raise ValueError("Compliance Diff LLM did not return valid JSON") from e

    return diff_data
