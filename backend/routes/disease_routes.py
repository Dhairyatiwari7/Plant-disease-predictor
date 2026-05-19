import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, status, Depends
from fastapi.responses import JSONResponse
import tempfile
from pathlib import Path
from datetime import datetime

from model_loader import ModelLoader
from database import Database
from auth import get_current_active_user
from models.user import User
from config import MAX_IMAGE_SIZE_MB, ALLOWED_IMAGE_FORMATS

logger = logging.getLogger(__name__)
router = APIRouter(tags=["disease_detection"], prefix="/predict")

def validate_image_file(file: UploadFile) -> bool:
    """Validate image file format and size."""
    # Check file extension
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ALLOWED_IMAGE_FORMATS:
        return False
    
    # Check file size (would need to read the file)
    return True

@router.post("/disease")
async def predict_disease(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Predict tomato disease from an uploaded image.
    
    - **file**: Image file (JPEG, JPG, PNG)
    - Returns prediction with confidence score and top predictions
    """
    try:
        # Validate file
        if not validate_image_file(file):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file format. Allowed formats: {ALLOWED_IMAGE_FORMATS}"
            )
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
            contents = await file.read()
            tmp_file.write(contents)
            tmp_path = tmp_file.name
        
        # Perform prediction
        prediction_result = ModelLoader.predict(tmp_path)
        
        # Clean up temporary file
        Path(tmp_path).unlink(missing_ok=True)
        
        # Save prediction to database
        db = Database.get_database()
        prediction_record = {
            "user_id": str(current_user.id),
            "username": current_user.username,
            "predicted_class": prediction_result["predicted_class"],
            "confidence": prediction_result["confidence"],
            "top_3_predictions": prediction_result["top_3_predictions"],
            "original_filename": file.filename,
            "created_at": datetime.utcnow()
        }
        
        result = await db.predictions.insert_one(prediction_record)
        prediction_record["_id"] = str(result.inserted_id)
        
        return {
            "prediction_id": str(result.inserted_id),
            "user": current_user.username,
            "timestamp": datetime.utcnow().isoformat(),
            **prediction_result,
            "message": f"Tomato identified as: {prediction_result['predicted_class']}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in disease prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )

@router.get("/health")
async def model_health_check():
    """Check if the disease detection model is loaded and ready."""
    try:
        ModelLoader.initialize()
        return {
            "status": "healthy",
            "model_loaded": True,
            "message": "Disease detection model is ready"
        }
    except Exception as e:
        logger.error(f"Model health check failed: {e}")
        return {
            "status": "unhealthy",
            "model_loaded": False,
            "error": str(e)
        }

@router.get("/history")
async def get_prediction_history(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
):
    """Get user's prediction history."""
    try:
        db = Database.get_database()
        predictions = await db.predictions.find(
            {"user_id": str(current_user.id)}
        ).skip(skip).limit(limit).to_list(length=limit)
        
        # Convert ObjectId to string for JSON serialization
        for pred in predictions:
            pred["_id"] = str(pred["_id"])
        
        return {
            "user": current_user.username,
            "total_predictions": len(predictions),
            "predictions": predictions
        }
    except Exception as e:
        logger.error(f"Error retrieving prediction history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving prediction history"
        )

@router.post("/batch")
async def batch_predict(
    files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Perform batch predictions on multiple images.
    
    - **files**: List of image files
    - Returns predictions for all images
    """
    try:
        results = []
        
        for file in files:
            try:
                # Validate file
                if not validate_image_file(file):
                    results.append({
                        "filename": file.filename,
                        "status": "error",
                        "message": f"Invalid file format"
                    })
                    continue
                
                # Save uploaded file temporarily
                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
                    contents = await file.read()
                    tmp_file.write(contents)
                    tmp_path = tmp_file.name
                
                # Perform prediction
                prediction_result = ModelLoader.predict(tmp_path)
                
                # Clean up temporary file
                Path(tmp_path).unlink(missing_ok=True)
                
                results.append({
                    "filename": file.filename,
                    "status": "success",
                    **prediction_result
                })
                
            except Exception as e:
                logger.error(f"Error processing {file.filename}: {e}")
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "message": str(e)
                })
        
        return {
            "user": current_user.username,
            "timestamp": datetime.utcnow().isoformat(),
            "total_processed": len(files),
            "successful": sum(1 for r in results if r["status"] == "success"),
            "failed": sum(1 for r in results if r["status"] == "error"),
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Error in batch prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing batch predictions"
        )
