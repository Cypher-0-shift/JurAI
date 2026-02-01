import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def main():
    email = f"auth_test_{int(time.time())}@example.com"
    print(f"Testing Auth with {email}")
    
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json={
            "username": f"user_{int(time.time())}",
            "email": email,
            "password": "pass"
        })
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
