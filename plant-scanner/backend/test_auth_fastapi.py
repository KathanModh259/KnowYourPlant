from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

# ensure tables are created
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_signup():
    print("Testing Signup...")
    response = client.post(
        "/api/auth/signup",
        json={"email": "clientuser@example.com", "name": "Client User", "password": "password123"}
    )
    print("Signup Response Status:", response.status_code)
    print("Signup Response JSON:", response.json())
    return response.status_code == 201

def test_login():
    print("Testing Login...")
    response = client.post(
        "/api/auth/login",
        json={"email": "clientuser@example.com", "password": "password123"}
    )
    print("Login Response Status:", response.status_code)
    print("Login Response JSON:", response.json())

if __name__ == "__main__":
    if test_signup():
        test_login()
    else:
        print("Signup failed, trying login anyway...")
        test_login()
