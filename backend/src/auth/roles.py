from typing import List, Callable, Dict, Any
from fastapi import HTTPException, Depends
from .jwt import require_auth

def require_roles(allowed_roles: List[str]) -> Callable:
    async def role_checker(payload: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
        role = payload.get("role", "USER").upper()
        if role not in [r.upper() for r in allowed_roles]:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "FORBIDDEN_ROLE",
                    "message": f"Access denied. Requires one of roles: {allowed_roles}"
                }
            )
        return payload
    return role_checker

require_expert = require_roles(["EXPERT", "SENIOR_EXPERT", "ADMIN"])
require_senior_expert = require_roles(["SENIOR_EXPERT", "ADMIN"])
require_admin = require_roles(["ADMIN"])
