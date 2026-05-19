import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR

API_V1_STR = "/api/v1"
PROJECT_NAME = "Tomato Disease Detection API"
PROJECT_DESCRIPTION = "ML-powered API for detecting tomato plant diseases from images"
VERSION = "1.0.0"

DEBUG = os.getenv("DEBUG", "False").lower() == "true"
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
MODEL_PATH_ENV = os.getenv("MODEL_PATH", "saved_models")
MODEL_PATH = str(Path(MODEL_PATH_ENV) if Path(MODEL_PATH_ENV).is_absolute()
                  else BASE_DIR / MODEL_PATH_ENV)

CLASS_NAMES = [
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Tomato_Leaf_Mold",
    "Tomato_healthy"
]
MAX_IMAGE_SIZE_MB = 10
ALLOWED_IMAGE_FORMATS = ["jpeg", "jpg", "png"]

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "tomato_disease_db")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
    ).split(",")
    if origin.strip()
]
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")