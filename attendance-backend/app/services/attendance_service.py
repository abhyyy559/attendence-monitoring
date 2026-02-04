from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date
from typing import List
from app.models.attendance import AttendanceRecord
from app.models.course import CourseEnrollment
from app.schemas.attendance import AttendanceMark

class AttendanceService:
    @staticmethod
    def mark_attendance(
        db: Session, 
        course_id: UUID, 
        class_date: date, 
        attendance_data: List[AttendanceMark],
        marked_by: UUID
    ):
        """
        Mark attendance for a list of students in a course.
        Note: Percentage calculation is handled by DB triggers.
        """
        for record in attendance_data:
            # Handle both dict and object
            s_id = record.get('student_id') if isinstance(record, dict) else getattr(record, 'student_id', None)
            status = record.get('status') if isinstance(record, dict) else getattr(record, 'status', None)
            remarks = record.get('remarks') if isinstance(record, dict) else getattr(record, 'remarks', None)
            
            if not s_id:
                continue

            # Find enrollment
            enrollment = db.query(CourseEnrollment).filter(
                CourseEnrollment.student_id == s_id,
                CourseEnrollment.course_id == course_id
            ).first()
            
            if not enrollment:
                continue
                
            # Check if record already exists for this date and enrollment
            db_record = db.query(AttendanceRecord).filter(
                AttendanceRecord.enrollment_id == enrollment.enrollment_id,
                AttendanceRecord.class_date == class_date
            ).first()
            
            if db_record:
                db_record.status = status
                db_record.remarks = remarks
                db_record.marked_by = marked_by
            else:
                db_record = AttendanceRecord(
                    enrollment_id=enrollment.enrollment_id,
                    class_date=class_date,
                    status=status,
                    marked_by=marked_by,
                    remarks=remarks
                )
                db.add(db_record)
        
        db.commit()
        return {"message": "Attendance marked successfully"}

attendance_service = AttendanceService()
