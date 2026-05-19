# Frontend-Backend Integration Guide

This guide explains how to properly connect the React frontend with the Python backend API.

## 1. Backend API Requirements

Your backend (in `backend/main.py`) needs to implement the following structure:

### 1.1 CORS Configuration

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware - MUST be before route definitions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 1.2 Authentication Endpoints

```python
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])

# JWT Configuration
SECRET_KEY = "your-secret-key-change-this"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

@router.post("/login")
async def login(username: str, password: str):
    """Login endpoint - returns JWT token"""
    # Validate credentials against your database
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"username": user.username, "email": user.email}
    }

@router.post("/register")
async def register(username: str, email: str, password: str):
    """Register new user"""
    if user_exists(username, email):
        raise HTTPException(status_code=400, detail="User already exists")
    
    user = create_user(username, email, password)
    return {"message": "User registered successfully", "user": user}

@router.get("/me")
async def get_current_user(credentials: HTTPAuthCredentials = Depends(HTTPBearer())):
    """Get current logged-in user"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user = get_user_by_username(username)
        return user
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 1.3 Disease Prediction Endpoints

```python
from fastapi import File, UploadFile
import numpy as np
from PIL import Image
import io

@router.post("/api/predict")
async def predict_disease(file: UploadFile = File(...), user_id: int = Depends(get_current_user_id)):
    """Predict disease from uploaded image"""
    try:
        # Read image
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        
        # Preprocess image
        img_array = np.array(img.resize((224, 224))) / 255.0
        
        # Load your model and predict
        from model_loader import load_model  # Import from your model_loader.py
        model = load_model()
        
        prediction = model.predict(np.expand_dims(img_array, axis=0))
        confidence = float(np.max(prediction))
        disease_idx = np.argmax(prediction)
        
        # Get disease name from your class mapping
        disease_name = get_disease_name(disease_idx)
        
        # Save to database
        prediction_record = save_prediction(
            user_id=user_id,
            disease=disease_name,
            confidence=confidence,
            image_path=save_uploaded_image(file, user_id)
        )
        
        return {
            "id": prediction_record.id,
            "disease": disease_name,
            "confidence": confidence,
            "is_infected": confidence > 0.5 and disease_name != "Healthy",
            "description": get_disease_description(disease_name),
            "treatment": get_disease_treatment(disease_name)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/predictions")
async def get_predictions(skip: int = 0, limit: int = 10, user_id: int = Depends(get_current_user_id)):
    """Get user's prediction history"""
    predictions = get_user_predictions(user_id, skip, limit)
    return predictions

@router.get("/api/predictions/{prediction_id}")
async def get_prediction(prediction_id: int, user_id: int = Depends(get_current_user_id)):
    """Get specific prediction"""
    prediction = get_prediction_by_id(prediction_id, user_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return prediction

@router.delete("/api/predictions/{prediction_id}")
async def delete_prediction(prediction_id: int, user_id: int = Depends(get_current_user_id)):
    """Delete prediction"""
    success = delete_prediction_record(prediction_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return {"message": "Prediction deleted"}
```

### 1.4 User Profile Endpoints

```python
@router.get("/api/users/profile")
async def get_profile(user_id: int = Depends(get_current_user_id)):
    """Get user profile"""
    user = get_user_by_id(user_id)
    return {
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at,
        "avatar_url": user.avatar_url or "https://via.placeholder.com/160x160"
    }

@router.put("/api/users/profile")
async def update_profile(data: dict, user_id: int = Depends(get_current_user_id)):
    """Update user profile"""
    user = update_user(user_id, **data)
    return {"message": "Profile updated", "user": user}

@router.put("/api/users/change-password")
async def change_password(old_password: str, new_password: str, user_id: int = Depends(get_current_user_id)):
    """Change user password"""
    user = get_user_by_id(user_id)
    if not verify_password(old_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid current password")
    
    update_password(user_id, new_password)
    return {"message": "Password changed successfully"}

@router.delete("/api/users/account")
async def delete_account(user_id: int = Depends(get_current_user_id)):
    """Delete user account"""
    delete_user(user_id)
    return {"message": "Account deleted"}
```

### 1.5 Statistics Endpoints

```python
@router.get("/api/stats/dashboard")
async def get_dashboard_stats(user_id: int = Depends(get_current_user_id)):
    """Get dashboard statistics"""
    stats = calculate_user_stats(user_id)
    return {
        "total_predictions": stats["count"],
        "success_rate": f"{stats['success_rate']:.1f}",
        "avg_confidence": f"{stats['avg_confidence']:.1f}",
        "last_scan": stats["last_scan_time"] or "Never"
    }

@router.get("/api/stats/recent")
async def get_recent_predictions(limit: int = 6, user_id: int = Depends(get_current_user_id)):
    """Get recent predictions for dashboard"""
    return get_user_predictions(user_id, 0, limit)
```

## 2. Frontend Configuration

### 2.1 Environment Variables

Create `.env.local` in the `frontend/` directory:

```bash
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENV=development
```

For production, update to your backend URL:
```bash
REACT_APP_API_URL=https://your-backend.com/api
```

### 2.2 Backend Helper Functions in `backend/`

Create utility functions in your backend that the frontend depends on:

**backend/utils.py**:
```python
from datetime import datetime
import os

def get_disease_description(disease_name: str) -> str:
    """Get disease description"""
    descriptions = {
        "Early Blight": "Fungal disease causing concentric rings on leaves...",
        "Late Blight": "Serious fungal disease affecting stems and fruits...",
        "Healthy": "No disease detected - plant is healthy",
        # Add more descriptions
    }
    return descriptions.get(disease_name, "Unknown disease")

def get_disease_treatment(disease_name: str) -> str:
    """Get recommended treatment"""
    treatments = {
        "Early Blight": "Apply copper-based fungicides and remove affected leaves...",
        "Late Blight": "Remove infected plants immediately and use systemic fungicides...",
        "Healthy": "Maintain regular monitoring and preventive measures",
        # Add more treatments
    }
    return treatments.get(disease_name, "Consult an agricultural expert")

def save_uploaded_image(file, user_id: int) -> str:
    """Save uploaded image and return path"""
    import shutil
    directory = f"uploaded_images/user_{user_id}"
    os.makedirs(directory, exist_ok=True)
    
    filename = f"{datetime.now().timestamp()}.jpg"
    filepath = os.path.join(directory, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return filepath
```

## 3. Running Frontend and Backend Together

### Terminal 1 - Backend (Python)
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

### Terminal 2 - Frontend (React)
```bash
cd frontend
npm start
```

The frontend will be available at `http://localhost:3000`
The backend API will be at `http://localhost:8000`

## 4. Testing API Connection

### 4.1 Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### 4.2 Test Prediction
```bash
# Get token first, then:
curl -X POST http://localhost:8000/api/predict \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/image.jpg"
```

## 5. Database Integration

Update your `backend/database.py` to include necessary models:

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    avatar_url = Column(String, nullable=True)

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    disease = Column(String)
    confidence = Column(Float)
    image_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
```

## 6. Common Issues and Solutions

### CORS Error
**Problem**: "Access to XMLHttpRequest blocked by CORS policy"
**Solution**: Ensure CORS middleware is added BEFORE route definitions in backend

### 401 Unauthorized
**Problem**: Token not being sent or expired
**Solution**: Check token in localStorage, verify JWT secret key matches

### Image Upload Fails
**Problem**: File not being saved properly
**Solution**: Ensure upload directory exists and has write permissions

### API Timeout
**Problem**: Requests taking too long
**Solution**: Increase timeout in api.js if needed, optimize model inference

## 7. Performance Tips

1. **Compress images** before upload
2. **Cache predictions** to avoid re-processing
3. **Use pagination** for prediction history
4. **Lazy load** disease descriptions
5. **Optimize model** inference time (convert to ONNX if possible)

## 8. Security Considerations

1. **Never commit** `.env` files with secrets
2. **Use HTTPS** in production
3. **Validate** all inputs on backend
4. **Hash passwords** using bcrypt
5. **Rotate JWT** secret keys regularly
6. **Rate limit** API endpoints
7. **Sanitize** file uploads

For more details on backend implementation, see [backend/README.md](../backend/README.md)
