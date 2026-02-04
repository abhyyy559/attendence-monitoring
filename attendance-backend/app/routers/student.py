from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.course import Course, CourseEnrollment
from app.models.attendance import AttendanceRecord, AttendanceSummary
from app.models.faculty import Faculty
from app.utils.security import get_current_user
from sqlalchemy.orm import aliased

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.get("/dashboard")
def get_student_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns real attendance data (percentage, shortage status) from the summary table.
    """
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not a student")
    
    student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
    if not student:
        return {
            "overall_percentage": 0,
            "courses": [],
            "student_info": {"roll_number": "N/A", "department": "N/A", "semester": 0}
        }
        
    # Query attendance_summary
    summaries = db.query(AttendanceSummary, Course).join(
        CourseEnrollment, AttendanceSummary.enrollment_id == CourseEnrollment.enrollment_id
    ).join(
        Course, CourseEnrollment.course_id == Course.course_id
    ).filter(CourseEnrollment.student_id == student.student_id).all()
    
    courses_data = []
    total_weighted_percentage = 0
    
    for summary, course in summaries:
        courses_data.append({
            "course_name": course.course_name,
            "course_code": course.course_code,
            "percentage": float(summary.attendance_percentage),
            "shortage": summary.shortage_status,
            "total_classes": summary.total_classes,
            "attended": summary.classes_attended + summary.classes_late
        })
        total_weighted_percentage += summary.attendance_percentage
        
    overall_percentage = (total_weighted_percentage / len(summaries)) if summaries else 0
    
    return {
        "overall_percentage": round(overall_percentage, 2),
        "courses": courses_data,
        "student_info": {
            "roll_number": student.roll_number,
            "department": student.department,
            "semester": student.semester
        },
        "student_id": student.student_id
    }

@router.get("/attendance")
def get_student_attendance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not a student")
    
    student = db.query(Student).filter(Student.user_id == current_user.user_id).first()
    if not student:
        return []
        
    FacultyUser = aliased(User)
    
    records = db.query(
        AttendanceRecord, 
        Course.course_name, 
        FacultyUser.full_name.label("faculty_name")
    ).join(
        CourseEnrollment, AttendanceRecord.enrollment_id == CourseEnrollment.enrollment_id
    ).join(
        Course, CourseEnrollment.course_id == Course.course_id
    ).join(
        Faculty, CourseEnrollment.faculty_id == Faculty.faculty_id
    ).join(
        FacultyUser, Faculty.user_id == FacultyUser.user_id
    ).filter(
        CourseEnrollment.student_id == student.student_id
    ).order_by(AttendanceRecord.class_date.desc()).all()
    
    attendance_list = []
    for r in records:
        attendance_list.append({
            "id": r[0].attendance_id,
            "date": r[0].class_date.isoformat(),
            "course": r[1],
            "status": r[0].status,
            "faculty": r[2]
        })
    
    return attendance_list
