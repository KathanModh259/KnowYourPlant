import requests

BASE_URL = "http://127.0.0.1:8000/api/auth"

def test_auth():
    print("Testing Signup...")
    signup_data = {
        "email": "testuser@example.com",
        "name": "Test User",
        "password": "testpassword123"
    }
    r = requests.post(f"{BASE_URL}/signup", json=signup_data)
    print(f"Signup Status: {r.status_code}")
    print(f"Signup Response: {r.json()}")

    print("\nTesting Login...")
    login_data = {
        "email": "testuser@example.com",
        "password": "testpassword123"
    }
    r = requests.post(f"{BASE_URL}/login", json=login_data)
    print(f"Login Status: {r.status_code}")
    print(f"Login Response: {r.json()}")

if __name__ == "__main__":
    test_auth()
