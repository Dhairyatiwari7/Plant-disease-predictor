import logging
import tempfile
from pathlib import Path
from datetime import datetime, timedelta
from typing import List
import os

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from auth import (
    authenticate_user,
    create_access_token,
    get_current_active_user,
    get_password_hash,
    verify_password,
)
from config import ALLOWED_IMAGE_FORMATS
from database import Database
from model_loader import ModelLoader
from models.user import User
from schemas.user_schema import Token, UserCreate, UserLogin, UserUpdate

import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["api"])


def _is_infected_disease(disease_name: str) -> bool:
    return "healthy" not in disease_name.lower()


def _format_prediction(pred: dict) -> dict:
    return {
        "id": str(pred.get("_id")),
        "disease": pred.get("predicted_class", "Unknown"),
        "confidence": pred.get("confidence", 0),
        "is_infected": _is_infected_disease(pred.get("predicted_class", "")),
        "created_at": pred.get("created_at"),
        "image_url": pred.get("image_url") or None,
        "original_filename": pred.get("original_filename"),
        "top_3_predictions": pred.get("top_3_predictions", []),
    }


def _describe_disease(disease_name: str) -> str:
    if "healthy" in disease_name.lower():
        return "Your plant appears healthy. Continue regular monitoring and care."
    return f"Detected {disease_name}. Please examine the affected area and consult treatment recommendations."


def _recommend_treatment(disease_name: str) -> str:
    if "healthy" in disease_name.lower():
        return "No treatment needed at this time. Maintain optimal watering, nutrition, and pest control."
    return "Use appropriate fungicides or integrated pest management based on the disease and local agricultural guidelines."


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
async def api_register(user: UserCreate):
    db = Database.get_database()
    existing_user = await db.users.find_one({"$or": [{"email": user.email}, {"username": user.username}]})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()

    await db.users.insert_one(user_dict)
    return {"message": "User registered successfully"}


@router.post("/auth/login", response_model=Token)
async def api_login(credentials: UserLogin):
    user = await authenticate_user(credentials.username, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/health")
async def api_health_check():
    return {"status": "ok", "message": "API is running"}


@router.get("/auth/me")
async def api_get_current_user(current_user: User = Depends(get_current_active_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
    }


@router.post("/predict")
async def api_predict(file: UploadFile = File(...), current_user: User = Depends(get_current_active_user)):
    # Validate file extension
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ALLOWED_IMAGE_FORMATS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid file format. Allowed formats: {ALLOWED_IMAGE_FORMATS}")
    
    # Read and validate file size
    try:
        contents = await file.read()
        file_size_mb = len(contents) / (1024 * 1024)
        if file_size_mb > 10:  # MAX_IMAGE_SIZE_MB
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File size ({file_size_mb:.1f}MB) exceeds 10MB limit")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to read file: {str(e)}")

    # Create temporary file and save contents
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as tmp_file:
        tmp_file.write(contents)
        tmp_path = tmp_file.name

    image_url = None
    try:
        try:
            prediction_result = ModelLoader.predict(tmp_path)
        except Exception as pred_err:
            logger.error(f"Model prediction failed: {pred_err}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Prediction failed: {str(pred_err)}")
        
        try:
            upload_res = cloudinary.uploader.upload(tmp_path, folder="agrolens/predictions")
            image_url = upload_res.get("secure_url")
        except Exception as upload_err:
            logger.warning(f"Cloudinary upload failed: {upload_err}")
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    db = Database.get_database()
    record = {
        "user_id": str(current_user.id),
        "username": current_user.username,
        "predicted_class": prediction_result.get("predicted_class", "Unknown"),
        "confidence": float(prediction_result.get("confidence", 0)),
        "top_3_predictions": prediction_result.get("top_3_predictions", []),
        "original_filename": file.filename,
        "image_url": image_url,
        "created_at": datetime.utcnow(),
    }
    result = await db.predictions.insert_one(record)
    record["_id"] = str(result.inserted_id)

    disease_name = record["predicted_class"]
    confidence = record["confidence"]
    return {
        "disease": disease_name,
        "confidence": confidence,
        "is_infected": _is_infected_disease(disease_name),
        "description": _describe_disease(disease_name),
        "treatment": _recommend_treatment(disease_name),
        "message": f"Prediction completed for {disease_name}",
        "top_3_predictions": record["top_3_predictions"],
        "prediction_id": str(record.get("_id", "")),
        "image_url": image_url,
    }


@router.post("/predict/disease")
async def api_predict_disease(file: UploadFile = File(...), current_user: User = Depends(get_current_active_user)):
    return await api_predict(file, current_user)


@router.get("/predictions")
async def api_get_predictions(skip: int = 0, limit: int = 10, current_user: User = Depends(get_current_active_user)):
    db = Database.get_database()
    predictions = await db.predictions.find({"user_id": str(current_user.id)}).skip(skip).limit(limit).to_list(length=limit)
    return [_format_prediction(pred) for pred in predictions]


@router.get("/predictions/{prediction_id}")
async def api_get_prediction(prediction_id: str, current_user: User = Depends(get_current_active_user)):
    if not ObjectId.is_valid(prediction_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid prediction ID")

    db = Database.get_database()
    prediction = await db.predictions.find_one({"_id": ObjectId(prediction_id), "user_id": str(current_user.id)})
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    return _format_prediction(prediction)


@router.delete("/predictions/{prediction_id}")
async def api_delete_prediction(prediction_id: str, current_user: User = Depends(get_current_active_user)):
    if not ObjectId.is_valid(prediction_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid prediction ID")

    db = Database.get_database()
    result = await db.predictions.delete_one({"_id": ObjectId(prediction_id), "user_id": str(current_user.id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    return {"message": "Prediction deleted"}


@router.get("/stats/dashboard")
async def api_get_dashboard(current_user: User = Depends(get_current_active_user)):
    db = Database.get_database()
    predictions = await db.predictions.find({"user_id": str(current_user.id)}).to_list(length=1000)
    total = len(predictions)
    if total == 0:
        return {
            "total_predictions": 0,
            "success_rate": "0.0",
            "avg_confidence": "0.0",
            "last_scan": "Never",
        }

    infected = sum(1 for pred in predictions if _is_infected_disease(pred.get("predicted_class", "")))
    avg_confidence = sum(pred.get("confidence", 0) for pred in predictions) / total
    last_scan = max(pred.get("created_at", datetime.utcnow()) for pred in predictions)

    return {
        "total_predictions": total,
        "success_rate": f"{((total - infected) / total) * 100:.1f}",
        "avg_confidence": f"{avg_confidence:.2f}",
        "last_scan": last_scan.isoformat() if hasattr(last_scan, "isoformat") else str(last_scan),
    }


@router.get("/stats/recent")
async def api_get_recent_predictions(limit: int = 6, current_user: User = Depends(get_current_active_user)):
    db = Database.get_database()
    predictions = await db.predictions.find({"user_id": str(current_user.id)}).sort("created_at", -1).limit(limit).to_list(length=limit)
    return [_format_prediction(pred) for pred in predictions]


@router.get("/users/profile")
async def api_get_profile(current_user: User = Depends(get_current_active_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
    }


@router.put("/users/profile")
async def api_update_profile(user_update: UserUpdate, current_user: User = Depends(get_current_active_user)):
    db = Database.get_database()
    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.users.update_one({"_id": current_user.id}, {"$set": update_data})

    updated_user = await db.users.find_one({"_id": current_user.id})
    return {
        "id": str(updated_user["_id"]),
        "email": updated_user["email"],
        "username": updated_user["username"],
        "is_active": updated_user.get("is_active", True),
        "created_at": updated_user["created_at"],
        "updated_at": updated_user["updated_at"],
    }


@router.put("/users/change-password")
async def api_change_password(data: dict, current_user: User = Depends(get_current_active_user)):
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")
    if not old_password or not new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Both old and new passwords are required")

    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid current password")

    db = Database.get_database()
    await db.users.update_one(
        {"_id": current_user.id},
        {"$set": {"hashed_password": get_password_hash(new_password), "updated_at": datetime.utcnow()}}
    )
    return {"message": "Password changed successfully"}


@router.delete("/users/account")
async def api_delete_account(current_user: User = Depends(get_current_active_user)):
    db = Database.get_database()
    await db.users.delete_one({"_id": current_user.id})
    await db.predictions.delete_many({"user_id": str(current_user.id)})
    return {"message": "Account deleted"}
