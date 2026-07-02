#!/usr/bin/env python3
import requests
import traceback

BASE_URL = "https://neon-apothecary.preview.emergentagent.com/api"

tests = [
    ("GET nonexistent slug", "GET", "/products/slug/nonexistent-slug", None),
    ("POST wrong password", "POST", "/admin/login", {"password": "wrong"}),
    ("POST newsletter no email", "POST", "/newsletter", {}),
    ("POST contact no message", "POST", "/contact", {"email": "a@b.com"}),
    ("GET overview no cookie", "GET", "/admin/overview", None),
]

for name, method, endpoint, data in tests:
    print(f"\n{'='*60}")
    print(f"Test: {name}")
    print(f"{'='*60}")
    try:
        url = f"{BASE_URL}{endpoint}"
        if method == "GET":
            resp = requests.get(url, timeout=30)
        elif method == "POST":
            resp = requests.post(url, json=data, timeout=30)
        elif method == "PUT":
            resp = requests.put(url, json=data, timeout=30)
        elif method == "DELETE":
            resp = requests.delete(url, timeout=30)
        
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text}")
        print(f"Headers: {dict(resp.headers)}")
    except Exception as e:
        print(f"Exception: {e}")
        print(f"Traceback:")
        traceback.print_exc()
