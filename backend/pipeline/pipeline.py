# pipeline/pipeline.py
"""
Aggregator for JurAI compliance runs.
Relocated to pipeline/ package.
"""

from typing import Dict, Optional
import json
from .core_pipeline import run_core_pipeline

def run_full_pipeline(
    context_data: Dict,
    run_human_override: bool = False,
    reviewer_id: Optional[str] = None,
    reviewer_decision: Optional[str] = None,
    reviewer_reason: Optional[str] = None
) -> Dict:
    """
    Orchestrates a run by triggering the Core Pipeline.
    Returns the Core results immediately with placeholders for Risk/Autofix.
    """
    
    # 1. Run Core Pipeline
    core_result = run_core_pipeline(context_data)
    
    # 2. Construct Full Response (Aggregator)
    final_response = {
        "feature_id": core_result["feature_id"],
        "run_id": core_result["run_id"],
        "timestamp": core_result["timestamp"],
        "verdict": core_result["verdict"],
        "compliance_diff": core_result["compliance_diff"],
        "metadata": core_result["metadata"],
        "agent_trace": core_result.get("agent_trace", []),
        
        # Placeholders for decoupled stages
        "risk_assessment": None,
        "auto_fix": None,
        "governance": {
            "human_review_required": True,
            "review_status": "Pending",
            "reviewed_by": None,
            "review_reason": None,
            "audit_id": None
        }
    }
    
    return final_response
