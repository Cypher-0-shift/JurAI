import requests
import json
import time
import os
import sys

BASE_URL = "http://127.0.0.1:8000"

def log(msg):
    print(f"[Test] {msg}")

def check(response):
    if response.status_code >= 400:
        print(f"Test Failed: {response.status_code} - {response.text}")
        sys.exit(1)
    return response.json()

def load_input_data():
    # Try to locate test_input.json relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, "test_input.json")
    
    if os.path.exists(input_path):
        log(f"Loading input from: {input_path}")
        with open(input_path, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        log("Warning: test_input.json not found. Using minimal fallback data.")
        return {
            "feature_id": "fallback_feat_01",
            "product": {"name": "Fallback Product"},
            "feature": {"name": "Fallback Feature", "description": "Test description"}
        }

def main():
    
    context_data = load_input_data()
    feature_id = context_data.get("feature_id", "unknown_feature")

    # 1. Pipeline A: Core
    log("Triggering Core Pipeline...")
    
    try:
        resp = requests.post(f"{BASE_URL}/run/core", json={
            "feature_id": feature_id,
            "context_data": context_data
        })
    except requests.exceptions.ConnectionError:
        log("Error: Could not connect to API. Is the server running? (uvicorn app:app)")
        sys.exit(1)

    data = check(resp)
    run_id = data["run_id"]
    log(f"Core Pipeline Successful. Run ID: {run_id}")
    log(f"Verdict: {json.dumps(data.get('verdict', {}).get('verdict'), indent=2)}")

    # 2. Pipeline B: Risk
    log("Triggering Risk Pipeline...")
    resp = requests.post(f"{BASE_URL}/run/risk", json={
        "feature_id": feature_id,
        "run_id": run_id
    })
    data = check(resp)
    log("Risk Pipeline Successful.")
    
    # 3. Pipeline C: Autofix
    log("Triggering Autofix Pipeline...")
    resp = requests.post(f"{BASE_URL}/run/autofix", json={
        "feature_id": feature_id,
        "run_id": run_id
    })
    data = check(resp)
    log("Autofix Pipeline Successful.")

    # 4. Fetch Full Results
    log("Fetching Final Results...")
    resp = requests.get(f"{BASE_URL}/results/{feature_id}/{run_id}")
    data = check(resp)
    
    print("\n================ TEST SUMMARY ================")
    print(f"Status: {data.get('status')}")
    print(f"Risk Assessment: {len(str(data.get('risk_assessment')))} chars")
    print(f"Auto-fix: {len(str(data.get('auto_fix')))} chars")
    print("==============================================")

if __name__ == "__main__":
    main()
