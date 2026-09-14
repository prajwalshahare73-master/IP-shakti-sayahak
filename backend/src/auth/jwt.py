import time
from typing import Optional, Dict, Any
try:
    import jwt
    from jwt.exceptions import PyJWTError as JWTError
except ImportError:
    from jose import jwt, JWTError
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..config import settings

security = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta_minutes: Optional[int] = None) -> str:
    to_encode = data.copy()
    expire_minutes = expires_delta_minutes if expires_delta_minutes else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire_timestamp = int(time.time()) + (expire_minutes * 60)
    to_encode.update({"exp": expire_timestamp, "iat": int(time.time())})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail={"code": "INVALID_AUTH_TOKEN", "message": "Could not validate authentication credentials"}
        )

async def get_current_user_payload(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Optional[Dict[str, Any]]:
    if not credentials:
        return None
    token = credentials.credentials
    return decode_token(token)

async def require_auth(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail={"code": "AUTHENTICATION_REQUIRED", "message": "Authentication token required"}
        )
    return decode_token(credentials.credentials)
