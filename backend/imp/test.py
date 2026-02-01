import requests
import time
import json


BASE = "http://127.0.0.1:8000"
TOKEN = None

def get_headers():
    if TOKEN:
        return {"Authorization": f"Bearer {TOKEN}"}
    return {}

def post(path, payload):
    headers = get_headers()
    r = requests.post(BASE+path, json=payload, headers=headers, timeout=300)
    print(path, r.status_code)
    try:
        if r.status_code != 200:
             print(r.json())
    except Exception:
        print(r.text)
    return r

def authenticate():
    global TOKEN
    user_creds = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    print("Attempting to register/login...")
    # Try register
    r = requests.post(f"{BASE}/auth/register", json=user_creds)
    if r.status_code == 200:
        TOKEN = r.json().get("access_token")
        print("Registered and authenticated")
        return

    # If failed (likely exists), try login
    # Login endpoint uses OAuth2PasswordRequestForm which expects form-data, not JSON
    login_data = {
        "username": user_creds["email"], # configured to accept email as username
        "password": user_creds["password"]
    }
    r = requests.post(f"{BASE}/auth/login", data=login_data)
    if r.status_code == 200:
        TOKEN = r.json().get("access_token")
        print("Logged in and authenticated")
    else:
        print("Authentication failed")
        print(r.text)
        raise SystemExit("Auth failed")

# Authenticate first
authenticate()


# Load an existing verdict file and import it as a run, then only run risk/autofix/results
verdict_path = 'storage/compliance_history/feat_auto_chat_translation_v1/verdict_001.json'
with open(verdict_path, 'r', encoding='utf-8') as f:
    verdict_payload = json.load(f)

print('Importing verdict as run via /admin/import_verdict')
r = post('/admin/import_verdict', verdict_payload)
if r.status_code != 200:
    raise SystemExit('Import failed')
res = r.json()
run_id = res.get('run_id')
feature_id = res.get('feature_id')
print('Imported Run ID:', run_id)

# 2. Risk
print('Triggering /run/risk')
r = post('/run/risk', {"feature_id": feature_id, "run_id": run_id})
if r.status_code != 200:
    raise SystemExit('Risk failed')

# 3. Autofix
print('Triggering /run/autofix')
r = post('/run/autofix', {"feature_id": feature_id, "run_id": run_id})
if r.status_code != 200:
    raise SystemExit('Autofix failed')

# 4. Results
print('Fetching results')
r = requests.get(f"{BASE}/results/{feature_id}/{run_id}", headers=get_headers())
print(r.status_code)
try:
    print(json.dumps(r.json(), indent=2))
except Exception:
    print(r.text)

print('Done')
