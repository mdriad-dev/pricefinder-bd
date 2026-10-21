from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.schemas.profile import TokenPayload

security_bearer = HTTPBearer(auto_error=False)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    secret = settings.SUPABASE_JWT_SECRET or settings.SECRET_KEY
    return jwt.encode(to_encode, secret, algorithm="HS256")


def decode_access_token(token: str) -> TokenPayload:
    secret = settings.SUPABASE_JWT_SECRET or settings.SECRET_KEY
    try:
        # Verify token using configured secret
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing sub",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Check custom app role in user_metadata, app_metadata, or root claims
        role = (
            payload.get("user_metadata", {}).get("role")
            or payload.get("app_metadata", {}).get("role")
        )
        if not role:
            raw_role = payload.get("role")
            if raw_role and raw_role != "authenticated":
                role = raw_role
            else:
                role = "consumer"
        email = payload.get("email")
        return TokenPayload(sub=user_id, email=email, role=role)
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> TokenPayload:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_access_token(credentials.credentials)


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Optional[TokenPayload]:
    if not credentials:
        return None
    try:
        return decode_access_token(credentials.credentials)
    except HTTPException:
        return None


def require_shopkeeper_or_admin(
    current_user: TokenPayload = Depends(get_current_user)
) -> TokenPayload:
    if current_user.role not in ["shopkeeper", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Shopkeeper or Admin privileges required",
        )
    return current_user
