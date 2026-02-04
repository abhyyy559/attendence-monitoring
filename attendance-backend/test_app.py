from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def test_register():
    email = f"test_{uuid.uuid4()}@example.com"
    print(f"Testing registration with {email}")
    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "full_name": "Test Client",
            "role": "student",
            "password": "password123"
        }
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code != 200:
        print("Failed!")

if __name__ == "__main__":
    test_register()
