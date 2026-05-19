from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
import logging
from typing import List

from database import Database
from models.user import User
from schemas.user_schema import UserCreate, UserUpdate, UserResponse, Token, UserLogin
from auth import authenticate_user, create_access_token, get_current_active_user, get_password_hash

logger = logging.getLogger(__name__)
router = APIRouter(tags=["users"], prefix="/users")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    db = Database.get_database()
    existing_user = await db.users.find_one({"$or": [{"email": user.email}, {"username": user.username}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user_dict = user.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.utcnow()
    user_dict["updated_at"] = datetime.utcnow()

    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})

    return UserResponse(
        id=str(created_user["_id"]),
        email=created_user["email"],
        username=created_user["username"],
        is_active=created_user["is_active"],
        created_at=created_user["created_at"],
        updated_at=created_user["updated_at"]
    )

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    db = Database.get_database()
    update_data = user_update.dict(exclude_unset=True)

    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    update_data["updated_at"] = datetime.utcnow()

    await db.users.update_one(
        {"_id": current_user.id},
        {"$set": update_data}
    )

    updated_user = await db.users.find_one({"_id": current_user.id})
    return UserResponse(
        id=str(updated_user["_id"]),
        email=updated_user["email"],
        username=updated_user["username"],
        is_active=updated_user.get("is_active", True),
        created_at=updated_user["created_at"],
        updated_at=updated_user["updated_at"]
    )

@router.get("/", response_model=List[UserResponse])
async def read_users(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_active_user)):
    db = Database.get_database()
    users = await db.users.find().skip(skip).limit(limit).to_list(length=limit)
    return [
        UserResponse(
            id=str(u["_id"]),
            email=u["email"],
            username=u["username"],
            is_active=u.get("is_active", True),
            created_at=u["created_at"],
            updated_at=u["updated_at"]
        )
        for u in users
    ]

@router.post("/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
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