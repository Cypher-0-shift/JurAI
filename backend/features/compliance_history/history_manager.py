# features/compliance_history/history_manager.py

import os
import json
from datetime import datetime
from typing import Optional, Dict, List

BASE_STORAGE_PATH = "storage/compliance_history"


def _ensure_feature_dir(feature_id: str) -> str:
    """
    Ensures the storage directory for a feature exists.
    """
    feature_dir = os.path.join(BASE_STORAGE_PATH, feature_id)
    os.makedirs(feature_dir, exist_ok=True)
    return feature_dir


def _get_next_version(feature_dir: str) -> str:
    """
    Determines the next verdict version number.
    """
    existing = [
        f for f in os.listdir(feature_dir)
        if f.startswith("verdict_") and f.endswith(".json")
    ]

    if not existing:
        return "001"

    versions = [
        int(f.replace("verdict_", "").replace(".json", ""))
        for f in existing
    ]

    return f"{max(versions) + 1:03d}"


def store_verdict(
    feature_id: str,
    verdict: Dict,
    laws_snapshot: Optional[List[Dict]] = None
) -> Dict:
    """
    Stores a verdict as an immutable, versioned record.
    """

    feature_dir = _ensure_feature_dir(feature_id)
    version = _get_next_version(feature_dir)

    record = {
        "feature_id": feature_id,
        "version": version,
        "timestamp": datetime.utcnow().isoformat(),
        "verdict": verdict,
        "laws_snapshot": laws_snapshot or []
    }

    file_path = os.path.join(feature_dir, f"verdict_{version}.json")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2)

    return record


def get_latest_verdict(feature_id: str) -> Optional[Dict]:
    """
    Retrieves the most recent verdict for a feature.
    """
    feature_dir = os.path.join(BASE_STORAGE_PATH, feature_id)

    if not os.path.exists(feature_dir):
        return None

    verdict_files = sorted(
        f for f in os.listdir(feature_dir)
        if f.startswith("verdict_") and f.endswith(".json")
    )

    if not verdict_files:
        return None

    latest_file = verdict_files[-1]
    with open(os.path.join(feature_dir, latest_file), "r", encoding="utf-8") as f:
        return json.load(f)


def get_previous_verdict(feature_id: str) -> Optional[Dict]:
    """
    Retrieves the verdict immediately before the latest one.
    """
    feature_dir = os.path.join(BASE_STORAGE_PATH, feature_id)

    if not os.path.exists(feature_dir):
        return None

    verdict_files = sorted(
        f for f in os.listdir(feature_dir)
        if f.startswith("verdict_") and f.endswith(".json")
    )

    if len(verdict_files) < 2:
        return None

    previous_file = verdict_files[-2]
    with open(os.path.join(feature_dir, previous_file), "r", encoding="utf-8") as f:
        return json.load(f)


def list_verdict_history(feature_id: str) -> List[Dict]:
    """
    Returns the full verdict history for a feature.
    """
    feature_dir = os.path.join(BASE_STORAGE_PATH, feature_id)

    if not os.path.exists(feature_dir):
        return []

    history = []
    verdict_files = sorted(
        f for f in os.listdir(feature_dir)
        if f.startswith("verdict_") and f.endswith(".json")
    )

    for vf in verdict_files:
        with open(os.path.join(feature_dir, vf), "r", encoding="utf-8") as f:
            history.append(json.load(f))

    return history
