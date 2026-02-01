import logging
from typing import Dict

from features.auto_fix.fix_engine import generate_auto_fixes
from features.compliance_history.history_manager import get_latest_verdict

# Configure logging
logger = logging.getLogger(__name__)

def run_autofix_pipeline(feature_id: str, run_id: str, verdict_data: Dict = None, risk_data: Dict = None, context_data: Dict = None) -> Dict:
    """
    Executes Pipeline C: Auto-Fix Pipeline.
    Needs Verdict AND Risk Assessment as input.
    """
    logger.info(f"Starting Auto-Fix Pipeline for feature {feature_id}")

    # 1. Fetch Verdict if missing
    if not verdict_data:
        verdict_record = get_latest_verdict(feature_id)
        if not verdict_record:
             raise ValueError(f"No verdict found for feature {feature_id}")
        verdict_data = verdict_record.get("verdict")

    # 2. Fetch Risk if missing (or accept None if we want to try autofix without risk, though engine might need it)
    # The fix_engine.generate_auto_fixes signature: (verdict_json, risk_assessment, feature_context)
    if risk_data is None:
        # In a real decoupled system, we'd fetch the risk result from DB using run_id.
        # Since we don't have the DB connected in this file yet (it's coming in models.py), 
        # we might have to assume it's passed or mock it. 
        # For now, if missing, we pass an empty dict which might degrade fix quality but won't crash import.
        risk_data = {}

    if not context_data:
        context_data = {"feature_id": feature_id}

    # 3. Run Auto-Fix (LLM)
    try:
        auto_fix = generate_auto_fixes(
            verdict_json=verdict_data,
            risk_assessment=risk_data,
            feature_context=context_data
        )
    except Exception as e:
        logger.error(f"Auto-fix generation failed: {e}")
        auto_fix = {
            "auto_fix": {
                "summary": "Auto-fix generation failed",
                "error": str(e),
                "fixes": []
            }
        }

    return {
        "feature_id": feature_id,
        "run_id": run_id,
        "auto_fix": auto_fix
    }
