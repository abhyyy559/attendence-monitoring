from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import date
from app.database import get_db
from app.models.attendance import AttendanceRecord, AttendanceSummary
from app.models.course import CourseEnrollment
from app.models.user import User
from app.schemas.attendance import BulkAttendanceCreate, AttendanceRecordResponse, AttendanceSummaryResponse
from app.utils.security import get_current_user
from app.services.attendance_service import attendance_service

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def mark_bulk_attendance(data: BulkAttendanceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only faculty or admin can mark attendance
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    return attendance_service.mark_attendance(
        db=db,
        course_id=data.course_id,
        class_date=data.class_date,
        attendance_data=data.attendance_data,
        marked_by=current_user.user_id
    )

@router.get("/student/{student_id}", response_model=List[AttendanceSummaryResponse])
def get_student_attendance_summary(student_id: UUID, db: Session = Depends(get_db)):
    summaries = db.query(AttendanceSummary).join(CourseEnrollment).filter(CourseEnrollment.student_id == student_id).all()
    return summaries

@router.get("/course/{course_id}", response_model=List[AttendanceRecordResponse])
def get_course_attendance_records(course_id: UUID, class_date: date, db: Session = Depends(get_db)):
    records = db.query(AttendanceRecord).join(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id,
        AttendanceRecord.class_date == class_date
    ).all()
    return records
