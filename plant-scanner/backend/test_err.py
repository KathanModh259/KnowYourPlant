import requests

def test_signup():
    try:
        response = requests.post("http://127.0.0.1:8000/api/auth/signup", json={
            "email": "testerr@example.com",
            "name": "Error Test",
            "password": "password123"
        })
        print("Status Code:", response.status_code)
        print("Response Text:", response.text)
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    test_signup()
