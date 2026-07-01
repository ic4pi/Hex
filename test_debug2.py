#!/usr/bin/env python3
import requests
import traceback

BASE_URL = "https://neon-apothecary.preview.emergentagent.com/api"

print("Testing POST /api/newsletter without email")
try:
    print("Making request...")
    resp = requests.post(f"{BASE_URL}/newsletter", json={}, timeout=30)
    print(f"Response received: {resp}")
    print(f"Status: {resp.status_code}")
    print(f"Body: {resp.text}")
    print(f"resp is None: {resp is None}")
    print(f"resp is False: {resp is False}")
    print(f"bool(resp): {bool(resp)}")
    
    if resp and resp.status_code == 400:
        print("TEST PASSED")
    else:
        print(f"TEST FAILED: Status: {resp.status_code if resp else 'No response'}")
except Exception as e:
    print(f"Exception: {e}")
    traceback.print_exc()
