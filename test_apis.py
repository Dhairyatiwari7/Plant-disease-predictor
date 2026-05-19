import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_root():
    """Test root endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Root Endpoint")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

def test_register_user(email, username, password):
    """Test user registration"""
    print("\n" + "="*60)
    print("TEST 2: Register User")
    print("="*60)
    try:
        user_data = {
            "email": email,
            "username": username,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/users/", json=user_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")
        return response.json() if response.status_code == 201 else None
    except Exception as e:
        print(f"Error: {e}")
    return None

def test_login(username, password):
    """Test user login"""
    print("\n" + "="*60)
    print("TEST 3: Login User")
    print("="*60)
    try:
        login_data = {
            "username": username,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/users/auth/login", data=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.json().get("access_token") if response.status_code == 200 else None
    except Exception as e:
        print(f"Error: {e}")
    return None

def test_get_me(token):
    """Test get current user"""
    print("\n" + "="*60)
    print("TEST 4: Get Current User (/me)")
    print("="*60)
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/users/me", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")
    except Exception as e:
        print(f"Error: {e}")

def test_get_all_users(token):
    """Test get all users"""
    print("\n" + "="*60)
    print("TEST 5: Get All Users")
    print("="*60)
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/users/", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")
    except Exception as e:
        print(f"Error: {e}")

def test_predict_disease(token, image_path):
    """Test disease prediction"""
    print("\n" + "="*60)
    print("TEST 6: Predict Disease")
    print("="*60)
    try:
        if not Path(image_path).exists():
            print(f"Image file not found: {image_path}")
            return
        
        headers = {"Authorization": f"Bearer {token}"}
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/predict/disease", headers=headers, files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test root
    test_root()
    
    # Register user
    email = "testuser@example.com"
    username = "testuser123"
    password = "securepassword123"
    
    user_resp = test_register_user(email, username, password)
    
    # Login
    token = test_login(username, password)
    
    if token:
        # Test authenticated endpoints
        test_get_me(token)
        test_get_all_users(token)
        
        # Test disease prediction with first available image
        training_dir = Path("Training/PlantVillage")
        if training_dir.exists():
            for img_path in training_dir.rglob("*.jpg"):
                test_predict_disease(token, str(img_path))
                break
            for img_path in training_dir.rglob("*.png"):
                test_predict_disease(token, str(img_path))
                break
    
    print("\n" + "="*60)
    print("ALL TESTS COMPLETED")
    print("="*60)
