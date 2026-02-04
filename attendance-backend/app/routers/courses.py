from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.models.course import Course, CourseEnrollment
from app.models.user import User
from app.schemas.course import CourseCreate, CourseResponse, EnrollmentCreate, EnrollmentResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/courses", tags=["Courses"])

@router.post("/", response_model=CourseResponse)
def create_course(course: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_course = Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/", response_model=List[CourseResponse])
def read_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    courses = db.query(Course).offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=CourseResponse)
def read_course(course_id: UUID, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/enroll", response_model=EnrollmentResponse)
def enroll_student(enrollment: EnrollmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify student exists (optional check as authorization might handle it)
    # Check if enrollment already exists
    existing = db.query(CourseEnrollment).filter(
        CourseEnrollment.student_id == enrollment.student_id,
        CourseEnrollment.course_id == enrollment.course_id,
        CourseEnrollment.academic_year == enrollment.academic_year
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled in this course for the academic year")
    
    db_enrollment = CourseEnrollment(**enrollment.model_dump())
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment
