import logging
from typing import Dict, Any

from features.risk_reasoning.risk_engine import generate_risk_assessment
from features.compliance_history.history_manager import get_latest_verdict

# Configure logging
logger = logging.getLogger(__name__)

def run_risk_pipeline(feature_id: str, run_id: str, verdict_data: Dict = None, context_data: Dict = None) -> Dict:
    """
    Executes Pipeline B: Risk Reasoning Pipeline.
    Can be triggered via API with feature_id/run_id, or passed verdict directly.
    """
    logger.info(f"Starting Risk Pipeline for feature {feature_id}")

    # 1. Fetch verdict if not provided
    if not verdict_data:
        # In a real DB scenario we might fetch by run_id, but here we use file-based history
        # Limitation: history_manager gets *latest* version. For strict correctness we might need get_verdict_by_run_id (not impl yet)
        # For now, we assume caller or latest is sufficient, or we rely on passed data.
        # If run_id is passed, we ideally want THAT specific verdict.
        # As a fallback, we get latest.
        verdict_record = get_latest_verdict(feature_id)
        if not verdict_record:
            raise ValueError(f"No verdict found for feature {feature_id}")
        verdict_data = verdict_record.get("verdict")
    
    if not context_data:
         # Context might be inside the verdict or stored separately. 
         # The original context isn't strictly stored in the verdict record in `history_manager`. 
         # But `generate_risk_assessment` needs `feature_context`.
         # HACK: If context is missing, we try to reconstruct minimal context from verdict or fail gracefully.
         # Ideally, context should be stored in DB. Since we are adding DB later, we might assume context is passed or embedded.
         context_data = {"feature_id": feature_id} # Minimal fallback

    # 2. Run Risk Reasoning (LLM)
    try:
        risk_assessment = generate_risk_assessment(
            verdict_json=verdict_data,
            feature_context=context_data
        )
    except Exception as e:
        raise RuntimeError(f"Risk reasoning failed: {str(e)}") from e

    # 3. Compute Governance Flags
    overall_risk = ""
    try:
        overall_risk = risk_assessment.get("risk_assessment", {}).get("overall_risk", "")
    except Exception:
        pass

    human_review_required = overall_risk in {"High", "Critical"}
    
    governance = {
        "human_review_required": human_review_required,
        "review_status": "Pending" if human_review_required else "Approved",
        "reviewed_by": None,
        "review_reason": None,
        "audit_id": None
    }

    return {
        "feature_id": feature_id,
        "run_id": run_id,
        "risk_assessment": risk_assessment,
        "governance": governance
    }
