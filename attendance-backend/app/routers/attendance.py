from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import UUID
from datetime import date
from app.database import get_db
from app.models.attendance import AttendanceRecord, AttendanceSummary, ShortageThreshold, ShortageReport
from app.models.course import CourseEnrollment, Course
from app.models.student import Student
from app.models.user import User
from app.schemas.attendance import BulkAttendanceCreate, AttendanceRecordResponse, AttendanceSummaryResponse
from app.utils.security import get_current_user
from decimal import Decimal

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

def update_summary(db: Session, enrollment_id: UUID):
    # Calculate stats
    stats = db.query(
        func.count(AttendanceRecord.attendance_id).label("total"),
        func.sum(func.case((AttendanceRecord.status == 'present', 1), else_=0)).label("attended"),
        func.sum(func.case((AttendanceRecord.status == 'absent', 1), else_=0)).label("absent"),
        func.sum(func.case((AttendanceRecord.status == 'late', 1), else_=0)).label("late"),
        func.sum(func.case((AttendanceRecord.status == 'excused', 1), else_=0)).label("excused")
    ).filter(AttendanceRecord.enrollment_id == enrollment_id).first()

    total = stats.total or 0
    attended = stats.attended or 0
    absent = stats.absent or 0
    late = stats.late or 0
    excused = stats.excused or 0
    
    # Calculate percentage (Present + Late count as attended for percentage usually, or as per PRD)
    # PRD says: (SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100
    percentage = 0.0
    if total > 0:
        percentage = float(Decimal((attended + late) / total * 100).quantize(Decimal("0.01")))

    # Update or Create summary
    summary = db.query(AttendanceSummary).filter(AttendanceSummary.enrollment_id == enrollment_id).first()
    if not summary:
        summary = AttendanceSummary(enrollment_id=enrollment_id)
        db.add(summary)
    
    summary.total_classes = total
    summary.classes_attended = attended
    summary.classes_absent = absent
    summary.classes_late = late
    summary.classes_excused = excused
    summary.attendance_percentage = percentage
    
    # Check shortage (Default 75%)
    # In a real app we'd lookup ShortageThreshold, but for now 75%
    summary.shortage_status = percentage < 75.0
    
    db.commit()

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def mark_bulk_attendance(data: BulkAttendanceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only faculty or admin can mark attendance
    if current_user.role not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    for record in data.attendance_data:
        # Find enrollment
        enrollment = db.query(CourseEnrollment).filter(
            CourseEnrollment.student_id == record.student_id,
            CourseEnrollment.course_id == data.course_id
        ).first()
        
        if not enrollment:
            continue
            
        # Check if record already exists for this date
        db_record = db.query(AttendanceRecord).filter(
            AttendanceRecord.enrollment_id == enrollment.enrollment_id,
            AttendanceRecord.class_date == data.class_date
        ).first()
        
        if db_record:
            db_record.status = record.status
            db_record.remarks = record.remarks
        else:
            db_record = AttendanceRecord(
                enrollment_id=enrollment.enrollment_id,
                class_date=data.class_date,
                status=record.status,
                marked_by=current_user.user_id, # Assuming faculty user_id is passed or linked
                remarks=record.remarks
            )
            db.add(db_record)
        
        db.commit()
        update_summary(db, enrollment.enrollment_id)
        
    return {"message": "Attendance marked successfully"}

@router.get("/student/{student_id}", response_model=List[AttendanceSummaryResponse])
def get_student_attendance(student_id: UUID, db: Session = Depends(get_db)):
    summaries = db.query(AttendanceSummary).join(CourseEnrollment).filter(CourseEnrollment.student_id == student_id).all()
    return summaries

@router.get("/course/{course_id}", response_model=List[AttendanceRecordResponse])
def get_course_attendance(course_id: UUID, class_date: date, db: Session = Depends(get_db)):
    records = db.query(AttendanceRecord).join(CourseEnrollment).filter(
        CourseEnrollment.course_id == course_id,
        AttendanceRecord.class_date == class_date
    ).all()
    return records
