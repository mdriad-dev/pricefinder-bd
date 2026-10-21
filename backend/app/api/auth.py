from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import create_access_token, get_current_user
from app.models.profile import Profile
from app.schemas.profile import ProfileResponse, TokenPayload

router = APIRouter(prefix="/auth", tags=["Authentication & Profiles"])


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: str = ""
    role: str = "consumer"  # consumer, shopkeeper, admin


class LoginRequest(BaseModel):
    email: EmailStr


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    profile: ProfileResponse


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Profile).filter(Profile.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    profile = Profile(
        email=payload.email,
        full_name=payload.full_name,
        phone_number=payload.phone_number,
        role=payload.role,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    token = create_access_token({"sub": profile.id, "email": profile.email, "role": profile.role})
    return AuthResponse(
        access_token=token,
        profile=ProfileResponse.model_validate(profile),
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.email == payload.email).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please register first.",
        )

    token = create_access_token({"sub": profile.id, "email": profile.email, "role": profile.role})
    return AuthResponse(
        access_token=token,
        profile=ProfileResponse.model_validate(profile),
    )


@router.get("/me", response_model=ProfileResponse)
def get_me(
    current_user: TokenPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.id == current_user.sub).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile record not found",
        )
    return profile
