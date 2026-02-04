from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.schemas.user import UserCreate, UserResponse, Token
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.utils.security import get_current_user
from app.schemas.user import ForgotPasswordRequest, ResetPasswordRequest
import uuid

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        full_name=user.full_name,
        phone=user.phone
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create corresponding profile based on role
    if user.role == "student":
        student_profile = Student(
            user_id=db_user.user_id,
            roll_number=f"STU{str(db_user.user_id)[:8].upper()}",
            department="Not Set",
            semester=user.semester if user.semester else 1,
            batch_year=date.today().year,
            enrollment_date=date.today()
        )
        db.add(student_profile)
        db.commit()
    elif user.role == "faculty":
        faculty_profile = Faculty(
            user_id=db_user.user_id,
            employee_id=f"FAC{str(db_user.user_id)[:8].upper()}",
            department="Not Set",
            designation="Lecturer"
        )
        db.add(faculty_profile)
        db.commit()
    
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# --- Forgot Password Implementation ---
# In-memory store for reset tokens: {token: email}
# In a real app, use Redis or a database table with expiration
RESET_TOKENS = {}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # For security, don't confirm if user exists or not, but for this mock we will
        raise HTTPException(status_code=404, detail="User with this email not found")
    
    token = str(uuid.uuid4())
    RESET_TOKENS[token] = user.email
    
    # Mock Email Service
    reset_link = f"http://localhost:5173/reset-password/{token}"
    print("\n" + "="*50)
    print("📧 MOCK EMAIL SERVICE")
    print(f"To: {user.email}")
    print(f"Subject: Password Reset Request")
    print(f"Link: {reset_link}")
    print("="*50 + "\n")
    
    return {"message": "Reset link generated. Check the server console."}

@router.post("/reset-password/{token}")
async def reset_password(token: str, request: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = RESET_TOKENS.get(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password_hash = get_password_hash(request.password)
    db.commit()
    
    # Remove token after use
    del RESET_TOKENS[token]
    
    return {"message": "Password has been reset successfully"}
