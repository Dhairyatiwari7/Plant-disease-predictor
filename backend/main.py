import logging
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from config import (
    PROJECT_NAME,
    PROJECT_DESCRIPTION,
    VERSION,
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

# Add CORS middleware BEFORE all routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://plant-disease-frontend-r4s5.onrender.com",
        "https://plant-disease-predictor-t9r0.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
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

@app.get("/api/health")
async def api_health_check():
    return {"status": "ok", "message": "API is running"}

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": f"Route '{request.url.path}' not found"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG
    )
