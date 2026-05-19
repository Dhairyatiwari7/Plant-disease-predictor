import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import (
    PROJECT_NAME,
    PROJECT_DESCRIPTION,
    VERSION,
    ALLOWED_ORIGINS,
    LOG_LEVEL,
    DEBUG
)
from database import Database
from routes.user_routes import router as user_router
from routes.disease_routes import router as disease_router
from routes.api_compat import router as api_router

logging.basicConfig(level=LOG_LEVEL)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await Database.connect_db()
    logger.info(f"Starting {PROJECT_NAME} v{VERSION}")
    yield
    await Database.close_db()
    logger.info(f"Shutting down {PROJECT_NAME}")

app = FastAPI(
    title=PROJECT_NAME,
    description=PROJECT_DESCRIPTION,
    version=VERSION,
    debug=DEBUG,
    lifespan=lifespan
)

DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Add CORS middleware BEFORE all routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or DEFAULT_ALLOWED_ORIGINS or ["*"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

app.include_router(user_router)
app.include_router(disease_router)
app.include_router(api_router)

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {PROJECT_NAME}",
        "version": VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG
    )