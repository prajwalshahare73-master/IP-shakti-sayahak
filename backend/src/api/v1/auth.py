from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

from ...db.users_repo import users_repo
from ...auth.jwt import create_access_token, get_current_user_payload, require_auth

router = APIRouter(prefix="/v1/auth", tags=["User Authentication"])

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "user"
    organization: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    role: str
    organization: Optional[str] = None

@router.post("/register", response_model=UserAuthResponse)
async def register_user(request: UserRegisterRequest):
    if not request.email or "@" not in request.email:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_EMAIL", "message": "A valid email address is required."}
        )
    if not request.password or len(request.password) < 6:
        raise HTTPException(
            status_code=400,
            detail={"code": "WEAK_PASSWORD", "message": "Password must be at least 6 characters long."}
        )

    existing = await users_repo.get_by_email(request.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail={"code": "EMAIL_ALREADY_REGISTERED", "message": f"Account with email {request.email} already exists."}
        )

    user = await users_repo.create_user(
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        role=request.role or "user",
        organization=request.organization
    )

    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "name": user["full_name"],
        "role": user["role"],
        "org": user.get("organization")
    })

    return UserAuthResponse(
        access_token=token,
        token_type="bearer",
        user_id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        organization=user.get("organization")
    )

@router.post("/login", response_model=UserAuthResponse)
async def login_user(request: UserLoginRequest):
    if not request.email or not request.password:
        raise HTTPException(
            status_code=400,
            detail={"code": "MISSING_CREDENTIALS", "message": "Email and password are required."}
        )

    user = await users_repo.verify_password(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."}
        )

    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "name": user["full_name"],
        "role": user["role"],
        "org": user.get("organization")
    })

    return UserAuthResponse(
        access_token=token,
        token_type="bearer",
        user_id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        organization=user.get("organization")
    )

@router.get("/me", response_model=Dict[str, Any])
async def get_current_user_profile(user_payload: Dict[str, Any] = Depends(require_auth)):
    user = await users_repo.get_by_id(user_payload.get("sub"))
    if not user:
        return user_payload
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "organization": user.get("organization"),
        "created_at": user.get("created_at")
    }
