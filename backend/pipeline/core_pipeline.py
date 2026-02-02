import json
import uuid
import logging
from datetime import datetime
from typing import Dict, Optional

# Core dependencies (existing)
from backend.agents.jury_system import run_pipeline as run_agents_pipeline
from backend.features.compliance_history.history_manager import (
    store_verdict,
    get_previous_verdict
)
from backend.features.compliance_diff.diff_engine import generate_compliance_diff
from backend.agents import config as agents_config
from backend.features.risk_reasoning import risk_engine as risk_module
from backend.features.compliance_diff import diff_engine as diff_module
from backend.features.auto_fix import fix_engine as fix_module

# Configure logging
logger = logging.getLogger(__name__)

def _parse_verdict(raw_verdict: any) -> Dict:
    """Accept (string or dict) and return a dict verdict."""
    if isinstance(raw_verdict, dict):
        return raw_verdict
    if isinstance(raw_verdict, str):
        raw = raw_verdict.strip()
        
        # 1. Try stripping code blocks first (standard)
        if "```" in raw:
            import re
            match = re.search(r"```(?:json)?(.*?)```", raw, re.DOTALL)
            if match:
                raw = match.group(1).strip()
        
        try:
             # 2. Direct parse
            parsed = json.loads(raw)
            # Handle recursive stringified JSON case
            if isinstance(parsed, str):
                 try:
                     parsed = json.loads(parsed)
                 except: 
                     pass
            return parsed
        except json.JSONDecodeError:
            # 3. Fallback: Find outer-most brackets
            try:
                start_index = raw.find('{')
                end_index = raw.rfind('}')
                if start_index != -1 and end_index != -1:
                    json_str = raw[start_index:end_index+1]
                    return json.loads(json_str)
            except Exception:
                pass
                
            # If all fails, raise
            raise ValueError(f"Judge output is not valid JSON. Output: {raw[:100]}...")

def _build_models_used() -> Dict[str, str]:
    models = {
        "jury": getattr(agents_config, "llama_model", "unknown"),
        "critic": getattr(agents_config, "mistral_model", "unknown"),
        "judge": getattr(agents_config, "mistral_model", "unknown"),
        "risk": getattr(risk_module, "risk_model", None),
        "diff": getattr(diff_module, "diff_model", None),
        "auto_fix": getattr(fix_module, "fix_model", None),
    }
    for k, v in models.items():
        if v is None:
            models[k] = "unknown"
        else:
            models[k] = getattr(v, "model", str(v))
    return models

def _extract_jurisdictions_from_verdict(verdict: Dict) -> list:
    regions = []
    try:
        r = verdict.get("regions_affected", [])
        if isinstance(r, list):
            for entry in r:
                if isinstance(entry, dict) and "region" in entry:
                    regions.append(entry["region"])
                elif isinstance(entry, str):
                    regions.append(entry)
    except Exception:
        pass
    return list(dict.fromkeys(regions))

def run_core_pipeline(context_data: Dict, on_event=None) -> Dict:
    """
    Executes Pipeline A: Core Compliance Pipeline (Judge).
    Returns verdict, compliance_diff, and metadata immediately.
    """
    logger.info("Starting Core Pipeline")
    
    # 1. Run agents
    agent_output = run_agents_pipeline(context_data, on_event=on_event)
    
    # Handle new dict return with trace
    if isinstance(agent_output, dict) and "verdict_json" in agent_output:
        raw_verdict = agent_output["verdict_json"]
        execution_trace = agent_output.get("execution_trace", [])
    else:
        # Fallback
        raw_verdict = agent_output
        execution_trace = []
    
    # 2. Parse verdict
    verdict_obj = _parse_verdict(raw_verdict)
    
    # 3. Identify ID
    feature_id = context_data.get("feature_id") or verdict_obj.get("feature") or verdict_obj.get("feature_id")
    if not feature_id:
        raise ValueError("feature_id missing in context and verdict")
        
    # 4. Fetch previous
    previous_record = get_previous_verdict(feature_id)
    
    # 5. Store current
    laws_snapshot = verdict_obj.get("laws_snapshot") if isinstance(verdict_obj.get("laws_snapshot"), list) else None
    
    stored_record = store_verdict(
        feature_id=feature_id,
        verdict=verdict_obj,
        laws_snapshot=laws_snapshot
    )
    
    # 6. Compliance Diff
    compliance_diff = None
    if previous_record:
        try:
            compliance_diff = generate_compliance_diff(
                previous_verdict=previous_record.get("verdict"),
                current_verdict=verdict_obj,
                previous_laws_snapshot=previous_record.get("laws_snapshot"),
                current_laws_snapshot=stored_record.get("laws_snapshot")
            )
        except Exception as e:
            logger.error(f"Diff generation failed: {e}")
            compliance_diff = {
                "compliance_diff": {
                    "summary": "Diff generation failed",
                    "error": str(e)
                }
            }
            
    # 7. Metadata
    metadata = {
        "verdict_version": stored_record.get("version"),
        "previous_verdict_exists": bool(previous_record),
        "jurisdictions_evaluated": _extract_jurisdictions_from_verdict(verdict_obj),
        "models_used": _build_models_used()
    }
    
    run_id = f"run_{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}_{uuid.uuid4().hex[:6]}"
    
    return {
        "feature_id": feature_id,
        "run_id": run_id,
        "timestamp": stored_record.get("timestamp"),
        "verdict": verdict_obj,
        "compliance_diff": compliance_diff,
        "metadata": metadata,
        "agent_trace": execution_trace
    }
