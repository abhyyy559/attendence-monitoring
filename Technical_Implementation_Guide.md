# Technical Implementation Guide for AI IDEs
## Attendance Monitoring System - Step-by-Step Build Instructions

---

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] Supabase account created
- [ ] Git repository initialized
- [ ] Code editor ready (VS Code)

---

## PHASE 1: DATABASE SETUP (Supabase)

### Step 1.1: Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Note down: Project URL, API Key (anon/public), Service Role Key
4. Wait for project to finish provisioning

### Step 1.2: Execute Schema Creation
Copy and paste the following SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students table
CREATE TABLE students (
    student_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL,
    batch_year INTEGER NOT NULL,
    enrollment_date DATE NOT NULL,
    profile_picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Faculty table
CREATE TABLE faculty (
    faculty_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    specialization TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Courses table
CREATE TABLE courses (
    course_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INTEGER NOT NULL,
    credits INTEGER NOT NULL,
    total_classes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Course enrollments
CREATE TABLE course_enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculty(faculty_id),
    academic_year VARCHAR(10) NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, academic_year)
);

-- 6. Attendance records
CREATE TABLE attendance_records (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES course_enrollments(enrollment_id) ON DELETE CASCADE,
    class_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by UUID REFERENCES faculty(faculty_id),
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    UNIQUE(enrollment_id, class_date)
);

-- 7. Attendance summary
CREATE TABLE attendance_summary (
    summary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES course_enrollments(enrollment_id) ON DELETE CASCADE,
    total_classes INTEGER DEFAULT 0,
    classes_attended INTEGER DEFAULT 0,
    classes_absent INTEGER DEFAULT 0,
    classes_late INTEGER DEFAULT 0,
    classes_excused INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
    shortage_status BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id)
);

-- 8. Shortage threshold
CREATE TABLE shortage_threshold (
    threshold_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department VARCHAR(100),
    course_id UUID REFERENCES courses(course_id),
    minimum_percentage DECIMAL(5,2) NOT NULL DEFAULT 75.00,
    warning_percentage DECIMAL(5,2) NOT NULL DEFAULT 80.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department, course_id)
);

-- 9. Shortage reports
CREATE TABLE shortage_reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES course_enrollments(enrollment_id),
    report_date DATE NOT NULL,
    attendance_percentage DECIMAL(5,2),
    shortage_type VARCHAR(20) CHECK (shortage_type IN ('critical', 'warning', 'normal')),
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Notifications
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_course_enrollments_student ON course_enrollments(student_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_attendance_records_enrollment ON attendance_records(enrollment_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(class_date);
CREATE INDEX idx_attendance_enrollment_date ON attendance_records(enrollment_id, class_date);
CREATE INDEX idx_shortage_reports_enrollment_date ON shortage_reports(enrollment_id, report_date DESC);
CREATE INDEX idx_attendance_summary_shortage ON attendance_summary(shortage_status) WHERE shortage_status = TRUE;
```

### Step 1.3: Create Database Triggers

```sql
-- TRIGGER 1: Auto-update attendance summary
CREATE OR REPLACE FUNCTION update_attendance_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO attendance_summary (
        enrollment_id, total_classes, classes_attended, 
        classes_absent, classes_late, classes_excused,
        attendance_percentage, last_updated
    )
    SELECT 
        NEW.enrollment_id,
        COUNT(*) as total_classes,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as classes_attended,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as classes_absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as classes_late,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as classes_excused,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0 
        END as attendance_percentage,
        CURRENT_TIMESTAMP
    FROM attendance_records
    WHERE enrollment_id = NEW.enrollment_id
    ON CONFLICT (enrollment_id) 
    DO UPDATE SET
        total_classes = EXCLUDED.total_classes,
        classes_attended = EXCLUDED.classes_attended,
        classes_absent = EXCLUDED.classes_absent,
        classes_late = EXCLUDED.classes_late,
        classes_excused = EXCLUDED.classes_excused,
        attendance_percentage = EXCLUDED.attendance_percentage,
        last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_attendance_summary
AFTER INSERT OR UPDATE OR DELETE ON attendance_records
FOR EACH ROW
EXECUTE FUNCTION update_attendance_summary();

-- TRIGGER 2: Check and flag shortage
CREATE OR REPLACE FUNCTION check_attendance_shortage()
RETURNS TRIGGER AS $$
DECLARE
    v_threshold DECIMAL(5,2);
    v_course_id UUID;
    v_department VARCHAR(100);
BEGIN
    SELECT c.course_id, s.department INTO v_course_id, v_department
    FROM course_enrollments ce
    JOIN students s ON ce.student_id = s.student_id
    JOIN courses c ON ce.course_id = c.course_id
    WHERE ce.enrollment_id = NEW.enrollment_id;
    
    SELECT COALESCE(
        (SELECT minimum_percentage FROM shortage_threshold 
         WHERE course_id = v_course_id AND is_active = TRUE),
        (SELECT minimum_percentage FROM shortage_threshold 
         WHERE department = v_department AND course_id IS NULL AND is_active = TRUE),
        75.00
    ) INTO v_threshold;
    
    UPDATE attendance_summary
    SET shortage_status = (NEW.attendance_percentage < v_threshold)
    WHERE enrollment_id = NEW.enrollment_id;
    
    IF NEW.attendance_percentage < v_threshold THEN
        INSERT INTO shortage_reports (
            enrollment_id, report_date, attendance_percentage, 
            shortage_type, notification_sent
        )
        VALUES (
            NEW.enrollment_id,
            CURRENT_DATE,
            NEW.attendance_percentage,
            CASE 
                WHEN NEW.attendance_percentage < (v_threshold - 10) THEN 'critical'
                WHEN NEW.attendance_percentage < v_threshold THEN 'warning'
                ELSE 'normal'
            END,
            FALSE
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_shortage
AFTER UPDATE OF attendance_percentage ON attendance_summary
FOR EACH ROW
EXECUTE FUNCTION check_attendance_shortage();

-- TRIGGER 3: Send notification on shortage
CREATE OR REPLACE FUNCTION notify_shortage()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_course_name VARCHAR(255);
BEGIN
    SELECT u.user_id, c.course_name INTO v_user_id, v_course_name
    FROM course_enrollments ce
    JOIN students s ON ce.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN courses c ON ce.course_id = c.course_id
    WHERE ce.enrollment_id = NEW.enrollment_id;
    
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        v_user_id,
        'Attendance Shortage Alert',
        FORMAT('Your attendance in %s is %.2f%%, which is below the required threshold.',
               v_course_name, NEW.attendance_percentage),
        'shortage_alert'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_shortage
AFTER INSERT ON shortage_reports
FOR EACH ROW
WHEN (NEW.shortage_type IN ('warning', 'critical'))
EXECUTE FUNCTION notify_shortage();
```

### Step 1.4: Create Stored Procedures

```sql
-- Procedure 1: Bulk attendance update
CREATE OR REPLACE FUNCTION bulk_attendance_update(
    p_course_id UUID,
    p_class_date DATE,
    p_faculty_id UUID,
    p_attendance_data JSONB
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    v_record JSONB;
    v_enrollment_id UUID;
BEGIN
    FOR v_record IN SELECT * FROM jsonb_array_elements(p_attendance_data)
    LOOP
        SELECT enrollment_id INTO v_enrollment_id
        FROM course_enrollments ce
        JOIN students s ON ce.student_id = s.student_id
        WHERE ce.course_id = p_course_id
        AND s.roll_number = v_record->>'roll_number';
        
        INSERT INTO attendance_records (enrollment_id, class_date, status, marked_by)
        VALUES (
            v_enrollment_id,
            p_class_date,
            v_record->>'status',
            p_faculty_id
        )
        ON CONFLICT (enrollment_id, class_date)
        DO UPDATE SET
            status = EXCLUDED.status,
            marked_by = EXCLUDED.marked_by,
            marked_at = CURRENT_TIMESTAMP;
    END LOOP;
    
    RETURN QUERY SELECT TRUE, 'Attendance updated successfully';
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Procedure 2: Generate shortage report
CREATE OR REPLACE FUNCTION generate_shortage_report(
    p_department VARCHAR(100) DEFAULT NULL,
    p_semester INTEGER DEFAULT NULL,
    p_course_id UUID DEFAULT NULL
)
RETURNS TABLE(
    roll_number VARCHAR(50),
    student_name VARCHAR(255),
    course_name VARCHAR(255),
    attendance_percentage DECIMAL(5,2),
    shortage_type VARCHAR(20),
    classes_attended INTEGER,
    total_classes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.roll_number,
        u.full_name as student_name,
        c.course_name,
        asummary.attendance_percentage,
        sr.shortage_type,
        asummary.classes_attended,
        asummary.total_classes
    FROM shortage_reports sr
    JOIN course_enrollments ce ON sr.enrollment_id = ce.enrollment_id
    JOIN students s ON ce.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    JOIN courses c ON ce.course_id = c.course_id
    JOIN attendance_summary asummary ON ce.enrollment_id = asummary.enrollment_id
    WHERE (p_department IS NULL OR s.department = p_department)
    AND (p_semester IS NULL OR s.semester = p_semester)
    AND (p_course_id IS NULL OR ce.course_id = p_course_id)
    AND asummary.shortage_status = TRUE
    ORDER BY asummary.attendance_percentage ASC;
END;
$$ LANGUAGE plpgsql;
```

### Step 1.5: Create Views

```sql
-- View 1: Student attendance overview
CREATE VIEW vw_student_attendance_overview AS
SELECT 
    s.roll_number,
    u.full_name as student_name,
    s.department,
    s.semester,
    c.course_code,
    c.course_name,
    asummary.total_classes,
    asummary.classes_attended,
    asummary.classes_absent,
    asummary.attendance_percentage,
    asummary.shortage_status,
    CASE 
        WHEN asummary.shortage_status THEN 'Shortage'
        WHEN asummary.attendance_percentage >= 90 THEN 'Excellent'
        WHEN asummary.attendance_percentage >= 80 THEN 'Good'
        ELSE 'Satisfactory'
    END as attendance_grade
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN course_enrollments ce ON s.student_id = ce.student_id
JOIN courses c ON ce.course_id = c.course_id
JOIN attendance_summary asummary ON ce.enrollment_id = asummary.enrollment_id;

-- View 2: Course attendance statistics
CREATE VIEW vw_course_attendance_stats AS
SELECT 
    c.course_id,
    c.course_code,
    c.course_name,
    c.department,
    c.semester,
    COUNT(DISTINCT ce.student_id) as total_students,
    AVG(asummary.attendance_percentage) as average_attendance,
    COUNT(CASE WHEN asummary.shortage_status THEN 1 END) as students_with_shortage,
    MAX(asummary.total_classes) as total_classes_conducted
FROM courses c
JOIN course_enrollments ce ON c.course_id = ce.course_id
JOIN attendance_summary asummary ON ce.enrollment_id = asummary.enrollment_id
GROUP BY c.course_id, c.course_code, c.course_name, c.department, c.semester;
```

### Step 1.6: Insert Sample Data

```sql
-- Default admin user
INSERT INTO users (email, password_hash, role, full_name, phone) 
VALUES ('admin@college.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5TQhUqRQvp7M.', 'admin', 'System Administrator', '1234567890');

-- Sample shortage threshold
INSERT INTO shortage_threshold (department, minimum_percentage, warning_percentage, is_active)
VALUES ('Computer Science', 75.00, 80.00, TRUE);
```

---

## PHASE 2: BACKEND SETUP (FastAPI + Python)

### Step 2.1: Create Project Structure

```bash
mkdir attendance-backend
cd attendance-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

mkdir -p app/{models,schemas,routers,services,utils}
touch app/__init__.py
touch app/main.py
touch app/config.py
touch app/database.py
```

### Step 2.2: Install Dependencies

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-multipart pydantic[email] python-dotenv reportlab openpyxl
pip freeze > requirements.txt
```

### Step 2.3: Create .env File

```env
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres
SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key
```

### Step 2.4: Create config.py

```python
# app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
```

### Step 2.5: Create database.py

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 2.6: Create Models

```python
# app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

```python
# app/models/student.py
from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base

class Student(Base):
    __tablename__ = "students"
    
    student_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    roll_number = Column(String(50), unique=True, nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False)
    batch_year = Column(Integer, nullable=False)
    enrollment_date = Column(Date, nullable=False)
    profile_picture_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", backref="student_profile")
```

### Step 2.7: Create Schemas

```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    user_id: UUID
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
```

### Step 2.8: Create Authentication Utility

```python
# app/utils/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import get_settings
from app.database import get_db
from app.models.user import User

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user
```

### Step 2.9: Create Authentication Router

```python
# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.utils.security import verify_password, get_password_hash, create_access_token

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
```

### Step 2.10: Create Main Application

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth

app = FastAPI(title="Attendance Monitoring System")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Attendance Monitoring System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Step 2.11: Run Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## PHASE 3: FRONTEND SETUP (React + Vite)

### Step 3.1: Create React Project

```bash
npm create vite@latest attendance-frontend -- --template react
cd attendance-frontend
```

### Step 3.2: Install Dependencies

```bash
npm install react-router-dom axios recharts tailwindcss postcss autoprefixer
npm install react-hook-form react-toastify date-fns lucide-react
npx tailwindcss init -p
```

### Step 3.3: Configure Tailwind

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 3.4: Create .env

```env
VITE_API_URL=http://localhost:8000/api
```

### Step 3.5: Create API Service

```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

### Step 3.6: Create Auth Context

```javascript
// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    localStorage.setItem('token', response.data.access_token);
    await fetchCurrentUser();
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Step 3.7: Create Login Page

```javascript
// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Attendance System Login
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Step 3.8: Create App Router

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## IMPLEMENTATION CHECKLIST

### Backend Tasks
- [ ] Set up virtual environment
- [ ] Install all Python dependencies
- [ ] Configure .env file with Supabase credentials
- [ ] Create all model files (user, student, faculty, course, attendance)
- [ ] Create all schema files for validation
- [ ] Implement authentication router with JWT
- [ ] Create student router with dashboard and attendance APIs
- [ ] Create faculty router with mark attendance APIs
- [ ] Create admin router with management APIs
- [ ] Implement report generation service
- [ ] Add error handling middleware
- [ ] Set up logging
- [ ] Write unit tests
- [ ] Test all API endpoints with Postman/Thunder Client

### Frontend Tasks
- [ ] Create React project with Vite
- [ ] Install and configure Tailwind CSS
- [ ] Set up React Router
- [ ] Create Auth Context
- [ ] Build Login page
- [ ] Build Student Dashboard
- [ ] Build Faculty Dashboard
- [ ] Build Admin Dashboard
- [ ] Create reusable components (Button, Input, Card, Table)
- [ ] Implement attendance marking form
- [ ] Create report generation and download
- [ ] Add charts for visualization
- [ ] Implement responsive design
- [ ] Add loading states and error handling
- [ ] Test on multiple browsers

### Database Tasks
- [ ] Create all tables
- [ ] Add foreign key constraints
- [ ] Create indexes
- [ ] Implement triggers (3 triggers)
- [ ] Create stored procedures (2 procedures)
- [ ] Create views (2 views)
- [ ] Insert sample data
- [ ] Test triggers manually
- [ ] Test stored procedures
- [ ] Verify data integrity

### Testing & Deployment
- [ ] Test complete user flows
- [ ] Performance testing
- [ ] Security testing
- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Test production deployment
- [ ] Write documentation

---

## COMMON COMMANDS REFERENCE

```bash
# Backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
npm install
npm run dev
npm run build

# Database
psql -h hostname -U username -d database_name
```

---

## TROUBLESHOOTING

### Issue: Database Connection Error
**Solution:** Check DATABASE_URL in .env, ensure Supabase project is active

### Issue: CORS Error
**Solution:** Verify CORS middleware is configured in FastAPI main.py

### Issue: JWT Token Invalid
**Solution:** Check SECRET_KEY matches between .env and code

### Issue: Trigger Not Firing
**Solution:** Verify trigger is created with correct table name and event

---

This implementation guide provides all the necessary code and steps to build the complete system. Follow each phase sequentially for best results.
