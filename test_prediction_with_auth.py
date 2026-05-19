import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_disease_prediction_with_auth():
    """Test disease prediction with proper authentication"""
    
    print("\n" + "="*70)
    print("DISEASE PREDICTION API - COMPLETE TEST")
    print("="*70)
    
    # Step 1: Login to get token
    print("\n[STEP 1] LOGIN - Get Authentication Token")
    print("-" * 70)
    
    login_data = {
        "username": "testuser123",
        "password": "securepassword123"
    }
    
    response = requests.post(f"{BASE_URL}/users/auth/login", data=login_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"Error: {response.json()}")
        return
    
    login_response = response.json()
    access_token = login_response["access_token"]
    token_type = login_response["token_type"]
    
    print(f"✅ Login Successful!")
    print(f"   Token Type: {token_type}")
    print(f"   Token: {access_token[:50]}...")
    
    # Step 2: Test prediction API with token
    print("\n[STEP 2] DISEASE PREDICTION - Using Bearer Token")
    print("-" * 70)
    
    # Set the Authorization header
    headers = {
        "Authorization": f"{token_type.capitalize()} {access_token}"
    }
    
    print(f"Headers Being Sent:")
    print(f"  Authorization: {token_type.capitalize()} {access_token[:50]}...")
    
    # Find an image to test with
    training_dir = Path("Training/PlantVillage")
    image_files = list(training_dir.rglob("*.jpg")) + list(training_dir.rglob("*.png"))
    
    if not image_files:
        print("❌ No test images found in Training/PlantVillage directory")
        return
    
    test_image = image_files[0]
    print(f"\nTest Image: {test_image.name}")
    print(f"Image Size: {test_image.stat().st_size / 1024:.2f} KB")
    
    # Make prediction request
    with open(test_image, 'rb') as f:
        files = {'file': f}
        response = requests.post(
            f"{BASE_URL}/predict/disease",
            headers=headers,
            files=files
        )
    
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ PREDICTION SUCCESSFUL!")
        prediction = response.json()
        print(f"\n   Predicted Class: {prediction['predicted_class']}")
        print(f"   Confidence: {prediction['confidence']*100:.2f}%")
        print(f"   Top 3 Predictions:")
        for i, pred in enumerate(prediction['top_3_predictions'], 1):
            print(f"      {i}. {pred['class']} ({pred['confidence']*100:.2f}%)")
        print(f"\n   Prediction ID: {prediction['prediction_id']}")
        print(f"   User: {prediction['user']}")
        print(f"   Timestamp: {prediction['timestamp']}")
    else:
        print(f"❌ ERROR - Status {response.status_code}")
        print(f"   Response: {response.json()}")

def show_curl_examples():
    """Show proper CURL commands"""
    print("\n" + "="*70)
    print("CURL EXAMPLES - HOW TO TEST MANUALLY")
    print("="*70)
    
    print("\n[METHOD 1] Using curl with token from login:")
    print("-" * 70)
    print("""
# Step 1: Login and get token
TOKEN=$(curl -s -X POST "http://localhost:8000/users/auth/login" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "username=testuser123&password=securepassword123" | jq -r '.access_token')

echo "Your token: $TOKEN"

# Step 2: Use token to make prediction
curl -X POST "http://localhost:8000/predict/disease" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@download.jpg"
    """)
    
    print("\n[METHOD 2] Using Python requests (easier):")
    print("-" * 70)
    print("""
import requests

# Login
response = requests.post("http://localhost:8000/users/auth/login", 
    data={"username": "testuser123", "password": "securepassword123"})
token = response.json()["access_token"]

# Predict
headers = {"Authorization": f"Bearer {token}"}
with open("download.jpg", "rb") as f:
    response = requests.post("http://localhost:8000/predict/disease",
        headers=headers, files={"file": f})
    print(response.json())
    """)
    
    print("\n[METHOD 3] Using FastAPI Swagger UI (RECOMMENDED):")
    print("-" * 70)
    print("""
1. Open browser: http://localhost:8000/docs
2. Click on "Authorize" button (lock icon)
3. Paste your token from login in the Bearer token field
4. Click "Authorize"
5. Now try the /predict/disease endpoint - it will include token automatically!
    """)

if __name__ == "__main__":
    test_disease_prediction_with_auth()
    show_curl_examples()
