from typing import Dict, Optional
from datetime import datetime
import uuid

# Config
HIGH_RISK_LEVELS = {"High", "Critical"}

# Core Human Override Function
def human_override(
    ai_verdict: Dict,
    compliance_metrics: Dict,
    reviewer_id: str,
    decision: str,
    reason: str,
    edited_verdict: Optional[Dict] = None
) -> Dict:
    """
    Applies mandatory human review to AI legal verdicts.
     decision: "Approved" or "Rejected" or "Modified"
    """

    legal_risk = compliance_metrics.get("legal_risk", "Low")

    # Enforce mandatory review for high-risk cases
    if legal_risk in HIGH_RISK_LEVELS and decision not in {"Approved", "Modified"}:
        raise ValueError(
            "High or Critical risk cases must be explicitly Approved or Modified by a human reviewer."
        )

    final_verdict = edited_verdict if edited_verdict else ai_verdict

    audit_record = {
        "audit_id": str(uuid.uuid4()),
        "ai_verdict": ai_verdict,
        "final_verdict": final_verdict,
        "review_status": decision,
        "reviewed_by": reviewer_id,
        "review_reason": reason,
        "legal_risk": legal_risk,
        "timestamp": datetime.utcnow().isoformat()
    }

    return audit_record
